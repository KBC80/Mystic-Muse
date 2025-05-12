
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, TestTubeDiagonal, BarChart, CheckSquare, XSquare, TrendingUp, Info, ExternalLink, FileText } from 'lucide-react';
import { getInitialScientificLottoData, type ProcessedWinningNumber, type CalculatedAverages } from '@/app/lotto-recommendation/scientific/actions';

const formSchema = z.object({
  includeNumbers: z.string().optional().refine(val => {
    if (!val) return true;
    const nums = val.split(',').map(n => parseInt(n.trim(), 10));
    return nums.every(n => !isNaN(n) && n >= 1 && n <= 45);
  }, { message: "1과 45 사이의 숫자를 쉼표로 구분하여 입력해주세요." })
  .refine(val => {
    if (!val) return true;
    const nums = val.split(',').map(n => n.trim()).filter(n => n !== "");
    return new Set(nums).size === nums.length;
  }, { message: "포함할 숫자에 중복된 값이 있습니다."}),
  excludeNumbers: z.string().optional().refine(val => {
    if (!val) return true;
    const nums = val.split(',').map(n => parseInt(n.trim(), 10));
    return nums.every(n => !isNaN(n) && n >= 1 && n <= 45);
  }, { message: "1과 45 사이의 숫자를 쉼표로 구분하여 입력해주세요." })
  .refine(val => {
    if (!val) return true;
    const nums = val.split(',').map(n => n.trim()).filter(n => n !== "");
    return new Set(nums).size === nums.length;
  }, { message: "제외할 숫자에 중복된 값이 있습니다."}),
  numberOfDrawsForAnalysis: z.string().optional()
    .refine(val => {
      if (!val) return true; // Optional field
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 5 && num <= 100;
    }, { message: "분석할 회차 수는 5에서 100 사이의 숫자여야 합니다." }),
}).refine(data => {
    if (!data.includeNumbers || !data.excludeNumbers) return true;
    const includeArr = data.includeNumbers.split(',').map(n => n.trim()).filter(n => n !== "");
    const excludeArr = data.excludeNumbers.split(',').map(n => n.trim()).filter(n => n !== "");
    return !includeArr.some(n => excludeArr.includes(n));
}, { message: "포함할 숫자와 제외할 숫자에 중복된 값이 있습니다.", path: ["includeNumbers"] });


type ScientificLottoFormValues = z.infer<typeof formSchema>;

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


export default function ScientificLottoRecommendationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentDrawsForDisplay, setRecentDrawsForDisplay] = useState<ProcessedWinningNumber[]>([]);
  const [analysisAverages, setAnalysisAverages] = useState<CalculatedAverages | null>(null);


  const form = useForm<ScientificLottoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      includeNumbers: "",
      excludeNumbers: "",
      numberOfDrawsForAnalysis: "24", // Default to 24 draws for analysis
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsInitialLoading(true);
      setError(null);
      setAnalysisAverages(null); 
      try {
        // For initial page load, use a default number of draws for summary
        const data = await getInitialScientificLottoData(form.getValues("numberOfDrawsForAnalysis") || "24");
        if (data.error) {
          setError(data.error);
        } else {
          if (data.recentDraws) setRecentDrawsForDisplay(data.recentDraws);
          if (data.averages) setAnalysisAverages(data.averages);
        }
      } catch (err) {
        console.error("초기 데이터 로딩 오류:", err);
        setError(err instanceof Error ? err.message : "초기 데이터 로딩 중 오류 발생");
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Form.getValues() is stable, so this should be fine for initial load.

  async function onSubmit(values: ScientificLottoFormValues) {
    setIsSubmitting(true);
    const queryParams = new URLSearchParams();
    if (values.includeNumbers) queryParams.append('includeNumbers', values.includeNumbers);
    if (values.excludeNumbers) queryParams.append('excludeNumbers', values.excludeNumbers);
    if (values.numberOfDrawsForAnalysis) queryParams.append('numberOfDrawsForAnalysis', values.numberOfDrawsForAnalysis);
    
    router.push(`/lotto-recommendation/scientific/result?${queryParams.toString()}`);
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TestTubeDiagonal className="text-primary h-6 w-6" /> 과학적 로또 번호 추천
          </CardTitle>
          <CardDescription className="flex items-start gap-1">
             <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
            <span>
                실제 동행복권 API 데이터를 기반으로 로또 번호를 추천해 드립니다. 최근 당첨 번호와 통계적 분석 결과를 확인하세요.
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {isInitialLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">최신 당첨 번호 및 분석 데이터를 불러오는 중...</p>
        </div>
      )}
      
      {error && !isSubmitting && ( 
        <Alert variant="destructive">
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


      {!isInitialLoading && recentDrawsForDisplay.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BarChart className="h-5 w-5 text-secondary-foreground" />최근 당첨 번호 (최신 5회)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회차</TableHead>
                  <TableHead>추첨일</TableHead>
                  <TableHead>당첨 번호</TableHead>
                  <TableHead>보너스</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDrawsForDisplay.map((win) => (
                  <TableRow key={win.drwNo}>
                    <TableCell>{win.drwNo}회</TableCell>
                    <TableCell>{win.drwNoDate}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {win.numbers.map(num => (
                          <LottoBall key={num} number={num} size="small" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <LottoBall number={win.bnusNo} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <CardDescription className="text-xs mt-2 text-muted-foreground">* 최신 5회차의 당첨번호입니다. 실제 데이터는 동행복권 API를 통해 제공됩니다.</CardDescription>
          </CardContent>
        </Card>
      )}
      
      {analysisAverages && !isInitialLoading && (
         <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="h-5 w-5 text-secondary-foreground" />과거 데이터 분석 (최근 {analysisAverages.analyzedDrawsCount}회차 기준)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                    평균 당첨 번호 합계: <strong className="text-foreground">{analysisAverages.averageSum.toFixed(1)}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                    가장 흔한 짝수:홀수 비율: <strong className="text-foreground">{analysisAverages.averageEvenOddRatio}</strong>
                </p>
                 <p className="text-xs text-muted-foreground pt-1">{analysisAverages.summaryForDisplay}</p>
            </CardContent>
        </Card>
      )}


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CheckSquare className="text-primary h-5 w-5" /> AI 번호 추천 조건 설정
          </CardTitle>
          <CardDescription>
            AI는 입력된 조건과 함께 아래 설정된 회차의 통계적 패턴을 고려하여 번호를 추천합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="includeNumbers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><CheckSquare className="h-4 w-4"/> 포함할 숫자 (선택, 최대 6개, 쉼표로 구분)</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 7, 14, 21" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excludeNumbers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><XSquare className="h-4 w-4"/> 제외할 숫자 (선택, 쉼표로 구분)</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 1, 10, 45" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="numberOfDrawsForAnalysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4"/> 분석할 최근 회차 수 (5~100)</FormLabel>
                    <FormControl>
                      <Input type="number" min="5" max="100" placeholder="예: 24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || isInitialLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner size={20} /> : "AI 과학적 번호 추천 받기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
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

