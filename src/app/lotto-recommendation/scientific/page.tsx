
"use client";

import { useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Home, TestTubeDiagonal, BarChart, CheckSquare, XSquare, Sparkles, Hash } from 'lucide-react';
import { recommendScientificLottoNumbers, type ScientificLottoRecommendationInput, type ScientificLottoRecommendationOutput } from '@/ai/flows/scientific-lotto-recommendation-flow';

const formSchema = z.object({
  includeNumbers: z.string().optional(),
  excludeNumbers: z.string().optional(),
});

type ScientificLottoFormValues = z.infer<typeof formSchema>;

interface WinningNumber {
  drawNumber: number;
  date: string;
  numbers: number[];
  bonus: number;
}

const MOCK_HISTORICAL_WINS: WinningNumber[] = [
  { drawNumber: 1125, date: '2024-06-22', numbers: [5, 11, 13, 15, 30, 45], bonus: 4 },
  { drawNumber: 1124, date: '2024-06-15', numbers: [3, 8, 17, 30, 33, 34], bonus: 26 },
  { drawNumber: 1123, date: '2024-06-08', numbers: [10, 16, 20, 22, 27, 40], bonus: 1 },
  { drawNumber: 1122, date: '2024-06-01', numbers: [7, 12, 20, 27, 29, 37], bonus: 26 },
];

const MOCK_ANALYSIS = {
  last24DrawsSumAvg: 138,
  last24DrawsEvenOddRatio: '평균 3:3 (짝:홀)',
  summaryForAI: "최근 24회차 당첨 번호의 합계 평균은 약 138이며, 짝수와 홀수의 비율은 평균적으로 3:3으로 나타납니다. 최근 자주 등장한 숫자는 20, 27, 30 이며, 오랫동안 등장하지 않은 숫자는 9, 21 입니다."
};

export default function ScientificLottoRecommendationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScientificLottoRecommendationOutput | null>(null);

  const form = useForm<ScientificLottoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      includeNumbers: "",
      excludeNumbers: "",
    },
  });

  const parseNumbers = (str: string | undefined): number[] | undefined => {
    if (!str) return undefined;
    return str.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n >= 1 && n <= 45);
  };

  async function onSubmit(values: ScientificLottoFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const includeNumbers = parseNumbers(values.includeNumbers);
    const excludeNumbers = parseNumbers(values.excludeNumbers);

    // Validate parsed numbers
    if (values.includeNumbers && (!includeNumbers || includeNumbers.some(n => n < 1 || n > 45))) {
      form.setError("includeNumbers", { type: "manual", message: "1과 45 사이의 숫자를 쉼표로 구분하여 입력해주세요." });
      setIsLoading(false);
      return;
    }
    if (values.excludeNumbers && (!excludeNumbers || excludeNumbers.some(n => n < 1 || n > 45))) {
      form.setError("excludeNumbers", { type: "manual", message: "1과 45 사이의 숫자를 쉼표로 구분하여 입력해주세요." });
      setIsLoading(false);
      return;
    }
    
    // Check for overlap between include and exclude numbers
    if (includeNumbers && excludeNumbers) {
        const overlap = includeNumbers.some(n => excludeNumbers.includes(n));
        if (overlap) {
            setError("포함할 숫자와 제외할 숫자에 중복된 값이 있습니다.");
            setIsLoading(false);
            return;
        }
    }


    try {
      const input: ScientificLottoRecommendationInput = {
        historicalDataSummary: MOCK_ANALYSIS.summaryForAI,
        includeNumbers: includeNumbers,
        excludeNumbers: excludeNumbers,
      };
      const recommendationResult = await recommendScientificLottoNumbers(input);
      setResult(recommendationResult);
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
          <CardDescription>
            과거 당첨 데이터 및 통계 분석을 기반으로 로또 번호를 추천해 드립니다.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><BarChart className="h-5 w-5 text-secondary-foreground" />최근 당첨 번호 예시</CardTitle>
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
              {MOCK_HISTORICAL_WINS.map((win) => (
                <TableRow key={win.drawNumber}>
                  <TableCell>{win.drawNumber}회</TableCell>
                  <TableCell>{win.date}</TableCell>
                  <TableCell>{win.numbers.join(', ')}</TableCell>
                  <TableCell>{win.bonus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><BarChart className="h-5 w-5 text-secondary-foreground" />최근 24회차 분석 (예시)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground"><strong>평균 당첨 번호 합계:</strong> {MOCK_ANALYSIS.last24DrawsSumAvg}</p>
          <p className="text-muted-foreground"><strong>짝수:홀수 비율:</strong> {MOCK_ANALYSIS.last24DrawsEvenOddRatio}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CheckSquare className="text-primary h-5 w-5" /> 번호 추천 설정
          </CardTitle>
          <CardDescription>
            포함하거나 제외하고 싶은 번호가 있다면 입력해주세요. (쉼표로 구분)
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
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "과학적 번호 추천 받기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
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

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> 과학적 분석 기반 추천 번호
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.recommendedSets.map((set, index) => (
              <Card key={index} className="p-4 bg-secondary/30">
                 <CardHeader className="p-2 pb-1">
                   <CardTitle className="text-lg text-secondary-foreground flex items-center gap-2">
                    <Hash className="h-5 w-5" /> 추천 번호 세트 {index + 1}
                   </CardTitle>
                 </CardHeader>
                <CardContent className="p-2">
                  <div className="flex space-x-2 mb-3">
                    {set.numbers.map((num) => (
                      <span key={num} className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-md">
                        {num}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong className="text-secondary-foreground">추천 근거:</strong> {set.reasoning}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
