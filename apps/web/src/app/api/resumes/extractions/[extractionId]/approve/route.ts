import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const extractedStringFieldSchema = z.object({
  value: z.string().trim().min(1).nullable(),
  confidence: z.number().min(0).max(1),
  sourceText: z.string().nullable(),
});

const extractedNumberFieldSchema = z.object({
  value: z.number().min(0).max(60).nullable(),
  confidence: z.number().min(0).max(1),
  sourceText: z.string().nullable(),
});

const parsedResumeSchema = z.object({
  personalInfo: z.object({
    firstName: extractedStringFieldSchema,
    lastName: extractedStringFieldSchema,
    englishName: extractedStringFieldSchema,
    email: extractedStringFieldSchema,
    phone: extractedStringFieldSchema,
    city: extractedStringFieldSchema,
    country: extractedStringFieldSchema,
    nationality: extractedStringFieldSchema,
  }),
  careerInfo: z.object({
    professionalTitle: extractedStringFieldSchema,
    summary: extractedStringFieldSchema,
    totalYearsExperience: extractedNumberFieldSchema,
  }),
  experiences: z.array(
    z.object({
      company: z.string().trim().min(1).nullable(),
      position: z.string().trim().min(1).nullable(),
      startDate: z.string().trim().min(1).nullable(),
      endDate: z.string().trim().min(1).nullable(),
      isCurrent: z.boolean(),
      description: z.string().trim().min(1).nullable(),
      sourceText: z.string(),
    }),
  ),
  skills: z.array(
    z.object({
      name: z.string().trim().min(1),
      category: z.string().trim().min(1).nullable(),
      sourceText: z.string(),
    }),
  ),
  educations: z.array(
    z.object({
      institution: z.string().trim().min(1).nullable(),
      degree: z.string().trim().min(1).nullable(),
      fieldOfStudy: z.string().trim().min(1).nullable(),
      gpa: z.string().trim().min(1).nullable(),
      sourceText: z.string(),
    }),
  ),
  warnings: z.array(z.string()),
});

const requestSchema = z.object({
  userId: z.string().trim().min(1),
  data: parsedResumeSchema,
});

function parseOptionalDate(value: string | null): Date | null {
  if (!value) return null;

  const normalized = /^\d{4}$/.test(value) ? `${value}-01-01` : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(
  request: Request,
  context: { params: { extractionId: string } },
) {
  try {
    const payload = requestSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        {
          error: 'بيانات المراجعة غير صالحة.',
          issues: payload.error.issues,
        },
        { status: 400 },
      );
    }

    const { userId, data } = payload.data;
    const extractionId = context.params.extractionId;

    const extraction = await prisma.resumeExtraction.findUnique({
      where: { id: extractionId },
      include: {
        resume: {
          select: { userId: true },
        },
      },
    });

    if (!extraction) {
      return NextResponse.json(
        { error: 'سجل الاستخراج غير موجود.' },
        { status: 404 },
      );
    }

    if (extraction.resume.userId !== userId) {
      return NextResponse.json(
        { error: 'لا تملك صلاحية اعتماد هذا السجل.' },
        { status: 403 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.userProfile.upsert({
        where: { userId },
        update: {
          firstName: data.personalInfo.firstName.value,
          lastName: data.personalInfo.lastName.value,
          englishName: data.personalInfo.englishName.value,
          contactEmail: data.personalInfo.email.value,
          phone: data.personalInfo.phone.value,
          city: data.personalInfo.city.value,
          country: data.personalInfo.country.value,
          nationality: data.personalInfo.nationality.value,
        },
        create: {
          userId,
          firstName: data.personalInfo.firstName.value,
          lastName: data.personalInfo.lastName.value,
          englishName: data.personalInfo.englishName.value,
          contactEmail: data.personalInfo.email.value,
          phone: data.personalInfo.phone.value,
          city: data.personalInfo.city.value,
          country: data.personalInfo.country.value,
          nationality: data.personalInfo.nationality.value,
        },
      });

      const careerProfile = await tx.careerProfile.upsert({
        where: { userId },
        update: {
          headline: data.careerInfo.professionalTitle.value,
          summary: data.careerInfo.summary.value,
          totalYearsExperience:
            data.careerInfo.totalYearsExperience.value,
        },
        create: {
          userId,
          headline: data.careerInfo.professionalTitle.value,
          summary: data.careerInfo.summary.value,
          totalYearsExperience:
            data.careerInfo.totalYearsExperience.value,
        },
      });

      await tx.experience.deleteMany({
        where: { careerProfileId: careerProfile.id },
      });
      await tx.education.deleteMany({
        where: { careerProfileId: careerProfile.id },
      });
      await tx.skill.deleteMany({
        where: { careerProfileId: careerProfile.id },
      });

      const experiences = data.experiences.filter(
        (item) => item.company || item.position,
      );
      if (experiences.length) {
        await tx.experience.createMany({
          data: experiences.map((item) => ({
            careerProfileId: careerProfile.id,
            company: item.company,
            role: item.position,
            startDate: parseOptionalDate(item.startDate),
            endDate: parseOptionalDate(item.endDate),
            isCurrent: item.isCurrent,
            description: item.description,
          })),
        });
      }

      if (data.skills.length) {
        await tx.skill.createMany({
          data: data.skills.map((item) => ({
            careerProfileId: careerProfile.id,
            name: item.name,
            category: item.category,
          })),
          skipDuplicates: true,
        });
      }

      const educations = data.educations.filter(
        (item) => item.institution || item.degree,
      );
      if (educations.length) {
        await tx.education.createMany({
          data: educations.map((item) => ({
            careerProfileId: careerProfile.id,
            institution: item.institution,
            degree: item.degree,
            fieldOfStudy: item.fieldOfStudy,
            gpa: item.gpa,
          })),
        });
      }

      await tx.resumeExtraction.update({
        where: { id: extractionId },
        data: {
          parsedData: data as unknown as Prisma.InputJsonValue,
          isReviewed: true,
          reviewedAt: new Date(),
          reviewedByUserId: userId,
        },
      });

      await tx.consentLog.create({
        data: {
          userId,
          consentType: 'RESUME_EXTRACTION_APPROVAL',
          granted: true,
          details: { extractionId },
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'RESUME_EXTRACTION_APPROVED',
          details: { extractionId },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resume extraction approval failed', error);
    return NextResponse.json(
      { error: 'فشل اعتماد بيانات السيرة الذاتية.' },
      { status: 500 },
    );
  }
}
