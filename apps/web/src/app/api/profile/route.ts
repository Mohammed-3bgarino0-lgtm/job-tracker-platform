import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        careerProfile: {
          include: {
            experiences: true,
            educations: true,
            skills: true,
            certs: true,
            languages: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Fetch Profile Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء جلب الملف الوظيفي.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, phone, city, nationality, targetTitle, headline } = body;

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        profile: {
          upsert: {
            create: { city, nationality },
            update: { city, nationality }
          }
        },
        careerProfile: {
          upsert: {
            create: { targetTitle: targetTitle || 'فرصة وظيفية', headline: headline || 'باحث عن عمل' },
            update: { targetTitle, headline }
          }
        }
      },
      include: {
        profile: true,
        careerProfile: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Save Profile Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء حفظ الملف الوظيفي.' }, { status: 500 });
  }
}
