import type { LucideIcon } from 'lucide-react';
import { PenTool, Baby, CalendarHeart, CloudMoon, LayoutGrid, Home } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Name Interpretation',
    href: '/name-interpretation',
    icon: PenTool,
  },
  {
    title: 'Name Generation',
    href: '/name-generation',
    icon: Baby,
  },
  {
    title: 'Today\'s Fortune',
    href: '/todays-fortune',
    icon: CalendarHeart,
  },
  {
    title: 'Dream Interpretation',
    href: '/dream-interpretation',
    icon: CloudMoon,
  },
  {
    title: 'Tarot Reading',
    href: '/tarot-reading',
    icon: LayoutGrid,
  },
];
