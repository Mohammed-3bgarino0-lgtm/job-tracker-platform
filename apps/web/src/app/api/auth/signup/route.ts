import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, phone } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب.' }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create user and initial profile in Prisma
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          phone: phone || null,
          profile: {
            create: {}
          },
          careerProfile: {
            create: {
              headline: 'باحث عن عمل',
              targetTitle: 'فرصة وظيفية'
            }
          }
        },
        include: {
          profile: true,
          careerProfile: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء التسجيل.' }, { status: 500 });
  }
}
