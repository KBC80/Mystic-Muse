
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
    const fileName = 'hanja_full_data.json';
    const fileUrl = getJSONFileUrl(fileName);
    console.log(`Fetching ${fileName} from: ${fileUrl}`); // Log the URL for debugging
    hanjaDataPromise = fetch(fileUrl)
      .then(async response => { // Make this async to await response.text() in case of error
        if (!response.ok) {
          const statusText = response.statusText || (response.status === 404 ? 'Not Found' : 'Error');
          let errorDetails = `Failed to fetch ${fileName}: ${response.status} ${statusText}`;
          try {
            // Try to get response body for more clues, but be careful with large responses
            const body = await response.text();
            errorDetails += `\nResponse body (first 200 chars): ${body.substring(0, 200)}`; 
          } catch (e) {
            // Ignore error from .text() if response is already bad or if body is not text
          }
          console.error(errorDetails); // Log the detailed error
          throw new Error(`데이터 파일(${fileName})을 가져오지 못했습니다. URL: ${fileUrl}, 상태: ${response.status} ${statusText}. 파일 경로와 공개 접근 권한을 확인해주세요.`);
        }
        return response.json();
      })
      .catch(error => {
        // This catch block will handle network errors or errors thrown from the .then block
        console.error(`Error in fetchHanjaData for ${fileName}:`, error.message);
        hanjaDataPromise = null; // Reset promise on error to allow retry
        // Re-throw a more specific error or the original one if it's already informative
        throw new Error(`네트워크 또는 데이터 처리 오류로 ${fileName} 파일을 가져오는 데 실패했습니다. 상세: ${error.message}`);
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
