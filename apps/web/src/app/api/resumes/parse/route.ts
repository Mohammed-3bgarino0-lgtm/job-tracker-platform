import { Prisma } from '@prisma/client';
import {
  calculateOverallConfidence,
  parseResumeText,
} from '@qaddem/shared';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  ResumeFileValidationError,
  validateResumeFile,
} from '@/lib/resume/file-validator';
import { extractRawResumeText } from '@/lib/resume/text-extractor';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileValue = formData.get('file');
    const userIdValue = formData.get('userId');

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        { error: 'ملف السيرة مطلوب.' },
        { status: 400 },
      );
    }

    const userId =
      typeof userIdValue === 'string' ? userIdValue.trim() : '';
    const databaseConfigured = Boolean(process.env.DATABASE_URL);

    if (databaseConfigured && userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!userExists) {
        return NextResponse.json(
          { error: 'المستخدم غير موجود.' },
          { status: 404 },
        );
      }
    }

    const buffer = Buffer.from(await fileValue.arrayBuffer());
    const fileType = validateResumeFile(fileValue, buffer);
    const rawText = await extractRawResumeText(buffer, fileType);

    if (rawText.length < 30) {
      return NextResponse.json(
        {
          error:
            'لم يُستخرج نص كافٍ من السيرة. قد يكون الملف مصورًا ويحتاج إلى OCR.',
          code: 'OCR_REQUIRED',
        },
        { status: 422 },
      );
    }

    const parsedData = parseResumeText(rawText);
    const confidenceScore = calculateOverallConfidence(parsedData);

    if (!databaseConfigured || !userId) {
      return NextResponse.json({
        success: true,
        mode: 'preview',
        canApprove: false,
        databaseConfigured,
        resumeId: null,
        extractionId: null,
        confidenceScore,
        data: parsedData,
        storage: {
          persisted: false,
          message: databaseConfigured
            ? 'تم التحليل للمعاينة فقط. سيُتاح الحفظ بعد تسجيل الدخول.'
            : 'تم التحليل للمعاينة فقط. قاعدة البيانات غير مرتبطة بعد، لذلك لم تُحفظ النتيجة.',
        },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const resume = await tx.resume.create({
        data: {
          userId,
          fileName: fileValue.name,
          fileUrl: null,
          storageKey: null,
          fileSize: fileValue.size,
          mimeType: fileValue.type,
        },
      });

      const extraction = await tx.resumeExtraction.create({
        data: {
          resumeId: resume.id,
          parsedData: parsedData as unknown as Prisma.InputJsonValue,
          confidenceScore,
          isReviewed: false,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'RESUME_PARSED',
          details: {
            resumeId: resume.id,
            extractionId: extraction.id,
            mimeType: fileValue.type,
            fileSize: fileValue.size,
            persistedFile: false,
          },
        },
      });

      return { resume, extraction };
    });

    return NextResponse.json({
      success: true,
      mode: 'persisted',
      canApprove: true,
      databaseConfigured: true,
      resumeId: result.resume.id,
      extractionId: result.extraction.id,
      confidenceScore,
      data: parsedData,
      storage: {
        persisted: false,
        message:
          'تم حفظ نتيجة الاستخراج، بينما ملف السيرة نفسه عولج في الذاكرة فقط.',
      },
    });
  } catch (error) {
    if (error instanceof ResumeFileValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error('Resume parsing failed', error);
    return NextResponse.json(
      { error: 'فشل تحليل السيرة الذاتية.' },
      { status: 500 },
    );
  }
}
