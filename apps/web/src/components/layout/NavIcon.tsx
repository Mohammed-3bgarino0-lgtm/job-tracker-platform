import type { SVGProps } from 'react';
import type { NavigationIconName } from '@/lib/navigation';

interface NavIconProps extends SVGProps<SVGSVGElement> {
  name: NavigationIconName;
}

const paths: Record<NavigationIconName, React.ReactNode> = {
  dashboard: (
    <>
      <path d="M3 3h7v7H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 14h7v7H3z" />
    </>
  ),
  jobs: (
    <>
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 11h18M10 11v2h4v-2" />
    </>
  ),
  applications: (
    <>
      <path d="M9 5h6M9 9h6M9 13h4" />
      <path d="M7 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l6-6V5a2 2 0 0 0-2-2h-2" />
      <path d="M15 21v-4a2 2 0 0 1 2-2h4" />
    </>
  ),
  resume: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5M9 12h6M9 16h6M9 8h2" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22a8 8 0 0 1 16 0" />
    </>
  ),
  searches: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4M11 7v8M7 11h8" />
    </>
  ),
  devices: (
    <>
      <rect x="2" y="4" width="14" height="11" rx="2" />
      <path d="M7 20h4M9 15v5" />
      <rect x="17" y="8" width="5" height="12" rx="1.5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2V9.6h.1A1.7 1.7 0 0 0 3.6 8a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8 3.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2h4v.1A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
};

export function NavIcon({ name, ...props }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
