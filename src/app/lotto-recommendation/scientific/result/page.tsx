
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ScientificLottoRecommendationOutput } from '@/ai/flows/scientific-lotto-recommendation-flow';
import { getLottoRecommendationsAction, type CalculatedAverages } from '@/app/lotto-recommendation/scientific/actions';
import { Home, TestTubeDiagonal, Sparkles, Hash, HelpCircle, ExternalLink, RotateCcw } from 'lucide-react';

const getLottoBallColorClass = (number: number): string => {
  if (number >= 1 && number <= 10) return 'bg-yellow-400 text-black';
  if (number >= 11 && number <= 20) return 'bg-blue-500 text-white';
  if (number >= 21 && number <= 30) return 'bg-red-500 text-white';
  if (number >= 31 && number <= 40) return 'bg-gray-600 text-white';
  if (number >= 41 && number <= 45) return 'bg-green-500 text-white';
  return 'bg-gray-300 text-black';
};

const LottoBall = ({ number, size = 'medium' }: { number: number, size?: 'small' | 'medium' }) => {
  const sizeClasses = size === 'small' ? 'h-9 w-9 text-sm' : 'h-10 w-10 text-lg';
  return (
    <div className={`flex items-center justify-center rounded-full font-bold shadow-md ${sizeClasses} ${getLottoBallColorClass(number)}`}>
      {number}
    </div>
  );
};

function ScientificLottoResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [llmResult, setLlmResult] = useState<ScientificLottoRecommendationOutput | null>(null);
  // Averages are not directly used for display here but fetched by the action
  const [analysisAverages, setAnalysisAverages] = useState<CalculatedAverages | null>(null);
  
  const [includeNumbersStr, setIncludeNumbersStr] = useState<string>("");
  const [excludeNumbersStr, setExcludeNumbersStr] = useState<string>("");


  useEffect(() => {
    const includeParam = searchParams.get('includeNumbers');
    const excludeParam = searchParams.get('excludeNumbers');
    
    setIncludeNumbersStr(includeParam || "");
    setExcludeNumbersStr(excludeParam || "");

    getLottoRecommendationsAction({
      includeNumbersStr: includeParam || undefined,
      excludeNumbersStr: excludeParam || undefined,
    })
    .then(result => {
      if (result.error) {
        setError(result.error);
      } else {
        setLlmResult(result.llmResponse || null);
        setAnalysisAverages(result.averages || null); // Store if needed, though not directly displayed on this page.
      }
    })
    .catch(err => {
      console.error("과학적 로또 번호 추천 결과 오류:", err);
      setError(err instanceof Error ? err.message : "과학적 로또 번호 추천 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
    })
    .finally(() => {
      setIsLoading(false);
    });

  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground">AI가 데이터를 분석하여 번호를 생성 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/lotto-recommendation/scientific')} variant="outline" className="mt-4">
          새 추천 시도
        </Button>
      </div>
    );
  }

  if (!llmResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground">결과를 표시할 수 없습니다.</p>
        <Button onClick={() => router.push('/lotto-recommendation/scientific')} variant="outline" className="mt-4">
          새 추천 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" /> AI 분석 기반 추천 번호
          </CardTitle>
           <CardDescription className="text-md pt-1">
              AI가 과거 데이터 통계와 입력하신 조건을 종합적으로 고려하여 추천한 번호 조합입니다.
              {(includeNumbersStr || excludeNumbersStr) && (
                <div className="mt-2 text-xs text-muted-foreground">
                    {includeNumbersStr && <span>포함된 숫자: {includeNumbersStr}</span>}
                    {includeNumbersStr && excludeNumbersStr && <span> / </span>}
                    {excludeNumbersStr && <span>제외된 숫자: {excludeNumbersStr}</span>}
                </div>
              )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Card className="p-6 bg-secondary/30 shadow-md">
              <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-xl text-secondary-foreground flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" /> AI 예측 (다음 회차)
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-1 text-base">
                  <p className="text-muted-foreground">
                      <strong className="text-secondary-foreground">예상 당첨 번호 합계 범위:</strong> {llmResult.predictedSumRange}
                  </p>
                  <p className="text-muted-foreground">
                      <strong className="text-secondary-foreground">예상 짝수:홀수 비율:</strong> {llmResult.predictedEvenOddRatio}
                  </p>
              </CardContent>
          </Card>

          {llmResult.recommendedSets.map((set, index) => (
            <Card key={index} className="p-6 bg-secondary/30 shadow-md">
               <CardHeader className="p-0 pb-3">
                 <CardTitle className="text-xl text-secondary-foreground flex items-center gap-2">
                  <Hash className="h-5 w-5" /> 추천 번호 세트 {index + 1}
                 </CardTitle>
               </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="flex space-x-2 flex-wrap gap-y-2">
                  {set.numbers.map((num) => (
                    <LottoBall key={`${index}-${num}`} number={num} />
                  ))}
                </div>
                <p className="text-base text-muted-foreground whitespace-pre-wrap">
                    <strong className="text-secondary-foreground">AI 추천 근거:</strong> {set.reasoning}
                </p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
      
      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/lotto-recommendation/scientific" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            다른 조건으로 추천받기
          </Button>
        </Link>
        <Link href="/" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </Link>
        <a href="https://dhlottery.co.kr" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            동행복권 사이트 바로가기
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function ScientificLottoResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground">결과 페이지 로딩 중...</p>
      </div>
    }>
      <ScientificLottoResultContent />
    </Suspense>
  );
}
