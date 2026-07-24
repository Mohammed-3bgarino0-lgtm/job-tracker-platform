export type NavigationIconName =
  | 'dashboard'
  | 'jobs'
  | 'applications'
  | 'resume'
  | 'profile'
  | 'searches'
  | 'devices'
  | 'settings';

export interface NavigationItem {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: NavigationIconName;
}

export const primaryNavigation: NavigationItem[] = [
  {
    href: '/dashboard',
    label: 'الرئيسية',
    shortLabel: 'الرئيسية',
    description: 'ملخص رحلتك الوظيفية والخطوات القادمة',
    icon: 'dashboard',
  },
  {
    href: '/jobs',
    label: 'البحث عن وظائف',
    shortLabel: 'الوظائف',
    description: 'البحث الموحد في المصادر الرسمية والمواقع',
    icon: 'jobs',
  },
  {
    href: '/applications',
    label: 'طلبات التوظيف',
    shortLabel: 'طلباتي',
    description: 'متابعة كل طلب ومراحله الزمنية',
    icon: 'applications',
  },
  {
    href: '/resume',
    label: 'السيرة الذاتية',
    shortLabel: 'السيرة',
    description: 'رفع السيرة ومراجعة البيانات المستخرجة',
    icon: 'resume',
  },
  {
    href: '/profile',
    label: 'الملف الوظيفي',
    shortLabel: 'ملفي',
    description: 'الخبرات والتعليم والمهارات والتفضيلات',
    icon: 'profile',
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    href: '/searches',
    label: 'عمليات البحث المحفوظة',
    shortLabel: 'البحث',
    description: 'تنبيهات ومعايير الوظائف المستهدفة',
    icon: 'searches',
  },
  {
    href: '/devices',
    label: 'الأجهزة والإضافات',
    shortLabel: 'الأجهزة',
    description: 'ربط إضافة المتصفح وتطبيقات الجوال',
    icon: 'devices',
  },
  {
    href: '/settings',
    label: 'الإعدادات والخصوصية',
    shortLabel: 'الإعدادات',
    description: 'الموافقات والإشعارات وإدارة البيانات',
    icon: 'settings',
  },
];

export const mobileNavigation = primaryNavigation.slice(0, 5);
