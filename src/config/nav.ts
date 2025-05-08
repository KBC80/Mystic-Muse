import type { LucideIcon } from 'lucide-react';
import { PenTool, Baby, CalendarHeart, CloudMoon, LayoutGrid, Home, Ticket, TestTubeDiagonal } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
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
    title: '사주 로또 추천',
    href: '/lotto-recommendation/saju',
    icon: Ticket, // Or a more Saju-related icon if available
  },
  {
    title: '과학적 로또 추천',
    href: '/lotto-recommendation/scientific',
    icon: TestTubeDiagonal, // Or a BarChart icon
  },
];
