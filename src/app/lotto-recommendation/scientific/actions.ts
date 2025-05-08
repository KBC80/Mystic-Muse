
'use server';

import { unstable_cache as cache } from 'next/cache';
import { recommendScientificLottoNumbers, type ScientificLottoRecommendationInput, type ScientificLottoRecommendationOutput } from '@/ai/flows/scientific-lotto-recommendation-flow';

const LOTTO_API_URL = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";

interface WinningNumberApiData {
  returnValue: string;
  totSellamnt?: number;
  drwNoDate?: string;
  firstWinamnt?: number;
  drwtNo6?: number;
  drwtNo4?: number;
  firstPrzwnerCo?: number;
  drwtNo5?: number;
  bnusNo?: number;
  firstAccumamnt?: number;
  drwNo?: number;
  drwtNo2?: number;
  drwtNo3?: number;
  drwtNo1?: number;
}

export interface WinningNumber {
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
}

export interface ProcessedWinningNumber extends WinningNumber {
  numbers: number[];
  sum: number;
  evenCount: number;
  oddCount: number;
}

export interface CalculatedAverages {
  averageSum: number;
  averageEvenOddRatio: string;
  summaryForDisplay: string; // Summary to show on UI about the 24 draws analysis
}

// Helper to fetch a single lotto draw with caching
const fetchLottoDraw = cache(
  async (drawNo: number): Promise<WinningNumberApiData | null> => {
    try {
      const response = await fetch(`${LOTTO_API_URL}${drawNo}`, {
        // next: { revalidate: 3600 * 6 } // Cache for 6 hours
      });
      if (!response.ok) {
        console.error(`API 요청 실패 (회차 ${drawNo}): ${response.status}`);
        return null;
      }
      const data = await response.json() as WinningNumberApiData;
      return data;
    } catch (error) {
      console.error(`API 호출 중 오류 발생 (회차 ${drawNo}):`, error);
      return null;
    }
  },
  ['lotto-draw'], // Cache key prefix
  { revalidate: 3600 * 6 } // Revalidate every 6 hours
);


// Get the most recent N draws
async function getMostRecentDraws(count: number): Promise<{ draws: WinningNumber[], latestDrawNo: number }> {
  let latestDrawNo = 0;
  const draws: WinningNumber[] = [];

  // 1. Estimate current draw number (very rough estimation)
  // A draw is every Saturday.
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
  let weekOfYear = Math.ceil(days / 7);
  
  // Reference: Draw 1 was 2002-12-07.
  // This estimation is not perfect but gives a starting point.
  let estimatedCurrentDraw = (now.getFullYear() - 2002) * 52 + weekOfYear;


  // 2. Find the actual latest draw number by fetching downwards
  let attempts = 0;
  const maxAttempts = 20; // Try up to 20 draws back from estimate
  for (let i = 0; i < maxAttempts; i++) {
    const drawToTry = estimatedCurrentDraw - i;
    if (drawToTry <= 0) break;
    const data = await fetchLottoDraw(drawToTry);
    if (data && data.returnValue === 'success' && data.drwNo) {
      latestDrawNo = data.drwNo;
      break;
    }
    attempts++;
  }

  if (latestDrawNo === 0) {
    // Fallback if estimation failed badly, try a known recent high number
    // This should be updated periodically or fetched from a more reliable source if possible
    const fallbackRecentHighDraw = 1125; // Example: as of late June 2024
    for (let i = 0; i < maxAttempts; i++) {
        const drawToTry = fallbackRecentHighDraw - i;
        if (drawToTry <= 0) break;
        const data = await fetchLottoDraw(drawToTry);
        if (data && data.returnValue === 'success' && data.drwNo) {
          latestDrawNo = data.drwNo;
          break;
        }
    }
    if (latestDrawNo === 0) {
         throw new Error("최신 회차 번호를 확인할 수 없습니다.");
    }
  }

  // 3. Fetch 'count' draws downwards from the latest
  for (let i = 0; i < count; i++) {
    const currentDrawToFetch = latestDrawNo - i;
    if (currentDrawToFetch <= 0) break;
    const data = await fetchLottoDraw(currentDrawToFetch);
    if (data && data.returnValue === 'success' &&
        data.drwNo && data.drwNoDate &&
        data.drwtNo1 && data.drwtNo2 && data.drwtNo3 &&
        data.drwtNo4 && data.drwtNo5 && data.drwtNo6 && data.bnusNo
    ) {
      draws.push({
        drwNo: data.drwNo,
        drwNoDate: data.drwNoDate,
        drwtNo1: data.drwtNo1,
        drwtNo2: data.drwtNo2,
        drwtNo3: data.drwtNo3,
        drwtNo4: data.drwtNo4,
        drwtNo5: data.drwtNo5,
        drwtNo6: data.drwtNo6,
        bnusNo: data.bnusNo,
      });
    } else {
      // If a draw is missing or fails, stop or log, depending on desired strictness
      console.warn(`회차 ${currentDrawToFetch} 데이터 가져오기 실패 또는 데이터 형식 불일치.`);
    }
  }
  return { draws, latestDrawNo };
}

