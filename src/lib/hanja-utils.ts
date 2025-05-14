
// src/lib/hanja-utils.ts
import hanjaFullData from '@/lib/hanja_full_data.json'; // Direct import

export interface HanjaDetail {
  hanja: string;
  specificReading: string;
  description: string;
  strokeCount: number;
}

const hanjaMapBySyllable: Map<string, HanjaDetail[]> = new Map();
let isMapInitialized = false;

function initializeHanjaMap() {
  if (isMapInitialized) return;

  try {
    if (!hanjaFullData || Object.keys(hanjaFullData).length === 0) {
        console.error("한자 데이터가 로드되지 않았거나 비어있습니다.");
        isMapInitialized = false;
        return;
    }
    const data = hanjaFullData as Record<string, any>;
    for (const [hanjaChar, detailsObj] of Object.entries(data)) {
      const originalFullReading: string = detailsObj.음 || '';
      const readingSegments = originalFullReading.split(/,|;/);
      readingSegments.forEach(segment => {
        const trimmedSegment = segment.trim();
        if (!trimmedSegment) return;
        const words = trimmedSegment.split(/\s+/);
        if (words.length > 0) {
          const phoneticSyllable = words[words.length - 1];
          if (phoneticSyllable && phoneticSyllable.length === 1 && /^[가-힣]$/.test(phoneticSyllable)) {
            const currentList = hanjaMapBySyllable.get(phoneticSyllable) || [];
            currentList.push({
              hanja: hanjaChar,
              specificReading: trimmedSegment,
              description: detailsObj.설명,
              strokeCount: detailsObj.획수,
            });
            hanjaMapBySyllable.set(phoneticSyllable, currentList);
          }
        }
      });
    }
    isMapInitialized = true;
    console.log("한자 맵이 성공적으로 초기화되었습니다:", hanjaMapBySyllable.size, "음절.");
  } catch (error) {
    console.error("한자 맵 초기화 실패:", error);
    isMapInitialized = false; 
  }
}

export function findHanjaForSyllable(syllable: string): HanjaDetail[] {
  if (!isMapInitialized) {
    initializeHanjaMap();
  }
  return hanjaMapBySyllable.get(syllable) || [];
}

export function splitKoreanName(name: string): string[] {
  return name.replace(/[^가-힣]/g, '').split('');
}
