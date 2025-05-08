
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { interpretName, type InterpretNameInput, type InterpretNameOutput } from '@/ai/flows/name-interpretation-flow';
import { PenTool, Palette, Users, TrendingUp, Gift, Home, Sparkles, Palmtree, VenetianMask, Brain, Zap, RotateCcw } from 'lucide-react';

const LifeStageIcon = ({ stage }: { stage: string }) => {
  switch (stage) {
    case "초년운": return <Zap className="h-5 w-5 text-yellow-500" />;
    case "중년운": return <TrendingUp className="h-5 w-5 text-green-500" />;
    case "장년운": return <Users className="h-5 w-5 text-blue-500" />;
    case "말년운": return <Palmtree className="h-5 w-5 text-purple-500" />;
    default: return <Sparkles className="h-5 w-5 text-gray-500" />;
  }
};

function NameInterpretationResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretNameOutput | null>(null);
  const [inputName, setInputName] = useState<string>("");

  useEffect(() => {
    const name = searchParams.get('name');
    const birthDate = searchParams.get('birthDate');
    const calendarType = searchParams.get('calendarType') as InterpretNameInput['calendarType'];
    const birthTime = searchParams.get('birthTime');
    const nameType = searchParams.get('nameType') as InterpretNameInput['nameType'];

    if (!name || !birthDate || !calendarType || !birthTime || !nameType) {
      setError("필수 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }
    
    setInputName(name);

    const input: InterpretNameInput = {
      name,
      birthDate,
      calendarType,
      birthTime,
      nameType,
    };

    interpretName(input)
      .then(interpretationResult => {
        setResult(interpretationResult);
      })
      .catch(err => {
        console.error("이름 해석 결과 오류:", err);
        setError(err instanceof Error ? err.message : "이름 해석 결과를 가져오는 중 알 수 없는 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground">당신의 운명을 분석 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTitle>해석 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/name-interpretation')} variant="outline" className="mt-4">
          새 이름 풀이 시도
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <p className="text-muted-foreground">결과를 표시할 수 없습니다.</p>
         <Button onClick={() => router.push('/name-interpretation')} variant="outline" className="mt-4">
          새 이름 풀이 시도
        </Button>
      </div>
    );
  }
  
  const orderedLifeStages: (keyof InterpretNameOutput['lifeStages'])[] = ["초년운", "중년운", "장년운", "말년운"];


  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" /> 이름 풀이 결과 ({inputName}님)
          </CardTitle>
          <CardDescription className="text-md pt-1 flex items-center gap-1">
            <Palmtree className="h-4 w-4 text-green-600"/> 당신의 {result.gapjaYearName} ({result.zodiacColor} {result.zodiacAnimal})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
              <PenTool className="h-6 w-6"/> 이름 종합 분석
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.nameAnalysis}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
              <Brain className="h-6 w-6"/> 주역 팔괘 분석
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">{result.eightTrigramsAnalysis}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
              <TrendingUp className="h-6 w-6"/> 생애 주기별 운세
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orderedLifeStages.map((stage) => (
                <Card key={stage} className="bg-secondary/30">
                  <CardHeader className="pb-2 pt-4 flex flex-row items-center gap-2">
                    <LifeStageIcon stage={stage} />
                    <CardTitle className="text-xl text-primary">{stage}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4"><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.lifeStages[stage]}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
                <Users className="h-6 w-6"/> 좋은 궁합
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">
                <strong className="text-foreground">잘 맞는 띠/방향:</strong> {result.compatibility.zodiacSign}
              </p>
              <div className="text-muted-foreground text-base leading-relaxed">
                <strong className="text-foreground">행운 색상:</strong>
                <div className="flex gap-2 items-center flex-wrap mt-1">
                  {result.compatibility.colors.map(color => (
                    <span key={color} className="inline-block px-3 py-1 text-sm rounded-md bg-accent text-accent-foreground shadow">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-semibold flex items-center gap-2 text-secondary-foreground">
                <Gift className="h-6 w-6"/> 행운의 숫자
              </h3>
              <div className="flex space-x-3">
                {result.luckyNumbers.map((num) => (
                  <span key={num} className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl shadow-lg">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/name-interpretation" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            다른 이름 풀이하기
          </Button>
        </Link>
        <Link href="/" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function NameInterpretationResultPage() {
  return (
    // Suspense fallback은 로딩 상태를 더 부드럽게 만듭니다.
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] p-6">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-lg text-muted-foreground">결과 페이지 로딩 중...</p>
      </div>
    }>
      <NameInterpretationResultContent />
    </Suspense>
  );
}
