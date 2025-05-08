import type { LucideIcon } from 'lucide-react';
import { PenTool, Baby, CalendarHeart, CloudMoon, LayoutGrid, Home, Ticket, TestTubeDiagonal } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  subItems?: NavItem[]; // For nested navigation if needed in the future
}

export const navItems: NavItem[] = [
  {
    title: '홈',
    href: '/',
    icon: Home,
  },
  {
    title: '이름 풀이',
    href: '/name-interpretation',
    icon: PenTool,
  },
  {
    title: '작명 서비스',
    href: '/name-generation',
    icon: Baby,
  },
  {
    title: '오늘의 운세',
    href: '/todays-fortune',
    icon: CalendarHeart,
  },
  {
    title: '꿈 해몽',
    href: '/dream-interpretation',
    icon: CloudMoon,
  },
  {
    title: '타로 리딩',
    href: '/tarot-reading',
    icon: LayoutGrid,
  },
  {
    title: '로또 번호 추천', // This now points to the landing page
    href: '/lotto-recommendation',
    icon: Ticket,
  },
  // Sub-items for lotto can be managed on the /lotto-recommendation page itself
  // Or, if you want them in the sidebar directly, you can define them like this (currently not used by sidebar logic)
  // {
  //   title: '사주 로또 추천',
  //   href: '/lotto-recommendation/saju',
  //   icon: Ticket, 
  // },
  // {
  //   title: '과학적 로또 추천',
  //   href: '/lotto-recommendation/scientific',
  //   icon: TestTubeDiagonal, 
  // },
];
