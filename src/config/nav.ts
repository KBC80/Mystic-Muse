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
    title: '작명 서비스',
    href: '/name-generation',
    icon: Baby,
  },
  {
    title: '운세보기', // Changed from "오늘의 운세"
    href: '/fortune-telling', // New landing page for all fortune services
    icon: Sparkles, // Changed icon
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
    title: '로또 정보',
    href: '/lotto-recommendation',
    icon: Ticket, 
  },
];
