
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { interpretName, type InterpretNameInput, type InterpretNameOutput } from '@/ai/flows/name-interpretation-flow';
import { Home, Sparkles, User, CalendarDays, Clock, Info, Palette, BookOpen, TrendingUp, Mic, Gem, Filter, CheckCircle, AlertTriangle, RotateCcw, PieChartIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
// import { Progress } from "@/components/ui/progress"; // Progress bar removed for detailed scores
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';


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

const scoreConfig = {
  eumYangOhaengScore: { label: "음양오행", maxScore: 5 },
  suriGilhyungScore: { label: "수리길흉", maxScore: 35 },
  pronunciationOhaengScore: { label: "발음오행", maxScore: 25 },
  suriOhaengScore: { label: "수리오행", maxScore: 5 },
  resourceOhaengScore: { label: "자원오행", maxScore: 30 },
};

const ohaengChartConfig = {
  wood: { label: "목(木)", color: "hsl(var(--chart-1))" },
  fire: { label: "화(火)", color: "hsl(var(--chart-2))" },
  earth: { label: "토(土)", color: "hsl(var(--chart-3))" },
  metal: { label: "금(金)", color: "hsl(var(--chart-4))" },
  water: { label: "수(水)", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


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

  const ohaengPieData = [
    { nameKey: "wood", name: ohaengChartConfig.wood.label, value: eyoa.ohaengRatio.wood, fill: ohaengChartConfig.wood.color },
    { nameKey: "fire", name: ohaengChartConfig.fire.label, value: eyoa.ohaengRatio.fire, fill: ohaengChartConfig.fire.color },
    { nameKey: "earth", name: ohaengChartConfig.earth.label, value: eyoa.ohaengRatio.earth, fill: ohaengChartConfig.earth.color },
    { nameKey: "metal", name: ohaengChartConfig.metal.label, value: eyoa.ohaengRatio.metal, fill: ohaengChartConfig.metal.color },
    { nameKey: "water", name: ohaengChartConfig.water.label, value: eyoa.ohaengRatio.water, fill: ohaengChartConfig.water.color },
  ].filter(item => item.value > 0); 


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
              <p><strong className="text-foreground">성별:</strong> {bis.gender}</p>
              <p><strong className="text-foreground">양력 생일:</strong> {bis.solarBirthDate}</p>
              <p><strong className="text-foreground">음력 생일:</strong> {bis.lunarBirthDate}</p>
              <p><strong className="text-foreground">출생 시간:</strong> {bis.birthTime}</p>
              <p className="col-span-2 pt-1">
                <strong className="text-foreground">사주 정보 (음력 기준):</strong> {bis.sajuComposition.gapjaYearName} - {bis.sajuComposition.zodiacColor} {bis.sajuComposition.zodiacAnimal}
              </p>
            </div>
          </SectionCard>

          {/* 2. 종합 점수 및 평가 */}
          <SectionCard title="종합 점수 및 평가" icon={CheckCircle}>
            <div className="flex items-center justify-between mb-4">
                <p className="text-2xl font-bold text-accent">{ose.totalScore}점</p>
                <p className={`text-xl font-semibold px-3 py-1 rounded-md ${ose.grade === '매우 좋음' || ose.grade === '좋음' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ose.grade === '보통' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                    {ose.grade}
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {(Object.keys(ose.detailedScores) as Array<keyof typeof ose.detailedScores>).map((key) => {
                const scoreInfo = scoreConfig[key];
                const scoreValue = ose.detailedScores[key];
                if (!scoreInfo) return null;
                const percentage = (scoreValue / scoreInfo.maxScore) * 100;
                return (
                  <div key={key} className="flex flex-col">
                    <div className="flex justify-between text-sm items-baseline">
                      <span className="text-muted-foreground">{scoreInfo.label}</span>
                      <span className="font-semibold text-foreground">{scoreValue} / {scoreInfo.maxScore}점</span>
                    </div>
                    <div className="mt-1 h-2.5 w-full bg-muted rounded-full overflow-hidden">
                       <div
                         className={cn(
                           "h-full rounded-full transition-all duration-500 ease-out",
                           percentage > 70 ? "bg-green-500" : percentage > 40 ? "bg-yellow-500" : "bg-red-500"
                         )}
                         style={{ width: `${percentage}%` }}
                       />
                     </div>
                  </div>
                );
              })}
            </div>
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
            
            <h4 className="font-semibold text-md mt-3 mb-2 text-secondary-foreground flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" /> 오행 비율
            </h4>
            {ohaengPieData.length > 0 ? (
              <div className="h-[200px] w-full">
                 <ChartContainer config={ohaengChartConfig} className="aspect-auto h-full w-full">
                    <RechartsPieChart>
                      <RechartsTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel indicator="dot" nameKey="name" />}
                      />
                      <Pie
                        data={ohaengPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs fill-background">
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                      >
                        {ohaengPieData.map((entry) => (
                          <Cell key={`cell-${entry.nameKey}`} fill={entry.fill} />
                        ))}
                      </Pie>
                       <RechartsLegend content={({ payload }) => {
                          if (!payload) return null;
                          return (
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-3">
                              {payload.map((entry, index) => (
                                <div key={`legend-${index}`} className="flex items-center gap-1.5">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span>{entry.value} ({ (entry.payload as any)?.value }%)</span>
                                </div>
                              ))}
                            </div>
                          );
                        }} />
                    </RechartsPieChart>
                  </ChartContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">오행 비율 데이터가 없습니다.</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">보충 필요 오행: {eyoa.ohaengRatio.neededOhaeng}</p>
          </SectionCard>

          {/* 4. 음양 조화 분석 (이름 자체) */}
          <SectionCard title="음양 조화 분석 (이름 자체)" icon={BookOpen}>
             <h4 className="font-semibold text-md mb-2 text-secondary-foreground">이름 글자 분석</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2 items-center">
                {eyha.hanjaStrokesAndEumyang.map((item, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground border border-border/70 p-2 rounded-md bg-background/30 shadow-sm min-w-[60px] text-center">
                        <div className="font-semibold text-lg text-foreground">{item.character}</div>
                        <div className="text-xs">{item.eumYang}</div>
                        {item.strokes !== undefined && <div className="text-xs">({item.strokes}획)</div>}
                    </div>
                ))}
            </div>
            <h4 className="font-semibold text-md mt-4 mb-1 text-secondary-foreground">오행 조화</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{eyha.ohaengHarmony}</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">평가</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{eyha.evaluation}</p>
          </SectionCard>

          {/* 5. 수리길흉 분석 */}
          <SectionCard title="수리길흉 분석 (5격)" icon={TrendingUp}>
            {[sga.cheonGyeok, sga.inGyeok, sga.jiGyeok, sga.oeGyeok, sga.jongGyeok].map((luck, idx) => (
                <div key={idx} className="mb-3 pb-3 border-b last:border-b-0 border-border/50">
                    <h4 className="font-semibold text-md text-secondary-foreground mb-0.5">
                        {['천격 (초년운, 1-20세)', '인격 (중년운, 20-40세)', '지격 (장년운, 30-50세)', '외격 (말년운, 40세 이후)', '종격 (총격, 전체 인생 총운)'][idx]}: <span className="font-normal">{luck.rating} ({luck.ohaeng})</span>
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{luck.description}</p>
                </div>
            ))}
          </SectionCard>

          {/* 6. 발음오행 분석 */}
          <SectionCard title="발음오행 분석" icon={Mic}>
            <h4 className="font-semibold text-md mb-2 text-secondary-foreground">초성 분석</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2 items-center">
            {poa.initialConsonants.map((item, idx) => (
                <div key={idx} className="text-sm text-muted-foreground border border-border/70 p-2 rounded-md bg-background/30 shadow-sm min-w-[60px] text-center">
                    <div className="font-semibold text-lg text-foreground">{item.character}</div>
                    <div className="text-xs">{item.consonant} ({item.ohaeng})</div>
                </div>
            ))}
            </div>
            <h4 className="font-semibold text-md mt-4 mb-1 text-secondary-foreground">상생상극 관계</h4>
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
        <CardFooter className="pt-8 border-t flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => router.push('/name-interpretation')} variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                다른 이름 풀이하기
            </Button>
            <Link href="/" passHref>
              <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                홈으로 돌아가기
              </Button>
            </Link>
        </CardFooter>
      </Card>
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