function processRawDraws(rawDraws: WinningNumber[]): ProcessedWinningNumber[] {
  return rawDraws.map(d => {
    const numbers = [d.drwtNo1, d.drwtNo2, d.drwtNo3, d.drwtNo4, d.drwtNo5, d.drwtNo6].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    const evenCount = numbers.filter(n => n % 2 === 0).length;
    const oddCount = 6 - evenCount;
    return { ...d, numbers, sum, evenCount, oddCount };
  });
}

function calculateAveragesFromProcessed(processedDraws: ProcessedWinningNumber[], lastN: number): CalculatedAverages {
  const relevantDraws = processedDraws.slice(0, lastN); // Assuming draws are sorted newest to oldest
  if (relevantDraws.length === 0) {
    return { averageSum: 0, averageEvenOddRatio: "0:0", summaryForDisplay: "분석할 데이터가 충분하지 않습니다." };
  }

  const totalSum = relevantDraws.reduce((acc, d) => acc + d.sum, 0);
  const totalEven = relevantDraws.reduce((acc, d) => acc + d.evenCount, 0);
  const totalOdd = relevantDraws.reduce((acc, d) => acc + d.oddCount, 0);
  
  const averageSum = totalSum / relevantDraws.length;
  // Average counts, then form ratio string
  const avgEven = totalEven / relevantDraws.length;
  const avgOdd = totalOdd / relevantDraws.length;

  // Simplify ratio (e.g. 2.5:3.5 -> 5:7 if possible, or just round)
  const roundedAvgEven = Math.round(avgEven);
  const roundedAvgOdd = Math.round(avgOdd);
  const finalEven = Math.max(0, roundedAvgEven); // Ensure non-negative
  const finalOdd = Math.max(0, 6 - finalEven); // Ensure total is 6

  const averageEvenOddRatio = `${finalEven}:${finalOdd}`;
  
  const summaryForDisplay = `최근 ${relevantDraws.length}회차를 분석한 결과, 평균 번호 합계는 ${averageSum.toFixed(2)}이며, 평균적인 짝수:홀수 비율은 약 ${averageEvenOddRatio}입니다.`;

  return { averageSum, averageEvenOddRatio, summaryForDisplay };
}


function generateHistoricalDataSummaryForLLM(processedDraws: ProcessedWinningNumber[], lastN: number): string {
  const relevantDraws = processedDraws.slice(0, lastN);
  if (relevantDraws.length === 0) return "분석할 과거 데이터가 부족합니다.";

  const { averageSum, averageEvenOddRatio } = calculateAveragesFromProcessed(processedDraws, lastN);

  const allNumbers = relevantDraws.flatMap(d => d.numbers);
  const numberCounts: { [key: number]: number } = {};
  allNumbers.forEach(num => {
    numberCounts[num] = (numberCounts[num] || 0) + 1;
  });

  const sortedNumberCounts = Object.entries(numberCounts)
    .sort(([,a],[,b]) => b-a);
  
  const frequentNumbers = sortedNumberCounts.slice(0, 5).map(([num]) => num).join(', ');
  const infrequentNumbers = sortedNumberCounts.slice(-5).map(([num]) => num).join(', ');

  // This is a simplified summary. More complex patterns could be added.
  let summary = `최근 ${relevantDraws.length}회차의 당첨 번호 분석 결과입니다:\n`;
  summary += `- 평균 당첨 번호 합계: 약 ${averageSum.toFixed(0)}\n`;
  summary += `- 평균적인 짝수:홀수 비율: 약 ${averageEvenOddRatio}\n`;
  if (frequentNumbers) summary += `- 최근 자주 등장한 숫자들: ${frequentNumbers}\n`;
  if (infrequentNumbers) summary += `- 최근 드물게 등장한 숫자들: ${infrequentNumbers}\n`;
  
  const lowNumbersCount = relevantDraws.reduce((acc, d) => acc + d.numbers.filter(n => n <= 15).length, 0);
  const midNumbersCount = relevantDraws.reduce((acc, d) => acc + d.numbers.filter(n => n > 15 && n <= 30).length, 0);
  const highNumbersCount = relevantDraws.reduce((acc, d) => acc + d.numbers.filter(n => n > 30).length, 0);
  const totalNumbersAnalyzed = relevantDraws.length * 6;
  
  if (totalNumbersAnalyzed > 0) {
    summary += `- 낮은 숫자(1-15) 출현 비율: 약 ${(lowNumbersCount / totalNumbersAnalyzed * 100).toFixed(0)}%\n`;
    summary += `- 중간 숫자(16-30) 출현 비율: 약 ${(midNumbersCount / totalNumbersAnalyzed * 100).toFixed(0)}%\n`;
    summary += `- 높은 숫자(31-45) 출현 비율: 약 ${(highNumbersCount / totalNumbersAnalyzed * 100).toFixed(0)}%\n`;
  }

  return summary;
}


