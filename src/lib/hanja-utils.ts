
// src/lib/hanja-utils.ts
export interface HanjaDetail {
  hanja: string;
  specificReading: string;
  description: string;
  strokeCount: number;
}

const hanjaMapBySyllable: Map<string, HanjaDetail[]> = new Map();
let hanjaDataPromise: Promise<void> | null = null;

async function fetchAndProcessHanjaData(fileName: string): Promise<any> {
  const response = await fetch(`/${fileName}`); // public 폴더의 파일을 fetch
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch ${fileName}: ${response.status} ${response.statusText}`, errorText.substring(0, 200));
    throw new Error(`네트워크 오류 또는 파일을 찾을 수 없어 ${fileName} 파일을 가져오는 데 실패했습니다. (상태: ${response.status})`);
  }
  try {
    return await response.json();
  } catch (e) {
    console.error(`Error parsing JSON from ${fileName}:`, e);
    const text = await response.text(); // Try to get text if JSON parsing fails
    console.error("Response text:", text.substring(0,500));
    throw new Error(`${fileName} 파일의 JSON 형식이 올바르지 않습니다.`);
  }
}


function initializeHanjaMap(): Promise<void> {
  if (!hanjaDataPromise) {
    console.log("Fetching hanja_full_data.json from public folder...");
    hanjaDataPromise = fetchAndProcessHanjaData('hanja_full_data.json')
      .then(data => {
        if (!data || Object.keys(data).length === 0) {
            console.error("한자 데이터가 로드되지 않았거나 비어있습니다.");
            throw new Error("한자 데이터 로드 실패: 파일이 비어있거나 로드되지 않았습니다.");
        }
        for (const [hanjaChar, detailsObj] of Object.entries(data as Record<string, any>)) {
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
        console.log("한자 맵이 성공적으로 초기화되었습니다:", hanjaMapBySyllable.size, "음절.");
      })
      .catch(error => {
        console.error("한자 맵 초기화 실패:", error);
        hanjaDataPromise = null; // Reset promise on error to allow retry
        throw error; // Re-throw error to be caught by caller
      });
  }
  return hanjaDataPromise;
}

export async function findHanjaForSyllable(syllable: string): Promise<HanjaDetail[]> {
  try {
    await initializeHanjaMap();
    return hanjaMapBySyllable.get(syllable) || [];
  } catch (error) {
    console.error(`음절 "${syllable}"에 대한 한자 찾기 실패:`, error);
    return []; // 오류 발생 시 빈 배열 반환 또는 오류를 다시 throw 할 수 있음
  }
}

export function splitKoreanName(name: string): string[] {
  return name.replace(/[^가-힣]/g, '').split('');
}
