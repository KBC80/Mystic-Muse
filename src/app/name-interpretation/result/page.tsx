
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { interpretName, type InterpretNameInput, type InterpretNameOutput, type SuriLuckSchema as SuriLuckType } from '@/ai/flows/name-interpretation-flow';
import { Home, Sparkles, User, CalendarDays, Clock, Info, Palette, BookOpen, TrendingUp, Mic, Gem, Filter, CheckCircle, AlertTriangle, RotateCcw, PieChartIcon, BarChart2, Star as StarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { EAST_ASIAN_BIRTH_TIMES } from '@/lib/constants';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';


const SectionCard: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; className?: string; cardDescription?: string }> = ({ title, icon: Icon, children, className, cardDescription }) => (
  <Card className={cn("bg-secondary/20 shadow-md", className)}>
    <CardHeader className="pb-3 pt-5">
      <CardTitle className="text-xl text-primary flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        {title}
      </CardTitle>
      {cardDescription && <CardDescription className="text-xs pt-1">{cardDescription}</CardDescription>}
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

const getRatingValue = (rating: SuriLuckType['rating']): number => {
  switch (rating) {
    case '매우 좋음': return 5;
    case '좋음': return 4;
    case '보통': return 3;
    case '나쁨': return 2;
    case '매우 나쁨': return 1;
    default: return 0;
  }
};

const getRatingColor = (ratingValue: number): string => {
  if (ratingValue >= 4) return "hsl(var(--chart-1))"; // Greenish (good)
  if (ratingValue === 3) return "hsl(var(--chart-3))"; // Yellowish (neutral)
  return "hsl(var(--chart-2))"; // Reddish (bad)
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

  const birthTimeLabel = EAST_ASIAN_BIRTH_TIMES.find(time => time.value === bis.birthTime)?.label || bis.birthTime;

  const ohaengPieData = [
    { nameKey: "wood", name: ohaengChartConfig.wood.label, value: eyoa.ohaengRatio.wood, fill: ohaengChartConfig.wood.color },
    { nameKey: "fire", name: ohaengChartConfig.fire.label, value: eyoa.ohaengRatio.fire, fill: ohaengChartConfig.fire.color },
    { nameKey: "earth", name: ohaengChartConfig.earth.label, value: eyoa.ohaengRatio.earth, fill: ohaengChartConfig.earth.color },
    { nameKey: "metal", name: ohaengChartConfig.metal.label, value: eyoa.ohaengRatio.metal, fill: ohaengChartConfig.metal.color },
    { nameKey: "water", name: ohaengChartConfig.water.label, value: eyoa.ohaengRatio.water, fill: ohaengChartConfig.water.color },
  ].filter(item => item.value > 0); 

  const lifeLuckData = [
    { name: '초년운', rating: getRatingValue(sga.cheonGyeok.rating), ratingText: sga.cheonGyeok.rating },
    { name: '청년운', rating: getRatingValue(sga.inGyeok.rating), ratingText: sga.inGyeok.rating },
    { name: '중년운', rating: getRatingValue(sga.jiGyeok.rating), ratingText: sga.jiGyeok.rating },
    { name: '말년운', rating: getRatingValue(sga.oeGyeok.rating), ratingText: sga.oeGyeok.rating },
  ];


  return (
    <div className="space-y-6 py-6 flex flex-col flex-1">
      {/* 1. 헤더 영역 */}
      <Card className="shadow-lg border-primary/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <Sparkles className="h-8 w-8" /> {bis.koreanName} {bis.hanjaName && `(${bis.hanjaName})`} 님의 이름 풀이 결과
          </CardTitle>
          <CardDescription className="text-md pt-2 bg-accent/10 p-3 rounded-md text-accent-foreground">
            <strong>간단 요약:</strong> {foe.summary.split('.')[0] + '.'} (종합 등급: {ose.grade})
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* 2. 사용자 기본정보 요약 카드 */}
          <SectionCard title="기본 정보" icon={User} className="sticky top-20">
            <div className="space-y-1 text-sm">
              <p><strong className="text-foreground">성별:</strong> {bis.gender}</p>
              <p><strong className="text-foreground">양력 생일:</strong> {bis.solarBirthDate}</p>
              <p><strong className="text-foreground">음력 생일:</strong> {bis.lunarBirthDate}</p>
              <p><strong className="text-foreground">출생 시간:</strong> {birthTimeLabel}</p>
              <p className="pt-1">
                <strong className="text-foreground">사주 정보:</strong> {bis.sajuComposition.gapjaYearName} - {bis.sajuComposition.zodiacColor} {bis.sajuComposition.zodiacAnimal}
              </p>
              <div className="pt-2">
                <strong className="text-foreground block mb-1">사주팔자 (년/월/일/시):</strong>
                {[bis.sajuComposition.yearColumn, bis.sajuComposition.monthColumn, bis.sajuComposition.dayColumn, bis.sajuComposition.timeColumn].map((col, idx) => (
                    <span key={idx} className="mr-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                        {col.cheonGan}{col.jiJi}
                    </span>
                ))}
              </div>
              <p className="pt-1"><strong className="text-foreground">사주 필요 오행:</strong> {eyoa.ohaengRatio.neededOhaeng}</p>
              <p><strong className="text-foreground">사주 용신:</strong> {roa.yongsin}</p>
            </div>
            <h4 className="font-semibold text-md mt-4 mb-2 text-secondary-foreground flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" /> 사주 오행 비율
            </h4>
            {ohaengPieData.length > 0 ? (
              <div className="h-[180px] w-full">
                 <ChartContainer config={ohaengChartConfig} className="aspect-auto h-full w-full">
                    <RechartsPieChart margin={{ top:0, right:0, bottom:0, left:0}}>
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
                        label={({ name, percent }) => `${name.substring(0,1)}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {ohaengPieData.map((entry) => (
                          <Cell key={`cell-${entry.nameKey}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ChartContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">오행 비율 데이터가 없습니다.</p>
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* 3. 전체운(그래픽) 요약 섹션 */}
          <SectionCard title="생애 주기별 운세 요약" icon={BarChart2}>
            <div className="mb-2">
                <p className="text-sm text-muted-foreground">
                    종합 평가 등급: <strong className={`font-semibold px-2 py-0.5 rounded-sm text-sm ${ose.grade === '매우 좋음' || ose.grade === '좋음' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ose.grade === '보통' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>{ose.grade}</strong>
                    {' '}(종합 점수: <strong className="text-accent">{ose.totalScore}점</strong> / 100점)
                </p>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={lifeLuckData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} ticks={[1,2,3,4,5]} tickFormatter={(value) => ['매우나쁨','나쁨','보통','좋음','매우좋음'][value-1] || ''} style={{ fontSize: '10px' }} />
                  <YAxis dataKey="name" type="category" width={50} style={{ fontSize: '12px' }}/>
                  <RechartsTooltip contentStyle={{fontSize: '12px', padding: '5px'}} formatter={(value, name, props) => [props.payload.ratingText, name]}/>
                  <Bar dataKey="rating" barSize={20}>
                     {lifeLuckData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRatingColor(entry.rating)} />
                      ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* 4. 수리오행 분석 섹션 */}
          <SectionCard title="수리길흉 분석 (5격 해설)" icon={TrendingUp} cardDescription="이름의 획수를 기반으로 인생의 주요 시기별 운세를 분석합니다.">
            {[
              {key: 'cheonGyeok', label: '천격 (초년운, 1-20세)', data: sga.cheonGyeok},
              {key: 'inGyeok', label: '인격 (청년운, 20-40세)', data: sga.inGyeok},
              {key: 'jiGyeok', label: '지격 (중년운, 30-50세)', data: sga.jiGyeok},
              {key: 'oeGyeok', label: '외격 (말년운, 40세 이후)', data: sga.oeGyeok},
              {key: 'jongGyeok', label: '종격 (총격, 전체 인생)', data: sga.jongGyeok},
            ].map((luckItem) => (
                <div key={luckItem.key} className="mb-3 pb-3 border-b last:border-b-0 border-border/50">
                    <h4 className="font-semibold text-md text-secondary-foreground mb-0.5">
                        {luckItem.label}: <span className="font-normal">{luckItem.data.rating} ({luckItem.data.ohaeng})</span>
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{luckItem.data.description}</p>
                </div>
            ))}
          </SectionCard>
          
          {/* 5. 오행 상세 분석 */}
          <SectionCard title="오행 상세 분석" icon={Palette} cardDescription="이름의 발음, 획수, 글자 뜻에 담긴 오행의 조화를 분석합니다.">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-md mb-1 text-secondary-foreground">발음오행</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-2 items-center mb-2">
                        {poa.initialConsonants.map((item, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground border border-border/70 p-2 rounded-md bg-background/30 shadow-sm min-w-[55px] text-center">
                                <div className="font-semibold text-lg text-foreground">{item.character}</div>
                                <div className="text-xs">{item.consonant} ({item.ohaeng})</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>관계:</strong> {poa.harmonyRelationship}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>평가:</strong> {poa.evaluation}</p>
                    <p className="text-sm text-muted-foreground"><strong>점수:</strong> {ose.detailedScores.pronunciationOhaengScore} / {scoreConfig.pronunciationOhaengScore.maxScore}점</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-md mb-1 text-secondary-foreground">획수오행 (수리오행)</h4>
                     <p className="text-sm text-muted-foreground">5격(천격, 인격 등)의 오행 구성은 위 수리길흉 분석 섹션을 참고하세요.</p>
                    <p className="text-sm text-muted-foreground"><strong>종합 점수:</strong> {ose.detailedScores.suriOhaengScore} / {scoreConfig.suriOhaengScore.maxScore}점</p>
                </div>
                <div>
                    <h4 className="font-semibold text-md mb-1 text-secondary-foreground">자의오행 (자원오행) - 사주 보완</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>사주 강약:</strong> {roa.sajuStrengthAnalysis}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>용신:</strong> {roa.yongsin}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong>이름과의 조화:</strong> {roa.nameResourceOhaengMatch}</p>
                     <p className="text-sm text-muted-foreground"><strong>점수:</strong> {ose.detailedScores.resourceOhaengScore} / {scoreConfig.resourceOhaengScore.maxScore}점</p>
                </div>
            </div>
          </SectionCard>

          {/* 6. 음양 구성 섹션 */}
          <SectionCard title="음양 조화 분석 (이름 자체)" icon={BookOpen} cardDescription="이름 글자 자체의 음양 구성을 분석합니다.">
            <h4 className="font-semibold text-md mb-2 text-secondary-foreground">이름 글자 음양 분석</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2 items-center">
                {eyha.hanjaStrokesAndEumyang.map((item, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground border border-border/70 p-2 rounded-md bg-background/30 shadow-sm min-w-[60px] text-center">
                        <div className="font-semibold text-lg text-foreground">{item.character}</div>
                        <div className="text-xs">{item.eumYang}</div>
                        {item.strokes !== undefined && <div className="text-xs">({item.strokes}획)</div>}
                    </div>
                ))}
            </div>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">오행 조화 (이름 글자 간)</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{eyha.ohaengHarmony}</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">평가</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{eyha.evaluation}</p>
             <p className="text-sm text-muted-foreground mt-1"><strong>점수:</strong> {ose.detailedScores.eumYangOhaengScore} / {scoreConfig.eumYangOhaengScore.maxScore}점</p>
          </SectionCard>

          {/* 7. 사주 보완 분석 (이미 기본정보 및 자원오행에 통합됨) */}

          {/* 8. 감점 요인 및 주의사항 */}
          <SectionCard title="한자 필터링 및 주의사항" icon={Filter} cardDescription="이름에 사용된 한자의 적절성과 전반적인 주의점을 확인합니다.">
            <h4 className="font-semibold text-md mb-1 text-secondary-foreground">불용한자 여부</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{hfa.inappropriateHanja}</p>
            <h4 className="font-semibold text-md mt-3 mb-1 text-secondary-foreground">장자녀 전용 한자 여부</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{hfa.firstChildOnlyHanja}</p>
             {foe.cautions && (
              <>
                <h4 className="font-semibold text-md mt-4 mb-1 text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4"/>추가 주의사항</h4>
                <p className="text-sm text-destructive/90 whitespace-pre-wrap">{foe.cautions}</p>
              </>
            )}
          </SectionCard>

           {/* 9. 하단 요약 */}
          <SectionCard title="최종 종합 평가" icon={Sparkles} className="bg-card border-primary/50">
             <p className="text-base text-muted-foreground whitespace-pre-wrap">{foe.summary}</p>
          </SectionCard>
        </div>
      </div>

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
