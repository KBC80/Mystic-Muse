
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, TestTubeDiagonal, BarChart, CheckSquare, XSquare, Sparkles, Hash, HelpCircle, TrendingUp, Info } from 'lucide-react';
import type { ScientificLottoRecommendationInput, ScientificLottoRecommendationOutput } from '@/ai/flows/scientific-lotto-recommendation-flow';
import { getInitialScientificLottoData, getLottoRecommendationsAction, type ProcessedWinningNumber, type CalculatedAverages } from '@/app/lotto-recommendation/scientific/actions';

const formSchema = z.object({
  includeNumbers: z.string().optional(),
  excludeNumbers: z.string().optional(),
});

type ScientificLottoFormValues = z.infer<typeof formSchema>;

export default function ScientificLottoRecommendationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [llmResult, setLlmResult] = useState<ScientificLottoRecommendationOutput | null>(null);
  const [recentDrawsForDisplay, setRecentDrawsForDisplay] = useState<ProcessedWinningNumber[]>([]);
  const [calculatedAverages, setCalculatedAverages] = useState<CalculatedAverages | null>(null);


  const form = useForm<ScientificLottoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      includeNumbers: "",
      excludeNumbers: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsInitialLoading(true);
      setError(null);
      try {
        const data = await getInitialScientificLottoData();
        if (data.error) {
          setError(data.error);
        } else if (data.recentDraws) {
          setRecentDrawsForDisplay(data.recentDraws);
        }
      } catch (err) {
        console.error("초기 데이터 로딩 오류:", err);
        setError(err instanceof Error ? err.message : "초기 데이터 로딩 중 오류 발생");
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadData();
  }, []);


  const parseNumbersString = (str: string | undefined): number[] | undefined => {
    if (!str) return undefined;
    const nums = str.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n >= 1 && n <= 45);
    return nums.length > 0 ? nums : undefined;
  };

  async function onSubmit(values: ScientificLottoFormValues) {
    setIsLoading(true);
    setError(null);
    setLlmResult(null);
    setCalculatedAverages(null);

    const includeNumbers = parseNumbersString(values.includeNumbers);
    const excludeNumbers = parseNumbersString(values.excludeNumbers);
    
    let validationError = false;
    if (values.includeNumbers && (!includeNumbers || includeNumbers.some(n => n < 1 || n > 45))) {
      form.setError("includeNumbers", { type: "manual", message: "1과 45 사이의 숫자를 쉼표로 구분하여 입력해주세요." });
      validationError = true;
    }
    if (values.excludeNumbers && (!excludeNumbers || excludeNumbers.some(n => n < 1 || n > 45))) {
      form.setError("excludeNumbers", { type: "manual", message: "1과 45 사이의 숫자를 쉼표로 구분하여 입력해주세요." });
      validationError = true;
    }

    if (includeNumbers && excludeNumbers) {
        const overlap = includeNumbers.some(n => excludeNumbers.includes(n));
        if (overlap) {
            form.setError("includeNumbers", { type: "manual", message: "포함할 숫자와 제외할 숫자에 중복된 값이 있습니다." });
            form.setError("excludeNumbers", { type: "manual", message: "포함할 숫자와 제외할 숫자에 중복된 값이 있습니다." });
            validationError = true;
        }
    }

    if (validationError) {
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await getLottoRecommendationsAction({
        includeNumbersStr: values.includeNumbers,
        excludeNumbersStr: values.excludeNumbers,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setLlmResult(result.llmResponse || null);
        setCalculatedAverages(result.averages || null);
        if (result.drawsForAnalysis) { // Update display with draws used for analysis if needed
           // setRecentDrawsForDisplay(result.drawsForAnalysis.slice(0,10)); // Or however many you want to show
        }
      }
    } catch (err) {
      console.error("과학적 로또 번호 추천 오류:", err);
      setError(err instanceof Error ? err.message : "과학적 로또 번호 추천 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TestTubeDiagonal className="text-primary h-6 w-6" /> 과학적 로또 번호 추천
          </CardTitle>
          <CardDescription className="flex items-start gap-1">
             <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
            <span>
                실제 동행복권 데이터를 기반으로 로또 번호를 추천해 드립니다. 최근 당첨 번호와 통계적 분석 결과를 확인하세요.
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {isInitialLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">최신 당첨 번호를 불러오는 중...</p>
        </div>
      )}

      {!isInitialLoading && recentDrawsForDisplay.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BarChart className="h-5 w-5 text-secondary-foreground" />최근 당첨 번호</CardTitle>
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
                    <TableCell>{win.numbers.join(', ')}</TableCell>
                    <TableCell>{win.bnusNo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <CardDescription className="text-xs mt-2">* 최근 10회차의 당첨번호입니다.</CardDescription>
          </CardContent>
        </Card>
      )}
      
      {calculatedAverages && (
         <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BarChart className="h-5 w-5 text-secondary-foreground" />최근 24회차 분석 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                    평균 당첨 번호 합계: <strong className="text-foreground">{calculatedAverages.averageSum.toFixed(2)}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                    평균 짝수:홀수 비율: <strong className="text-foreground">{calculatedAverages.averageEvenOddRatio}</strong>
                </p>
                 <p className="text-xs text-muted-foreground pt-1">{calculatedAverages.summaryForDisplay}</p>
            </CardContent>
        </Card>
      )}


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CheckSquare className="text-primary h-5 w-5" /> 번호 추천 설정
          </CardTitle>
          <CardDescription>
            포함하거나 제외하고 싶은 번호가 있다면 입력해주세요. (쉼표로 구분, 1-45 사이 숫자)
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
                      <FormLabel className="flex items-center gap-1"><CheckSquare className="h-4 w-4"/> 포함할 숫자 (선택)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="예: 7, 14, 21" {...field} />
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
                      <FormLabel className="flex items-center gap-1"><XSquare className="h-4 w-4"/> 제외할 숫자 (선택)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="예: 1, 10, 45" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading || isInitialLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "과학적 번호 추천 받기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && !isInitialLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">데이터를 분석하여 번호를 생성 중입니다...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {llmResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> AI 분석 기반 추천 번호
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className="p-4 bg-secondary/30">
                <CardHeader className="p-2 pb-1">
                    <CardTitle className="text-lg text-secondary-foreground flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" /> AI 예측 (다음 회차)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-secondary-foreground">예상 합계 범위:</strong> {llmResult.predictedSumRange}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-secondary-foreground">예상 짝수:홀수 비율:</strong> {llmResult.predictedEvenOddRatio}
                    </p>
                </CardContent>
            </Card>

            {llmResult.recommendedSets.map((set, index) => (
              <Card key={index} className="p-4 bg-secondary/30">
                 <CardHeader className="p-2 pb-1">
                   <CardTitle className="text-lg text-secondary-foreground flex items-center gap-2">
                    <Hash className="h-5 w-5" /> 추천 번호 세트 {index + 1}
                   </CardTitle>
                 </CardHeader>
                <CardContent className="p-2">
                  <div className="flex space-x-2 mb-3 flex-wrap gap-y-2">
                    {set.numbers.map((num) => (
                      <span key={num} className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md">
                        {num}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong className="text-secondary-foreground">AI 추천 근거:</strong> {set.reasoning}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
