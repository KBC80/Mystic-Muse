
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { EAST_ASIAN_BIRTH_TIMES, CALENDAR_TYPES } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarHeart, Heart, Shield, Briefcase, Users, Star, Gift, Home, CalendarIcon, Sparkles, Palmtree, VenetianMask } from 'lucide-react';
import { getDailyFortune, type GetDailyFortuneInput, type GetDailyFortuneOutput } from '@/ai/flows/todays-fortune-flow';
import { cn } from "@/lib/utils";


const formSchema = z.object({
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
});

type TodaysFortuneFormValues = z.infer<typeof formSchema>;

export default function TodaysFortunePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GetDailyFortuneOutput | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<TodaysFortuneFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      calendarType: "solar",
      birthTime: "모름",
      name: "",
    },
  });

  async function onSubmit(values: TodaysFortuneFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const fortuneResult = await getDailyFortune(values as GetDailyFortuneInput);
      setResult(fortuneResult);
    } catch (err) {
      console.error("오늘의 운세 오류:", err);
      setError(err instanceof Error ? err.message : "오늘의 운세 확인 중 알 수 없는 오류가 발생했습니다.");
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
                    <FormItem className="flex flex-col">
                      <FormLabel>생년월일</FormLabel>
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: ko })
                              ) : (
                                <span>생년월일을 선택하세요</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                                field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                setIsCalendarOpen(false);
                              }
                            }
                            disabled={(date) =>
                              date > new Date() || date < new Date("1920-01-01")
                            }
                            fromYear={1920}
                            toYear={new Date().getFullYear()}
                            captionLayout="dropdown-buttons"
                          />
                        </PopoverContent>
                      </Popover>
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
            <CardTitle className="text-2xl text-primary">오늘의 운세 ({form.getValues("name")}님)</CardTitle>
            <CardDescription className="flex items-center gap-1 pt-1">
              <Sparkles className="h-4 w-4 text-yellow-500"/> 당신의 {result.gapjaYearName} ({result.zodiacColor} {result.zodiacAnimal})
            </CardDescription>
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

