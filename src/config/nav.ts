import type { LucideIcon } from 'lucide-react';
import { PenTool, Baby, CalendarHeart, CloudMoon, LayoutGrid, Home, Ticket, Archive } from 'lucide-react';

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
    title: '로또 정보', // Updated title to be more general
    href: '/lotto-recommendation', // Points to the landing page for Saju, Scientific, and History
    icon: Ticket, 
  },
  // 역대 당첨번호 조회는 /lotto-recommendation 페이지 내에서 접근 가능하므로,
  // 별도의 최상위 메뉴로 추가하지 않거나, 필요시 subItems 형태로 구성할 수 있습니다.
  // 현재 요청은 /lotto-recommendation 랜딩 페이지에 카드를 추가하는 것이므로,
  // 여기서는 navItem을 그대로 둡니다.
];
