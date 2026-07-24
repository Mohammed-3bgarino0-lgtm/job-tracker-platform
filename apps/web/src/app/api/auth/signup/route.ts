import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value ? value : null));

const signupSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  name: optionalText(120),
  phone: optionalText(30),
});

export async function POST(request: Request) {
  try {
    const parsed = signupSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'بيانات التسجيل غير صالحة.',
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const { email, name, phone } = parsed.data;
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        careerProfile: true,
      },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        created: false,
        user: existingUser,
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        profile: {
          create: {},
        },
        careerProfile: {
          create: {},
        },
      },
      include: {
        profile: true,
        careerProfile: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        created: true,
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل.' },
        { status: 409 },
      );
    }

    console.error('Signup error', error);
    return NextResponse.json(
      { error: 'تعذر إنشاء المستخدم حاليًا.' },
      { status: 500 },
    );
  }
}