export async function getInitialScientificLottoData(): Promise<{
  recentDraws?: ProcessedWinningNumber[];
  error?: string;
}> {
  try {
    const { draws: rawRecentDraws } = await getMostRecentDraws(10); // Fetch 10 for display
    if (rawRecentDraws.length === 0) {
      return { error: "최근 당첨 번호를 가져올 수 없습니다." };
    }
    const processedRecentDraws = processRawDraws(rawRecentDraws);
    return { recentDraws: processedRecentDraws };
  } catch (error) {
    console.error("Error in getInitialScientificLottoData:", error);
    return { error: error instanceof Error ? error.message : "데이터를 가져오는 중 오류 발생" };
  }
}

interface GetLottoRecommendationsActionInput {
  includeNumbersStr?: string;
  excludeNumbersStr?: string;
}

export async function getLottoRecommendationsAction({
  includeNumbersStr,
  excludeNumbersStr,
}: GetLottoRecommendationsActionInput): Promise<{
  llmResponse?: ScientificLottoRecommendationOutput;
  averages?: CalculatedAverages;
  drawsForAnalysis?: ProcessedWinningNumber[]; // For potential UI display of what was analyzed
  error?: string;
}> {
  try {
    const { draws: rawDrawsForAnalysis } = await getMostRecentDraws(24); // Fetch last 24 for analysis
    if (rawDrawsForAnalysis.length < 24) {
      return { error: "분석을 위한 충분한 과거 당첨 데이터를 가져올 수 없습니다 (24회차 필요)." };
    }
    const processedDraws = processRawDraws(rawDrawsForAnalysis);
    
    const averages = calculateAveragesFromProcessed(processedDraws, 24);
    const historicalDataSummary = generateHistoricalDataSummaryForLLM(processedDraws, 24);

    const parseNumbers = (str: string | undefined): number[] | undefined => {
      if (!str) return undefined;
      const nums = str.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n >= 1 && n <= 45);
      return nums.length > 0 ? nums : undefined;
    };

    const includeNumbers = parseNumbers(includeNumbersStr);
    const excludeNumbers = parseNumbers(excludeNumbersStr);
    
    // Basic validation, could be more robust
    if (includeNumbers && includeNumbers.some(n => n < 1 || n > 45)) {
        return { error: "포함할 숫자는 1과 45 사이여야 합니다." };
    }
    if (excludeNumbers && excludeNumbers.some(n => n < 1 || n > 45)) {
        return { error: "제외할 숫자는 1과 45 사이여야 합니다." };
    }
     if (includeNumbers && excludeNumbers && includeNumbers.some(n => excludeNumbers.includes(n))) {
        return { error: "포함할 숫자와 제외할 숫자에 중복된 값이 있습니다." };
    }


    const input: ScientificLottoRecommendationInput = {
      historicalDataSummary: historicalDataSummary,
      includeNumbers: includeNumbers,
      excludeNumbers: excludeNumbers,
    };

    const llmResponse = await recommendScientificLottoNumbers(input);
    return { llmResponse, averages, drawsForAnalysis: processedDraws.slice(0,10) }; // Return averages and first 10 draws for display

  } catch (error) {
    console.error("Error in getLottoRecommendationsAction:", error);
    return { error: error instanceof Error ? error.message : "로또 번호 추천 중 오류 발생" };
  }
}
