
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EAST_ASIAN_BIRTH_TIMES, CALENDAR_TYPES } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, Home, Sparkles, MessageSquare, Hash } from 'lucide-react';
import { recommendLottoNumbers, type LottoNumberRecommendationInput, type LottoNumberRecommendationOutput } from '@/ai/flows/lotto-number-recommendation-flow';

const formSchema = z.object({
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
});

type LottoRecommendationFormValues = z.infer<typeof formSchema>;

const getLottoBallColorClass = (number: number): string => {
  if (number >= 1 && number <= 10) return 'bg-yellow-400 text-black';
  if (number >= 11 && number <= 20) return 'bg-blue-500 text-white';
  if (number >= 21 && number <= 30) return 'bg-red-500 text-white';
  if (number >= 31 && number <= 40) return 'bg-gray-600 text-white';
  if (number >= 41 && number <= 45) return 'bg-green-500 text-white';
  return 'bg-gray-300 text-black'; // Default/fallback
};

const LottoBall = ({ number }: { number: number }) => {
  return (
    <div className={`flex items-center justify-center h-10 w-10 rounded-full font-bold text-lg shadow-md ${getLottoBallColorClass(number)}`}>
      {number}
    </div>
  );
};

export default function SajuLottoRecommendationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LottoNumberRecommendationOutput | null>(null);

  const form = useForm<LottoRecommendationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      calendarType: "solar",
      birthTime: "모름",
      name: "",
    },
  });

  async function onSubmit(values: LottoRecommendationFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const recommendationResult = await recommendLottoNumbers(values as LottoNumberRecommendationInput);
      setResult(recommendationResult);
    } catch (err) {
      console.error("사주 로또 번호 추천 오류:", err);
      setError(err instanceof Error ? err.message : "사주 로또 번호 추천 중 알 수 없는 오류가 발생했습니다.");
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
            <Ticket className="text-primary h-6 w-6" /> 사주 로또 번호 추천
          </CardTitle>
          <CardDescription>
            당신의 사주 정보를 입력하시면 특별한 행운 번호를 추천해 드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>생년월일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="calendarType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>달력 유형</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="달력 유형을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CALENDAR_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>태어난 시간</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="태어난 시간을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EAST_ASIAN_BIRTH_TIMES.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input placeholder="이름을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "사주 행운 번호 받기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">사주를 분석하여 번호를 생성 중입니다...</p>
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
                <Sparkles className="h-6 w-6 text-primary" /> 당신의 사주에 맞는 행운의 로또 번호
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.lottoSets.map((set, index) => (
              <Card key={index} className="p-4 bg-secondary/30">
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-lg text-secondary-foreground flex items-center gap-2">
                     <Hash className="h-5 w-5" /> 추천 번호 세트 {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="flex space-x-2 mb-3 flex-wrap gap-y-2">
                    {set.numbers.map((num) => (
                       <LottoBall key={num} number={num} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap"><strong className="text-secondary-foreground">해설:</strong> {set.reasoning}</p>
                </CardContent>
              </Card>
            ))}
            
            <div className="pt-4 border-t">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-secondary-foreground"/> 전반적인 행운 조언
              </h3>
              <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{result.overallAdvice}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
