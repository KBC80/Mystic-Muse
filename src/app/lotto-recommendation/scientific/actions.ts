
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
  summaryForDisplay: string; 
}

// Helper to fetch a single lotto draw with caching
const fetchLottoDraw = cache(
  async (drawNo: number): Promise<WinningNumberApiData | null> => {
    try {
      const response = await fetch(`${LOTTO_API_URL}${drawNo}`);
      if (!response.ok) {
        // Don't treat as critical error for finding latest draw, just return null
        // console.warn(`API 요청 실패 (회차 ${drawNo}): ${response.status}`);
        return null;
      }
      const data = await response.json() as WinningNumberApiData;
      if (data.returnValue !== 'success') {
        // This means the draw number doesn't exist or there was an issue
        return null; 
      }
      return data;
    } catch (error) {
      // console.error(`API 호출 중 오류 발생 (회차 ${drawNo}):`, error);
      return null;
    }
  },
  ['lotto-draw'],
  { revalidate: 3600 * 3 } // Cache for 3 hours
);


// Get the most recent N draws
async function getMostRecentDraws(count: number): Promise<{ draws: WinningNumber[], latestDrawNo: number }> {
  let latestDrawNo = 0;
  const draws: WinningNumber[] = [];

  // 1. Estimate current draw number
  const now = new Date();
  const startDate = new Date("2002-12-07"); // Lotto Draw 1 date
  const weeksSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  let estimatedCurrentDraw = weeksSinceStart + 1; // Rough estimate

  // 2. Find the actual latest draw number by fetching downwards from estimate + a buffer
  const searchBuffer = 10; // Look a bit ahead of the estimate
  for (let i = 0; i <= searchBuffer * 2; i++) { // Search around estimate
    const drawToTry = estimatedCurrentDraw + searchBuffer - i;
    if (drawToTry <= 0) continue;
    const data = await fetchLottoDraw(drawToTry);
    if (data && data.returnValue === 'success' && data.drwNo) {
      latestDrawNo = data.drwNo;
      break;
    }
  }
  
  if (latestDrawNo === 0) {
     throw new Error("최신 회차 번호를 확인할 수 없습니다. API 서비스 상태를 확인해주세요.");
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
      // If a draw is missing in the sequence (shouldn't happen for recent ones if latestDrawNo is correct)
      console.warn(`회차 ${currentDrawToFetch} 데이터 가져오기 실패 또는 데이터 형식 불일치. (최신회차: ${latestDrawNo})`);
       if (draws.length < count && i < count -1) { // if not enough draws collected and it's not the last one expected
         // This could indicate a problem with the API or our latestDrawNo detection
         // For now, we continue, but this could be an error condition
       }
    }
  }
  if (draws.length === 0 && count > 0) {
    throw new Error(`최신 ${count}회차 당첨 번호를 가져오지 못했습니다. (감지된 최신 회차: ${latestDrawNo})`);
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
  const relevantDraws = processedDraws.slice(0, lastN);
  if (relevantDraws.length === 0) {
    return { averageSum: 0, averageEvenOddRatio: "0:0", summaryForDisplay: "분석할 데이터가 충분하지 않습니다." };
  }

  const totalSum = relevantDraws.reduce((acc, d) => acc + d.sum, 0);
  
  // Calculate mode for even/odd ratio
  const evenOddRatios: { [key: string]: number } = {};
  relevantDraws.forEach(d => {
    const ratioKey = `${d.evenCount}:${d.oddCount}`;
    evenOddRatios[ratioKey] = (evenOddRatios[ratioKey] || 0) + 1;
  });
  let mostCommonRatio = "3:3"; // Default
  let maxCount = 0;
  for (const ratio in evenOddRatios) {
    if (evenOddRatios[ratio] > maxCount) {
      mostCommonRatio = ratio;
      maxCount = evenOddRatios[ratio];
    }
  }
  
  const averageSum = totalSum / relevantDraws.length;
  const averageEvenOddRatio = mostCommonRatio;
  
  const summaryForDisplay = `최근 ${relevantDraws.length}회차 (${relevantDraws[relevantDraws.length-1].drwNo}회 ~ ${relevantDraws[0].drwNo}회) 분석: 평균 번호 합계는 ${averageSum.toFixed(1)}이며, 가장 흔한 짝수:홀수 비율은 ${averageEvenOddRatio}입니다.`;

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
    .map(([numStr, count]) => ({ num: parseInt(numStr), count }))
    .sort((a,b) => b.count - a.count); // Sort by count desc
  
  const frequentNumbers = sortedNumberCounts.slice(0, 7).map(item => `${item.num}(${item.count}회)`).join(', ');
  
  // For infrequent, consider numbers that appeared 0 or 1 time in lastN draws
  const allPossibleNumbers = Array.from({ length: 45 }, (_, i) => i + 1);
  const appearingNumbers = new Set(allNumbers);
  const notAppearedNumbers = allPossibleNumbers.filter(num => !appearingNumbers.has(num));
  
  let infrequentSummary = "";
  if (notAppearedNumbers.length > 0) {
    infrequentSummary = `최근 ${lastN}회 동안 미출현: ${notAppearedNumbers.slice(0,10).join(', ')}${notAppearedNumbers.length > 10 ? ' 등' : ''}`;
  } else {
    const leastFrequent = sortedNumberCounts.slice(-7).reverse().map(item => `${item.num}(${item.count}회)`).join(', ');
    infrequentSummary = `최근 가장 드물게 등장: ${leastFrequent}`;
  }


  let summary = `최근 ${relevantDraws.length}회차 (${relevantDraws[relevantDraws.length-1].drwNo}회 ~ ${relevantDraws[0].drwNo}회) 당첨 번호 분석:\n`;
  summary += `- 평균 당첨 번호 합계: 약 ${averageSum.toFixed(0)} (일반적인 범위: 100-180)\n`;
  summary += `- 가장 흔한 짝수:홀수 비율: ${averageEvenOddRatio}\n`;
  if (frequentNumbers) summary += `- 최근 자주 등장한 숫자(출현횟수): ${frequentNumbers}\n`;
  if (infrequentSummary) summary += `- ${infrequentSummary}\n`;
  
  const lowNumbersCount = relevantDraws.reduce((acc, d) => acc + d.numbers.filter(n => n <= 15).length, 0);
  const midNumbersCount = relevantDraws.reduce((acc, d) => acc + d.numbers.filter(n => n > 15 && n <= 30).length, 0);
  const highNumbersCount = relevantDraws.reduce((acc, d) => acc + d.numbers.filter(n => n > 30).length, 0);
  const totalNumbersAnalyzed = relevantDraws.length * 6;
  
  if (totalNumbersAnalyzed > 0) {
    summary += `- 낮은 숫자(1-15) 출현 비율: 약 ${(lowNumbersCount / totalNumbersAnalyzed * 100).toFixed(0)}%\n`;
    summary += `- 중간 숫자(16-30) 출현 비율: 약 ${(midNumbersCount / totalNumbersAnalyzed * 100).toFixed(0)}%\n`;
    summary += `- 높은 숫자(31-45) 출현 비율: 약 ${(highNumbersCount / totalNumbersAnalyzed * 100).toFixed(0)}%\n`;
  }
  
  // Consecutive numbers
  let consecutivePairs = 0;
  relevantDraws.forEach(d => {
    for (let i = 0; i < d.numbers.length - 1; i++) {
      if (d.numbers[i+1] - d.numbers[i] === 1) {
        consecutivePairs++;
      }
    }
  });
  summary += `- ${lastN}회간 연속번호 출현 쌍: ${consecutivePairs}번 (평균 ${ (consecutivePairs / lastN).toFixed(1)} 쌍/회)\n`;

  return summary;
}


