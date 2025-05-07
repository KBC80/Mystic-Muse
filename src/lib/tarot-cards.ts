// Based on a standard 78-card Rider-Waite deck, slightly modified to 76 as per request.
// Two cards will be omitted for this example, e.g., two minor arcana cards.
// In a real scenario, clarification on which 76 cards would be needed.

export const tarotCardNames: string[] = [
  // Major Arcana (22 cards)
  "바보", "마법사", "고위 여사제", "여제", "황제",
  "교황", "연인", "전차", "힘", "은둔자",
  "운명의 수레바퀴", "정의", "매달린 남자", "죽음", "절제",
  "악마", "탑", "별", "달", "태양",
  "심판", "세계",

  // Minor Arcana - Wands (14 cards)
  "완드 에이스", "완드 2", "완드 3", "완드 4", "완드 5",
  "완드 6", "완드 7", "완드 8", "완드 9", "완드 10",
  "완드 시종", "완드 기사", "완드 여왕", "완드 왕",

  // Minor Arcana - Cups (14 cards)
  "컵 에이스", "컵 2", "컵 3", "컵 4", "컵 5",
  "컵 6", "컵 7", "컵 8", "컵 9", "컵 10",
  "컵 시종", "컵 기사", "컵 여왕", "컵 왕",

  // Minor Arcana - Swords (14 cards)
  "검 에이스", "검 2", "검 3", "검 4", "검 5",
  "검 6", "검 7", "검 8", "검 9", "검 10",
  "검 시종", "검 기사", "검 여왕", "검 왕",

  // Minor Arcana - Pentacles (12 cards - reduced by 2 to meet 76 card total)
  // Omitting Two of Pentacles and Three of Pentacles for this example
  "펜타클 에이스", /*"펜타클 2", "펜타클 3",*/ "펜타클 4", "펜타클 5",
  "펜타클 6", "펜타클 7", "펜타클 8", "펜타클 9", "펜타클 10",
  "펜타클 시종", "펜타클 기사", "펜타클 여왕", "펜타클 왕",
];

if (tarotCardNames.length !== 76) { 
  console.warn(`76개의 타로 카드가 필요하지만 ${tarotCardNames.length}개를 찾았습니다. 제공된 목록은 이 예제를 위해 74개의 고유한 카드로 조정되었습니다. 전체 76개를 사용하려면 정확한 목록을 제공하거나 펜타클 또는 다른 슈트에서 어떤 두 개의 마이너 아르카나 카드를 다시 추가할지 지정하십시오.`);
}


export interface TarotCard {
  id: string;
  name: string;
  imageUrl: string;
  dataAiHint: string;
  isFaceUp: boolean;
}

// Generate a deck of 76 cards
export function generateDeck(): TarotCard[] {
  return tarotCardNames.map((name, index) => ({
    id: `card-${index}-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    // Using picsum for placeholder images. In a real app, these would be actual card images.
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}/200/300`, // Use encodeURIComponent for names with special characters
    dataAiHint: `타로 ${name.toLowerCase()}`,
    isFaceUp: false,
  }));
}
