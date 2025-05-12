"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { interpretName, type InterpretNameInput, type InterpretNameOutput, type SuriGyeokSchema as SuriGyeokType } from '@/ai/flows/name-interpretation-flow';
import { Home, Sparkles, User, CalendarDays, Clock, Info, Palette, BookOpen, TrendingUp, Mic, Gem, Filter, CheckCircle, AlertTriangle, RotateCcw, PieChartIcon, BarChart2, Star as StarIcon, Award } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";
import { EAST_ASIAN_BIRTH_TIMES } from '@/lib/constants';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';


const SectionCard: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; className?: string; cardDescription?: string | React.ReactNode }> = ({ title, icon: Icon, children, className, cardDescription }) => (
  <Card className={cn("shadow-md", className)}>
    <CardHeader className="pb-3 pt-5">
      <CardTitle className="text-xl text-primary flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        {title}
      </CardTitle>
      {cardDescription && (
        typeof cardDescription === 'string' ? 
        <CardDescription className="text-xs pt-1">{cardDescription}</CardDescription> : 
        <CardDescription className="text-xs pt-1">{cardDescription}</CardDescription>
      )}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const ohaengChartConfig = {
  wood: { label: "목(木)", color: "hsl(var(--chart-1))" },
  fire: { label: "화(火)", color: "hsl(var(--chart-2))" },
  earth: { label: "토(土)", color: "hsl(var(--chart-3))" },
  metal: { label: "금(金)", color: "hsl(var(--chart-4))" },
  water: { label: "수(水)", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


const ScoreBarHorizontal = ({ label, score, maxScore }: { label: string; score: number; maxScore: number }) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const barColor = percentage > 70 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="text-foreground font-semibold">{score} / {maxScore}점</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 dark:bg-muted/30 overflow-hidden">
        <div
          className={cn(barColor, "h-2.5 rounded-full transition-all duration-500 ease-out")}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const getRatingValue = (rating: SuriGyeokType['rating']): number => {
  switch (rating) {
    case '대길': return 5;
    case '길': return 4;
    case '평': return 3;
    case '흉': return 2;
    case '대흉': return 1;
    default: return 0;
  }
};

const getRatingColorClass = (ratingValue: number): string => {
  if (ratingValue >= 4) return "text-green-600 dark:text-green-400"; // Greenish (good)
  if (ratingValue === 3) return "text-yellow-600 dark:text-yellow-400"; // Yellowish (neutral)
  return "text-red-600 dark:text-red-400"; // Reddish (bad)
};


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

  const getOverallGradeColor = (grade: string) => {
    if (['매우 좋음', '좋음'].includes(grade)) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (['보통'].includes(grade)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
  };


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
    overallAssessment: oa,
    detailedAnalysis: da,
    cautionsAndRecommendations: car
  } = result;

  const birthTimeLabel = EAST_ASIAN_BIRTH_TIMES.find(time => time.value === bis.birthTime)?.label || bis.birthTime;
  
  const ohaengPieData = [
    { nameKey: "wood", name: ohaengChartConfig.wood.label, value: bis.sajuOhaengDistribution.wood, fill: ohaengChartConfig.wood.color },
    { nameKey: "fire", name: ohaengChartConfig.fire.label, value: bis.sajuOhaengDistribution.fire, fill: ohaengChartConfig.fire.color },
    { nameKey: "earth", name: ohaengChartConfig.earth.label, value: bis.sajuOhaengDistribution.earth, fill: ohaengChartConfig.earth.color },
    { nameKey: "metal", name: ohaengChartConfig.metal.label, value: bis.sajuOhaengDistribution.metal, fill: ohaengChartConfig.metal.color },
    { nameKey: "water", name: ohaengChartConfig.water.label, value: bis.sajuOhaengDistribution.water, fill: ohaengChartConfig.water.color },
  ].filter(item => item.value > 0); 


  const suriGyeokData = [
    da.suriGilhyungAnalysis.wonGyeok,
    da.suriGilhyungAnalysis.hyeongGyeok,
    da.suriGilhyungAnalysis.iGyeok,
    da.suriGilhyungAnalysis.jeongGyeok,
  ].map(item => ({
    name: item.name.split('(')[0].trim(), // e.g., "원격"
    agePeriod: item.name.match(/\(([^)]+)\)/)?.[1] || '', // e.g., "초년운"
    rating: getRatingValue(item.rating),
    ratingText: item.rating,
    suriNumber: item.suriNumber
  }));


  return (
    <div className="space-y-6 py-6 flex flex-col flex-1">
      <Card className="shadow-xl border-primary/40">
        <CardHeader className="pb-4 bg-primary/5 rounded-t-lg">
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <Sparkles className="h-8 w-8" /> {bis.koreanName} {bis.hanjaName && `(${bis.hanjaName})`} 님의 이름 풀이 결과
          </CardTitle>
          <CardDescription className={`text-md pt-2 bg-muted/70 p-3 rounded-md text-foreground`}>
            <strong>간단 요약:</strong> {oa.summaryEvaluation} (종합 점수: <strong className="text-accent">{oa.totalScore}점</strong>)
          </CardDescription>
        </CardHeader>
      </Card>

      <SectionCard title="기본 정보 요약" icon={Info} className="bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <p><strong className="text-foreground">이름:</strong> {bis.koreanName} {bis.hanjaName && `(${bis.hanjaName})`}</p>
          <p><strong className="text-foreground">성별:</strong> {bis.gender}</p>
          <p><strong className="text-foreground">양력 생일:</strong> {bis.solarBirthDate}</p>
          <p><strong className="text-foreground">음력 생일:</strong> {bis.lunarBirthDate}</p>
          <p><strong className="text-foreground">출생 시간:</strong> {birthTimeLabel}</p>
          <p className="md:col-span-2 pt-1">
            <strong className="text-foreground">사주 정보:</strong> {bis.gapjaYearName} ({bis.zodiacColor && `${bis.zodiacColor} `}{bis.zodiacSign})
          </p>
          <div className="md:col-span-2 pt-1">
            <strong className="text-foreground block mb-1">사주팔자 (년/월/일/시):</strong>
            <div className="flex flex-wrap gap-2">
            {[bis.sajuPillars.yearPillar, bis.sajuPillars.monthPillar, bis.sajuPillars.dayPillar, bis.sajuPillars.timePillar].map((pillar, index) => (
                <div key={index} className="text-xs bg-background border border-border px-2 py-1 rounded shadow-sm">
                    <span className="font-semibold">{['년주', '월주', '일주', '시주'][index]}:</span>
                    { (pillar.cheonGan === "불명" || !pillar.cheonGan) ? ' 불명' : ` ${pillar.cheonGan}${pillar.jiJi}`}
                    { !(pillar.cheonGan === "불명" || !pillar.cheonGan) && <span className="ml-1 text-muted-foreground/80">({pillar.eumYang}, {pillar.ohaeng})</span>}
                </div>
            ))}
            </div>
          </div>
           <div className="md:col-span-2 mt-2">
            <h4 className="font-semibold text-md mt-2 mb-1 text-secondary-foreground flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" /> 사주 오행 분포
            </h4>
            {ohaengPieData.length > 0 ? (
              <div className="h-[160px] w-full max-w-xs mx-auto">
                 <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top:5, right:5, bottom:5, left:5}}>
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
                        innerRadius={30}
                        outerRadius={50}
                        labelLine={false}
                        label={({ name, percent, value }) => value > 0 ? `${name.substring(0,1)}: ${(percent * 100).toFixed(0)}%` : null}
                        fontSize={10}
                      >
                        {ohaengPieData.map((entry) => (
                          <Cell key={`cell-${entry.nameKey}`} fill={entry.fill} />
                        ))}
                      </Pie>
                       <Legend content={({ payload }) => (
                          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs mt-2">
                            {payload?.map((entry, index) => (
                              <div key={`legend-${index}`} className="flex items-center">
                                <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }}></div>
                                <span>{entry.value} ({bis.sajuOhaengDistribution[entry.payload.nameKey as keyof typeof bis.sajuOhaengDistribution]})</span>
                              </div>
                            ))}
                          </div>
                        )} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">오행 비율 데이터가 없습니다.</p>
            )}
             <p className="text-xs text-center mt-1 text-muted-foreground">사주에서 필요한 오행: <strong className="text-primary">{bis.neededOhaengInSaju}</strong></p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="종합 점수 및 평가" icon={Award} className="bg-card">
        <div className="mb-4 text-center">
            <p className="text-lg">
                종합 평가 등급: <strong className={`font-semibold px-2 py-1 rounded-md text-lg ${getOverallGradeColor(oa.summaryEvaluation)}`}>{oa.summaryEvaluation}</strong>
            </p>
            <p className="text-2xl font-bold mt-1">
                종합 점수: <span className="text-accent">{oa.totalScore}점</span> / 100점
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <ScoreBarHorizontal label="음양오행 조화" score={oa.detailedScores.eumYangOhaengScore.score} maxScore={oa.detailedScores.eumYangOhaengScore.maxScore} />
            <ScoreBarHorizontal label="수리길흉 (원형이정)" score={oa.detailedScores.suriGilhyungScore.score} maxScore={oa.detailedScores.suriGilhyungScore.maxScore} />
            <ScoreBarHorizontal label="발음오행" score={oa.detailedScores.pronunciationOhaengScore.score} maxScore={oa.detailedScores.pronunciationOhaengScore.maxScore} />
            <ScoreBarHorizontal label="자원오행 (사주보완)" score={oa.detailedScores.resourceOhaengScore.score} maxScore={oa.detailedScores.resourceOhaengScore.maxScore} />
        </div>
      </SectionCard>
      
      <SectionCard title="수리길흉 분석 (원형이정 4격)" icon={TrendingUp} className="bg-card" cardDescription={da.suriGilhyungAnalysis.introduction}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
           {suriGyeokData.map((luckItem, index) => (
              <Card key={index} className="bg-background/50 p-4 shadow">
                  <CardHeader className="p-0 pb-1">
                    <CardTitle className="text-md text-secondary-foreground flex items-center justify-between">
                        <span>{luckItem.name} <span className="text-xs text-muted-foreground">({luckItem.agePeriod})</span></span>
                        <span className={`font-semibold text-sm px-1.5 py-0.5 rounded ${getRatingColorClass(luckItem.rating)}`}>{luckItem.ratingText} ({luckItem.suriNumber}수)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-1">
                     <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{da.suriGilhyungAnalysis[Object.keys(da.suriGilhyungAnalysis)[index+1] as keyof typeof da.suriGilhyungAnalysis].interpretation}</p>
                  </CardContent>
              </Card>
          ))}
        </div>
         <div className="h-[220px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={suriGyeokData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} ticks={[1,2,3,4,5]} tickFormatter={(value) => ['대흉','흉','평','길','대길'][value-1] || ''} style={{ fontSize: '10px' }} />
                  <YAxis dataKey="name" type="category" width={55} style={{ fontSize: '11px' }}/>
                  <RechartsTooltip contentStyle={{fontSize: '12px', padding: '5px'}} formatter={(value, name, props) => [props.payload.ratingText, name]}/>
                  <Bar dataKey="rating" barSize={20}>
                      {suriGyeokData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRatingColorClass(entry.rating).split(' ')[0].replace('text-', 'var(--chart-').replace('-600', ')').replace('-400', ')')} />
                      ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
      </SectionCard>
      
      <SectionCard title="오행 및 음양 상세 분석" icon={Palette} className="bg-card" cardDescription="이름의 소리, 글자 모양, 한자 뜻에 담긴 오행과 음양의 조화를 분석합니다.">
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-md mb-1 text-secondary-foreground flex items-center gap-1"><Mic className="h-4 w-4"/> 이름의 발음오행 분석</h4>
                <div className="flex flex-wrap gap-x-3 gap-y-2 items-center mb-2">
                    {da.nameStructureAnalysis.pronunciationOhaeng.initialConsonants.map((item, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground border border-border/70 p-2 rounded-md bg-background/30 shadow-sm min-w-[55px] text-center">
                            <div className="font-semibold text-lg text-foreground">{item.character}</div>
                            <div className="text-xs">{item.consonant} ({item.ohaeng})</div>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>관계:</strong> {da.nameStructureAnalysis.pronunciationOhaeng.harmonyRelationship}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>평가:</strong> {da.nameStructureAnalysis.pronunciationOhaeng.assessment}</p>
            </div>
            <Separator className="my-3"/>
            <div>
                <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground flex items-center gap-1"><BookOpen className="h-4 w-4"/> 이름의 음양 조화 (획수 기반)</h4>
                 <div className="flex flex-wrap gap-x-3 gap-y-2 items-center mb-2">
                    {da.nameStructureAnalysis.hanjaStrokeCounts?.map((item, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground border border-border/70 p-2 rounded-md bg-background/30 shadow-sm min-w-[60px] text-center">
                            <div className="font-semibold text-lg text-foreground">{item.character}</div>
                            {item.strokes !== undefined && <div className="text-xs">{item.strokes % 2 === 0 ? '음(陰)' : '양(陽)'} ({item.strokes}획)</div>}
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>음양 구성:</strong> {da.nameStructureAnalysis.yinYangHarmony.nameYinYangComposition}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>평가:</strong> {da.nameStructureAnalysis.yinYangHarmony.assessment}</p>
            </div>
            <Separator className="my-3"/>
             <div>
                <h4 className="font-semibold text-md mb-1 text-secondary-foreground flex items-center gap-1"><Gem className="h-4 w-4"/> 자원오행 분석 (사주 보완)</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>사주 필요 오행:</strong> {da.resourceOhaengAnalysis.sajuDeficientOhaeng}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>이름의 자원오행:</strong> {da.resourceOhaengAnalysis.nameHanjaOhaeng}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>보완 평가:</strong> {da.resourceOhaengAnalysis.complementAssessment}</p>
            </div>
             <Separator className="my-3"/>
            <div>
                 <h4 className="font-semibold text-md mb-1 text-secondary-foreground flex items-center gap-1"><Palette className="h-4 w-4" /> 주역 괘 분석</h4>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>도출된 괘:</strong> {da.iChingHexagram.hexagramName} {da.iChingHexagram.hexagramImage && `(${da.iChingHexagram.hexagramImage})`}</p>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>해석:</strong> {da.iChingHexagram.interpretation}</p>
            </div>
        </div>
      </SectionCard>
      
      <SectionCard title="한자 필터링 및 주의사항" icon={Filter} className="bg-card">
        <h4 className="font-semibold text-md mb-1 text-secondary-foreground">불용한자 여부</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{car.inauspiciousHanja && car.inauspiciousHanja.length > 0 ? car.inauspiciousHanja.join(', ') : "이름에 특별한 불용한자는 발견되지 않았습니다."}</p>
         {car.generalAdvice && (
          <>
            <h4 className="font-semibold text-md mt-4 mb-1 text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4"/>종합 조언 및 주의사항</h4>
            <p className="text-sm text-destructive/90 whitespace-pre-wrap">{car.generalAdvice}</p>
          </>
        )}
      </SectionCard>


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