"use client";

import { useState } from 'react';
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
import { CalendarHeart, Heart, Shield, Briefcase, Users, Star, Gift } from 'lucide-react';
// Placeholder for actual AI flow import
// import { getDailyFortune, type GetDailyFortuneInput, type GetDailyFortuneOutput } from '@/ai/flows/todays-fortune-flow';


const formSchema = z.object({
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
});

type TodaysFortuneFormValues = z.infer<typeof formSchema>;

// Placeholder for AI response structure
interface TodaysFortuneResult {
  overallFortune: string; // (애정, 건강, 직업, 대인관계)
  love: string;
  health: string;
  work: string;
  relationships: string;
  luckyNumbers: number[];
}

// Placeholder server action - replace with actual AI flow call
async function getTodaysFortune(data: TodaysFortuneFormValues): Promise<TodaysFortuneResult> {
  console.log("임시 함수: AI 오늘의 운세 호출됨", data);
  await new Promise(resolve => setTimeout(resolve, 1500)); // API 지연 시뮬레이션

  // 예시 데이터 반환 (한국어)
  return {
    overallFortune: `오늘, ${data.name}님, 당신의 에너지는 활기차고 예상치 못한 기회가 생길 수 있습니다. 명확한 의사소통에 집중하고 새로운 경험에 열려 있으세요. 전반적으로 긍정적인 하루가 될 것입니다!`,
    love: "관계를 깊게 하기에 좋은 날입니다. 싱글이라면 우연한 만남이 의미 있을 수 있습니다. 연인이 있다면 감사를 표현하세요.",
    health: "에너지 레벨이 좋습니다. 가벼운 운동을 고려해보세요. 수분 섭취에 신경 쓰세요.",
    work: "생산성이 높습니다. 어려운 작업을 처리하기 좋은 날입니다. 협업이 결실을 맺을 것입니다.",
    relationships: "사교 활동이 유리합니다. 오랜 친구와 다시 연락하거나 새로운 친구를 사귀세요. 가족 생활에 조화가 있습니다.",
    luckyNumbers: [Math.floor(Math.random() * 45) + 1, Math.floor(Math.random() * 45) + 1, Math.floor(Math.random() * 45) + 1].filter((v, i, a) => a.indexOf(v) === i).slice(0,3)
  };
  // 실제 AI Flow 호출 예시:
  // const input: GetDailyFortuneInput = { ...data };
  // return await getDailyFortune(input);
}


export default function TodaysFortunePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TodaysFortuneResult | null>(null);

  const form = useForm<TodaysFortuneFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      calendarType: "solar",
      birthTime: "",
      name: "",
    },
  });

  async function onSubmit(values: TodaysFortuneFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const fortuneResult = await getTodaysFortune(values);
      setResult(fortuneResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CalendarHeart className="text-primary h-6 w-6" /> 오늘의 운세
          </CardTitle>
          <CardDescription>
            오늘의 다양한 측면에서의 운세를 알아보세요. 아래에 정보를 입력해주세요.
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
                {isLoading ? <LoadingSpinner size={20} /> : "오늘의 운세 보기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">별의 기운을 읽고 있습니다...</p>
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
            <CardTitle className="text-2xl text-primary">오늘의 운세</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2"><Star className="h-5 w-5 text-secondary-foreground"/>종합운</h3>
              <p className="text-muted-foreground">{result.overallFortune}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center gap-2"><Heart className="h-5 w-5 text-pink-500"/><CardTitle className="text-lg">애정운</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.love}</p></CardContent>
              </Card>
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center gap-2"><Shield className="h-5 w-5 text-green-500"/><CardTitle className="text-lg">건강운</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.health}</p></CardContent>
              </Card>
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center gap-2"><Briefcase className="h-5 w-5 text-blue-500"/><CardTitle className="text-lg">직업운</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.work}</p></CardContent>
              </Card>
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center gap-2"><Users className="h-5 w-5 text-yellow-500"/><CardTitle className="text-lg">대인관계운</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.relationships}</p></CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-secondary-foreground"/>오늘의 행운의 숫자</h3>
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
