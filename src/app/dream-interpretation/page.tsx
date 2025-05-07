
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { dreamInterpretation, type DreamInterpretationOutput, type DreamInterpretationInput } from '@/ai/flows/dream-interpretation';
import { CloudMoon, Sparkles, AlertTriangle, Gift, WandSparkles, Home } from 'lucide-react';

const formSchema = z.object({
  dreamContent: z.string().min(10, "꿈 내용을 최소 10자 이상 입력해주세요."),
});

type DreamInterpretationFormValues = z.infer<typeof formSchema>;

export default function DreamInterpretationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DreamInterpretationOutput | null>(null);

  const form = useForm<DreamInterpretationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dreamContent: "",
    },
  });

  async function onSubmit(values: DreamInterpretationFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const interpretationResult = await dreamInterpretation(values as DreamInterpretationInput);
      setResult(interpretationResult);
    } catch (err) {
      console.error("꿈 해석 오류:", err);
      setError(err instanceof Error ? err.message : "꿈 해석 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }
  
  const getOmenText = (omen: 'good' | 'bad' | 'neutral') => {
    switch (omen) {
      case 'good':
        return '좋은 징조';
      case 'bad':
        return '나쁜 징조';
      default:
        return '중립적인 징조';
    }
  };

  const getOmenStyle = (omen: 'good' | 'bad' | 'neutral') => {
    switch (omen) {
      case 'good':
        return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'bad':
        return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
    }
  };


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
            <CloudMoon className="text-primary h-6 w-6" /> 꿈 해석
          </CardTitle>
          <CardDescription>
            당신의 꿈을 설명해주시면 숨겨진 의미와 상징을 찾는 데 도움을 드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dreamContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>당신의 꿈</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="예) 광활한 바다 위를 나는 꿈을 꾸었어요..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      자세한 내용을 제공할수록 더 나은 해석을 받을 수 있습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "내 꿈 해석하기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">당신의 꿈의 신비를 풀고 있습니다...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>해석 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <WandSparkles className="h-6 w-6 text-primary"/> 당신의 꿈의 의미
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary-foreground"/> 꿈 요약
              </h3>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">상징 분석</h3>
              <p className="text-muted-foreground">{result.symbolAnalysis}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">징조</h3>
              <p className={`px-3 py-1 inline-block rounded-md text-sm font-medium ${getOmenStyle(result.omen)}`}>
                {getOmenText(result.omen)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-secondary-foreground"/> 추가 주의사항
                </h3>
                <p className="text-muted-foreground">{result.additionalCautions}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary-foreground"/> 좋은 운세
                </h3>
                <p className="text-muted-foreground">{result.goodFortune}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-secondary-foreground"/> 꿈에서 나온 행운의 숫자</h3>
              <div className="flex space-x-2 mt-2">
                {result.luckyNumbers.map((num) => (
                  <span key={num} className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold text-lg shadow-md">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
