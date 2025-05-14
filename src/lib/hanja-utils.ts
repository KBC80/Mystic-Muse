
// src/lib/hanja-utils.ts
import { getJSONFileUrl } from '@/lib/constants';

export interface HanjaDetail {
  hanja: string;
  specificReading: string;
  description: string;
  strokeCount: number;
}

const hanjaMapBySyllable: Map<string, HanjaDetail[]> = new Map();
let isMapInitialized = false;
let hanjaDataPromise: Promise<Record<string, any>> | null = null;

async function fetchHanjaData(): Promise<Record<string, any>> {
  if (!hanjaDataPromise) {
    console.log("Fetching hanja_full_data.json from:", getJSONFileUrl('hanja_full_data.json'));
    hanjaDataPromise = fetch(getJSONFileUrl('hanja_full_data.json'))
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch hanja_full_data.json: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error("Error fetching hanja_full_data.json:", error);
        hanjaDataPromise = null; // Reset promise on error to allow retry
        throw error;
      });
  }
  return hanjaDataPromise;
}

async function initializeHanjaMap() {
  if (isMapInitialized) return;

  try {
    const hanjaFullData = await fetchHanjaData();
    if (!hanjaFullData || Object.keys(hanjaFullData).length === 0) {
        console.error("Hanja data could not be loaded or is empty for map initialization.");
        isMapInitialized = false; // Allow retry
        return;
    }

    for (const [hanjaChar, detailsObj] of Object.entries(hanjaFullData as Record<string, any>)) {
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
    console.log("Hanja map initialized successfully with", hanjaMapBySyllable.size, "syllables.");
  } catch (error) {
    console.error("Failed to initialize Hanja map:", error);
    isMapInitialized = false; // Ensure it can be retried if failed
  }
}

export async function findHanjaForSyllable(syllable: string): Promise<HanjaDetail[]> {
  if (!isMapInitialized) {
    await initializeHanjaMap();
  }
  return hanjaMapBySyllable.get(syllable) || [];
}

export function splitKoreanName(name: string): string[] {
  return name.replace(/[^가-힣]/g, '').split('');
}
