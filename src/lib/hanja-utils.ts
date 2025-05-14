
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
  const fileName = 'hanja_full_data.json';
  const fileUrl = getJSONFileUrl(fileName); // Define fileUrl once here

  if (!hanjaDataPromise) {
    console.log(`Fetching ${fileName} from: ${fileUrl}`);
    hanjaDataPromise = fetch(fileUrl)
      .then(async response => {
        if (!response.ok) {
          let errorDetails = `Failed to fetch ${fileName}: ${response.status} ${response.statusText}. URL: ${fileUrl}`;
          try {
            const body = await response.text();
            errorDetails += `\nResponse body (first 200 chars): ${body.substring(0, 200)}`;
          } catch (e) {
            // Ignore error from .text() if response is already bad or if body is not text
          }
          console.error(errorDetails);
          throw new Error(`데이터 파일(${fileName})을 가져오지 못했습니다. ${errorDetails}. Firebase Storage에서 파일 경로, 공개 접근 권한 및 CORS 설정을 확인해주세요.`);
        }
        return response.json();
      })
      .catch(error => {
        // This catch block will handle network errors or errors thrown from the .then block
        console.error(`네트워크 또는 데이터 처리 오류로 ${fileName} 파일 (${fileUrl})을 가져오는 데 실패했습니다:`, error);
        hanjaDataPromise = null; // Reset promise on error to allow retry
        // If error.message is "Failed to fetch", it's often a CORS or network issue.
        // If it's a different message (like the one from the .then block), it might be a server-side HTTP error.
        const detailMessage = error.message && error.message.includes(`Failed to fetch ${fileName}:`) ? error.message : `상세: ${error.message || '알 수 없는 오류'}`;
        throw new Error(`네트워크 또는 데이터 처리 오류로 ${fileName} 파일 (${fileUrl})을 가져오는 데 실패했습니다. ${detailMessage}. Firebase Storage의 CORS 설정, 파일 공개 접근 권한, 그리고 네트워크 연결을 확인해주세요.`);
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
