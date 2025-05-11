// src/lib/hanja-utils.ts
import hanjaFullData from './hanja_full_data.json';

export interface HanjaDetail {
  hanja: string;
  reading: string; // The full "음" field, e.g., "넓을 홍"
  description: string;
  strokeCount: number;
}

// Map to store Hanja details indexed by their Korean phonetic syllable
const hanjaMapBySyllable: Map<string, HanjaDetail[]> = new Map();
let isMapInitialized = false;

function initializeHanjaMap() {
  if (isMapInitialized) return;

  for (const [hanjaChar, detailsObj] of Object.entries(hanjaFullData as Record<string, any>)) {
    const fullReading: string = detailsObj.음 || ''; // e.g., "갈 역, 쉬울 이" or "돌이킬 반"
    
    // Split by comma or semicolon for multiple readings, then extract the last word (syllable) of each part.
    const readings = fullReading.split(/,|;/); 
    
    readings.forEach(readingSegment => {
      const trimmedSegment = readingSegment.trim();
      if (!trimmedSegment) return;

      const words = trimmedSegment.split(/\s+/);
      if (words.length > 0) {
        // The Korean phonetic syllable is usually the last word in the reading segment.
        const syllable = words[words.length - 1]; 
        
        // Validate if it's a single Korean character.
        if (syllable && syllable.length === 1 && /^[가-힣]$/.test(syllable)) { 
          const currentList = hanjaMapBySyllable.get(syllable) || [];
          currentList.push({
            hanja: hanjaChar,
            reading: detailsObj.음, // Store the original full "음" field
            description: detailsObj.설명,
            strokeCount: detailsObj.획수,
          });
          hanjaMapBySyllable.set(syllable, currentList);
        }
      }
    });
  }
  isMapInitialized = true;
}

export function findHanjaForSyllable(syllable: string): HanjaDetail[] {
  if (!isMapInitialized) {
    initializeHanjaMap(); // Initialize on first call
  }
  return hanjaMapBySyllable.get(syllable) || [];
}

export function splitKoreanName(name: string): string[] {
  // Basic syllable splitting for Korean names.
  // This will split "홍길동" into ["홍", "길", "동"].
  // It filters out non-Korean characters before splitting.
  return name.replace(/[^가-힣]/g, '').split('');
}
