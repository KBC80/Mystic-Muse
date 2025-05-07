// Based on a standard 78-card Rider-Waite deck, slightly modified to 76 as per request.
// Two cards will be omitted for this example, e.g. two minor arcana cards.
// In a real scenario, clarification on which 76 cards would be needed.

export const tarotCardNames: string[] = [
  // Major Arcana (22 cards)
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World",

  // Minor Arcana - Wands (14 cards)
  "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands",
  "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands",
  "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",

  // Minor Arcana - Cups (14 cards)
  "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups",
  "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
  "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",

  // Minor Arcana - Swords (14 cards)
  "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords",
  "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords",
  "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",

  // Minor Arcana - Pentacles (12 cards - reduced by 2 to meet 76 card total)
  // Omitting Two of Pentacles and Three of Pentacles for this example
  "Ace of Pentacles", /*"Two of Pentacles", "Three of Pentacles",*/ "Four of Pentacles", "Five of Pentacles",
  "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles",
  "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles",
];

// Ensure the total count is 76
// 22 (Major) + 14 (Wands) + 14 (Cups) + 14 (Swords) + 12 (Pentacles) = 76
if (tarotCardNames.length !== 76) { // Ace of Pentacles, Four to Ten of Pentacles (7), Page, Knight, Queen, King (4) = 1 + 7 + 4 = 12
  console.warn(`Expected 76 tarot cards, but found ${tarotCardNames.length}. The provided list has been adjusted to 74 unique cards for this example. For the full 76, please provide the exact list or specify which two minor arcana cards to add back from Pentacles or other suits.`);
  // The above list has 74 cards (Ace of Pentacles, Four to Ten of Pentacles (7 cards), Page, Knight, Queen, King of Pentacles (4 cards). Total = 1+7+4 = 12. 22+14+14+14+12=76)
  // Let's correct the above list to have 76.
  // It was 22 Major + 4*14 = 56 Minor = 78. Need to remove 2.
  // The comment states 12 Pentacles, which is 14-2.  1 (Ace) + 7 (Four to Ten) + 4 (Courts) = 12. This math is correct.
  // The actual array above lists 74 by commenting out Two and Three of Pentacles.
  // Ace of Wands to King of Wands is 14.
  // Ace of Cups to King of Cups is 14.
  // Ace of Swords to King of Swords is 14.
  // Ace of Pentacles, Four of Pentacles, Five of Pentacles, Six of Pentacles, Seven of Pentacles, Eight of Pentacles, Nine of Pentacles, Ten of Pentacles (8 cards)
  // Page of Pentacles, Knight of Pentacles, Queen of Pentacles, King of Pentacles (4 cards).
  // So Pentacles have 1 + 7 (from Four to Ten) + 4 = 12.
  // Total = 22 + 14+14+14+12 = 76. The list is correct as written with the comments. The `if` condition is wrong. It should be `tarotCardNames.length !== 76`
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
    imageUrl: `https://picsum.photos/seed/${name.toLowerCase().replace(/\s+/g, '-')}/200/300`,
    dataAiHint: `tarot ${name.toLowerCase()}`,
    isFaceUp: false,
  }));
}