export async function getInitialScientificLottoData(): Promise<{
  recentDraws?: ProcessedWinningNumber[];
  error?: string;
}> {
  try {
    // Fetch 5 for display, they are already sorted newest to oldest by getMostRecentDraws
    const { draws: rawRecentDraws } = await getMostRecentDraws(5); 
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
  averages?: CalculatedAverages; // This will contain the summary for display from 24 draws
  error?: string;
}> {
  try {
    // Fetch last 24 for analysis, sorted newest to oldest
    const { draws: rawDrawsForAnalysis } = await getMostRecentDraws(24); 
    if (rawDrawsForAnalysis.length < 5) { // Need at least some data for meaningful analysis
      return { error: `분석을 위한 과거 당첨 데이터를 충분히 가져올 수 없습니다 (최소 5회차 필요, 현재 ${rawDrawsForAnalysis.length}회차).` };
    }
    const processedDrawsForAnalysis = processRawDraws(rawDrawsForAnalysis);
    
    // Use all available (up to 24) draws for calculating averages and LLM summary
    const numDrawsToAnalyze = processedDrawsForAnalysis.length;
    const averages = calculateAveragesFromProcessed(processedDrawsForAnalysis, numDrawsToAnalyze);
    const historicalDataSummary = generateHistoricalDataSummaryForLLM(processedDrawsForAnalysis, numDrawsToAnalyze);

    const parseNumbers = (str: string | undefined): number[] | undefined => {
      if (!str) return undefined;
      const nums = str.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n >= 1 && n <= 45);
      // Remove duplicates
      return nums.length > 0 ? Array.from(new Set(nums)) : undefined;
    };

    const includeNumbers = parseNumbers(includeNumbersStr);
    const excludeNumbers = parseNumbers(excludeNumbersStr);
    
    if (includeNumbers && includeNumbers.length > 6) {
        return { error: "포함할 숫자는 최대 6개까지 지정할 수 있습니다."};
    }
    if (excludeNumbers && excludeNumbers.length > 39) { // 45 - 6 = 39
        return { error: "제외할 숫자가 너무 많습니다."};
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
    return { llmResponse, averages };

  } catch (error) {
    console.error("Error in getLottoRecommendationsAction:", error);
    return { error: error instanceof Error ? error.message : "로또 번호 추천 중 오류 발생" };
  }
}

    
