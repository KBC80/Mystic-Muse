
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { interpretName, type InterpretNameInput, type InterpretNameOutput } from '@/ai/flows/name-interpretation-flow';
import { Home, Sparkles, User, CalendarDays, Clock, Info, Palette, BookOpen, TrendingUp, Mic, Gem, Filter, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";

const SectionCard: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; className?: string }> = ({ title, icon: Icon, children, className }) => (
  <Card className={cn("bg-secondary/20 shadow", className)}>
    <CardHeader className="pb-3 pt-4">
      <CardTitle className="text-xl text-primary flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const ScoreDisplay: React.FC<{ score: number; maxScore: number; label: string }> = ({ score, maxScore, label }) => (
  <div className="flex justify-between items-center text-sm py-1">
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-semibold text-foreground">{score} / {maxScore}점</span>
  </div>
);


function NameInterpretationResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretNameOutput | null>(null);
  
  useEffect(() => {
    const name = searchParams.get('name');
    const birthDate = searchParams.get('birthDate');
    const calendarType = searchParams.get('calendarType') as InterpretNameInput['calendarType'];
    const birthTime = searchParams.get('birthTime');
    const gender = searchParams.get('gender') as InterpretNameInput['gender'];
    // 자녀 순위와 출생지는 이제 선택 사항이 아니므로 URL에서 가져오지 않습니다.
    // const childOrder = searchParams.get('childOrder') || undefined;
    // const birthPlace = searchParams.get('birthPlace') || undefined;

    if (!name || !birthDate || !calendarType || !birthTime || !gender) {
      setError("필수 정보가 누락되었습니다. 다시 시도해주세요.");
      setIsLoading(false);
      return;
    }

    const input: InterpretNameInput = {
      name, birthDate, calendarType, birthTime, gender
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
        <p className="mt-4 text-lg text-muted-foreground">이름의 깊은 의미를 분석 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertTriangle className="h-5 w-5"/>
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
  
  const { 
    basicInfoSummary: bis, 
    overallScoreAndEvaluation: ose,
    eumYangOhaengAnalysis: eyoa,
    eumYangHarmonyAnalysis: eyha,
    suriGilhyungAnalysis: sga,
    pronunciationOhaengAnalysis: poa,
    resourceOhaengAnalysis: roa,
    hanjaFilteringAnalysis: hfa,
    finalOverallEvaluation: foe
  } = result;

  return (
    <div className="space-y-8 py-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" /> {bis.koreanName} {bis.hanjaName && `(${bis.hanjaName})`}님의 이름 풀이
          </CardTitle>
          <CardDescription className="text-md pt-1">
            제공해주신 정보를 바탕으로 AI가 분석한 상세 이름 풀이 결과입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 1. 기본 정보 요약 */}
          <SectionCard title="기본 정보 요약" icon={Info}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p><strong className="text-foreground">이름(한글):</strong> {bis.koreanName}</p>
              {bis.hanjaName && <p><strong className="text-foreground">이름(한자):</strong> {bis.hanjaName}</p>}
              <p><strong className="text-foreground">성별:</strong> {bis.gender === 'male' ? '남자' : '여자'}</p>
              {bis.childOrder && <p><strong className="text-foreground">자녀 순위:</strong> {bis.childOrder}</p>}
              <p><strong className="text-foreground">양력 생일:</strong> {bis.solarBirthDate}</p>
              <p><strong className="text-foreground">음력 생일:</strong> {bis.lunarBirthDate}</p>
              <p><strong className="text-foreground">출생 시간:</strong> {bis.birthTime}</p>
              {bis.birthPlace && <p><strong className="text-foreground">출생지:</strong> {bis.birthPlace}</p>}
              <p className="col-span-2 pt-1"><strong className="text-foreground">사주 정보:</strong> {bis.sajuComposition.gapjaYearName} ({bis.sajuComposition.zodiacColor} {bis.sajuComposition.zodiacAnimal})</p>
            </div>
          </SectionCard>

          {/* 2. 종합 점수 및 평가 */}
          <SectionCard title="종합 점수 및 평가" icon={CheckCircle}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-2xl font-bold text-accent">{ose.totalScore}점</p>
                <p className={`text-xl font-semibold px-3 py-1 rounded-md ${ose.grade === '매우 좋음' || ose.grade === '좋음' ? 'bg-green-100 text-green-700' : ose.grade === '보통' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {ose.grade}
                </p>
            </div>
            <ScoreDisplay score={ose.detailedScores.eumYangOhaengScore} maxScore={5} label="음양오행" />
            <ScoreDisplay score={ose.detailedScores.suriGilhyungScore} maxScore={35} label="수리길흉" />
            <ScoreDisplay score={ose.detailedScores.pronunciationOhaengScore} maxScore={25} label="발음오행" />
            <ScoreDisplay score={ose.detailedScores.suriOhaengScore} maxScore={5} label="수리오행" />
            <ScoreDisplay score={ose.detailedScores.resourceOhaengScore} maxScore={30} label="자원오행" />
          </SectionCard>

          {/* 3. 음양오행 분석 (사주 기반) */}
          <SectionCard title="음양오행 분석 (사주 기반)" icon={Palette}>
            <h4 className="font-semibold text-md mb-1 text-secondary-foreground">사주 구성 (년/월/일/시)</h4>
            {[eyoa.sajuAnalysis.yearColumn, eyoa.sajuAnalysis.monthColumn, eyoa.sajuAnalysis.dayColumn, eyoa.sajuAnalysis.timeColumn].map((col, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                    {['년주', '월주', '일주', '시주'][idx]}: {col.cheonGan}{col.jiJi} ({col.eumYang}, {col.ohaeng})
                </p>
            ))}
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">음양 비율</h4>
            <p className="text-sm text-muted-foreground">음: {eyoa.eumYangRatio.eumPercent}% / 양: {eyoa.eumYangRatio.yangPercent}%</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">오행 비율</h4>
            <p className="text-sm text-muted-foreground">목: {eyoa.ohaengRatio.wood}% | 화: {eyoa.ohaengRatio.fire}% | 토: {eyoa.ohaengRatio.earth}% | 금: {eyoa.ohaengRatio.metal}% | 수: {eyoa.ohaengRatio.water}%</p>
            <p className="text-sm text-muted-foreground">보충 필요 오행: {eyoa.ohaengRatio.neededOhaeng}</p>
          </SectionCard>

          {/* 4. 음양 조화 분석 (이름 자체) */}
          <SectionCard title="음양 조화 분석 (이름 자체)" icon={BookOpen}>
             <h4 className="font-semibold text-md mb-1 text-secondary-foreground">이름 글자 분석</h4>
            {eyha.hanjaStrokesAndEumyang.map((item, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">{item.character}: {item.eumYang} {item.strokes && `(${item.strokes}획)`}</p>
            ))}
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">오행 조화</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{eyha.ohaengHarmony}</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">평가</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{eyha.evaluation}</p>
          </SectionCard>

          {/* 5. 수리길흉 분석 */}
          <SectionCard title="수리길흉 분석 (5격)" icon={TrendingUp}>
            {[sga.cheonGyeok, sga.inGyeok, sga.jiGyeok, sga.oeGyeok, sga.jongGyeok].map((luck, idx) => (
                <div key={idx} className="mb-2 pb-2 border-b last:border-b-0 border-border/50">
                    <h4 className="font-semibold text-md text-secondary-foreground">
                        {['천격 (선조운, 1-20세)', '인격 (초년운/주격, 20-40세)', '지격 (중년운, 30-50세)', '외격 (장년운, 40세 이후)', '종격 (말년운/총운)'][idx]}: <span className="font-normal">{luck.rating} ({luck.ohaeng})</span>
                    </h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{luck.description}</p>
                </div>
            ))}
          </SectionCard>

          {/* 6. 발음오행 분석 */}
          <SectionCard title="발음오행 분석" icon={Mic}>
            <h4 className="font-semibold text-md mb-1 text-secondary-foreground">초성 분석</h4>
            <div className="flex gap-3">
            {poa.initialConsonants.map((item, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">{item.character}: {item.consonant} ({item.ohaeng})</p>
            ))}
            </div>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">상생상극 관계</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{poa.harmonyRelationship}</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">평가</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{poa.evaluation}</p>
          </SectionCard>

          {/* 7. 자원오행 분석 */}
          <SectionCard title="자원오행 분석" icon={Gem}>
            <h4 className="font-semibold text-md mb-1 text-secondary-foreground">사주 강약 분석</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{roa.sajuStrengthAnalysis}</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">용신</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{roa.yongsin}</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">이름의 자원오행 조화</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{roa.nameResourceOhaengMatch}</p>
          </SectionCard>

          {/* 8. 한자 필터링 분석 */}
          <SectionCard title="한자 필터링 분석" icon={Filter}>
            <h4 className="font-semibold text-md mb-1 text-secondary-foreground">불용한자 여부</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{hfa.inappropriateHanja}</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">장자녀 전용 한자 여부</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{hfa.firstChildOnlyHanja}</p>
          </SectionCard>

          {/* 9. 전체 평가 요약 */}
          <SectionCard title="전체 평가 요약" icon={Sparkles} className="bg-card border-primary/50">
             <p className="text-base text-muted-foreground whitespace-pre-wrap">{foe.summary}</p>
            {foe.cautions && (
              <>
                <h4 className="font-semibold text-md mt-4 mb-1 text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4"/>주의사항</h4>
                <p className="text-sm text-destructive/90 whitespace-pre-wrap">{foe.cautions}</p>
              </>
            )}
          </SectionCard>

        </CardContent>
        <CardFooter className="pt-8 border-t flex-col sm:flex-row items-center gap-4">
           {/* ShareButton removed */}
        </CardFooter>
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

