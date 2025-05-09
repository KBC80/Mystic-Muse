import type { LucideIcon } from 'lucide-react';
import { PenTool, Baby, CloudMoon, LayoutGrid, Home, Ticket, Sparkles, Star, TrendingUp, CalendarHeart } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  subItems?: NavItem[]; 
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
    title: '작명 도우미',
    href: '/name-generation',
    icon: Baby,
  },
  {
    title: '운세보기', 
    href: '/fortune-telling', 
    icon: Sparkles, 
  },
  {
    title: '꿈 해몽',
    href: '/dream-interpretation',
    icon: CloudMoon,
  },
  // {
  //   title: '타로 운세', 
  //   href: '/tarot-reading', 
  //   icon: LayoutGrid,
  // }, // Removed as per user request
  {
    title: '로또 정보',
    href: '/lotto-recommendation',
    icon: Ticket, 
  },
];



