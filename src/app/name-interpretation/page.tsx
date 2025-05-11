"use client";

import { useState } from 'react';
import Link from 'next/link';
// useRouter was present in the reverted file but not used if results are same-page.
// Keeping it for now if other links on the page might use it.
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { EAST_ASIAN_BIRTH_TIMES, CALENDAR_TYPES, GENDER_OPTIONS } from "@/lib/constants";
import { PenTool, Home, CalendarIcon, Palette, Users, TrendingUp, Gift, Sparkles as SparklesIcon, Palmtree, VenetianMask, Brain, Zap, Heart, UserCircle2, BabyIcon as BabyIconLucide, Coins } from 'lucide-react'; // Renamed Sparkles to SparklesIcon
// import hanjaData from '@/lib/hanjaData.json'; // Removed for revert
import { cn } from "@/lib/utils";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { interpretName, type InterpretNameInput, type InterpretNameOutput } from '@/ai/flows/name-interpretation-flow';

const formSchema = z.object({
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "성별을 선택해주세요."}) }),
});

type NameInterpretationFormValues = z.infer<typeof formSchema>;

const LifeStageIcon = ({ stage }: { stage: string }) => {
  switch (stage) {
    case "초년운": return <Zap className="h-5 w-5 text-yellow-500" />;
    case "중년운": return <TrendingUp className="h-5 w-5 text-green-500" />;
    case "장년운": return <Users className="h-5 w-5 text-blue-500" />;
    case "말년운": return <Palmtree className="h-5 w-5 text-purple-500" />;
    default: return <SparklesIcon className="h-5 w-5 text-gray-500" />;
  }
};

const lifeStageAgeRanges: Record<keyof InterpretNameOutput['lifeStages'], string> = {
  "초년운": "(0-25세)",
  "중년운": "(26-50세)",
  "장년운": "(51-75세)",
  "말년운": "(76세 이후)",
};


export default function NameInterpretationPage() {
  const router = useRouter(); // Kept for potential future use or if other links need it.
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<InterpretNameOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [converted, setConverted] = useState<any[]>([]); // Removed for revert


  const form = useForm<NameInterpretationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      calendarType: "solar",
      birthTime: "모름",
      name: "",
      gender: "male",
    },
  });

  // const convertNameToHanja = (koreanName: string) => { // Removed for revert
  //   const resultArr = [];
  //   for (const char of koreanName) {
  //     if (hanjaData[char as keyof typeof hanjaData]) {
  //       resultArr.push({
  //         hangul: char,
  //         hanjas: hanjaData[char as keyof typeof hanjaData],
  //       });
  //     } else {
  //       resultArr.push({
  //         hangul: char,
  //         hanjas: [],
  //       });
  //     }
  //   }
  //   return resultArr;
  // };

  async function onSubmit(values: NameInterpretationFormValues) {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const interpretationResult = await interpretName(values);
      setResult(interpretationResult);
    } catch (err) {
      console.error("이름 해석 오류:", err);
      setError(err instanceof Error ? err.message : "이름 해석 중 알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // const handleConvertHanja = () => { // Removed for revert
  //   const nameVal = form.getValues("name");
  //   if (nameVal) {
  //     const conversionResult = convertNameToHanja(nameVal);
  //     setConverted(conversionResult);
  //   }
  // };

  const orderedLifeStages: (keyof InterpretNameOutput['lifeStages'])[] = ["초년운", "중년운", "장년운", "말년운"];

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <PenTool className="text-primary h-6 w-6" /> 이름 풀이
          </CardTitle>
          <CardDescription>
            생년월일시, 이름, 성별을 입력하여 이름에 담긴 깊은 의미와 인생 경로를 알아보세요.
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
                            defaultView="years"
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
                      {/* Hanja conversion button removed for revert */}
                      {/* <div className="flex items-center gap-2"> */}
                        <FormControl>
                          <Input placeholder="이름을 입력하세요" {...field} />
                        </FormControl>
                         {/* <Button type="button" onClick={handleConvertHanja} variant="outline">한자로 변환</Button> */}
                      {/* </div> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>성별</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="성별을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner /> : "내 이름의 비밀 풀기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Hanja conversion display removed for revert */}
      {/* {converted.length > 0 && (
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl">한자 변환 결과 (참고용)</CardTitle>
            <CardDescription>선택 기능은 현재 지원되지 않습니다. 필요한 한자를 직접 입력해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            {converted.map((item, idx) => (
              <div key={idx} className="mb-2">
                <strong className="text-primary">{item.hangul}:</strong>
                <span className="text-muted-foreground ml-2">
                  {item.hanjas.length > 0 ? item.hanjas.join(', ') : "관련 한자 없음"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )} */}

      {isSubmitting && <div className="flex justify-center items-center py-10"><LoadingSpinner size={32} /><p className="ml-2 text-muted-foreground">이름을 분석 중입니다...</p></div>}
      {error && !isSubmitting && <Alert variant="destructive" className="mt-4"><AlertTitle>해석 오류</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      
      {result && !isSubmitting && (
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <SparklesIcon className="h-7 w-7 text-primary" /> {form.getValues("name")}님 이름 풀이 결과
            </CardTitle>
             <CardDescription className="text-md pt-1 flex items-center gap-1">
                <Palmtree className="h-4 w-4 text-green-600"/> 당신의 {result.gapjaYearName} ({result.zodiacColor} {result.zodiacAnimal})
             </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground"><PenTool className="h-5 w-5"/> 이름 종합 분석</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.nameAnalysis}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground"><TrendingUp className="h-5 w-5"/> 생애 주기별 운세</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderedLifeStages.map((stage) => (
                  <Card key={stage} className="bg-secondary/20 p-4">
                    <CardHeader className="p-0 pb-2 flex flex-row items-center gap-2">
                      <LifeStageIcon stage={stage} />
                      <CardTitle className="text-lg text-primary">{stage} <span className="text-sm font-normal text-muted-foreground">{lifeStageAgeRanges[stage]}</span></CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.lifeStages[stage]}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground"><Coins className="h-5 w-5 text-yellow-500"/> 재물운</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.financialLuck}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground"><Heart className="h-5 w-5 text-pink-500"/> 배우자운</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.spouseLuck}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground"><BabyIconLucide className="h-5 w-5 text-sky-500"/> 자녀운</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.childLuck}</p>
                </div>
            </div>


            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground"><Brain className="h-5 w-5"/> 주역 팔괘 분석</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.eightTrigramsAnalysis}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground"><UserCircle2 className="h-5 w-5"/> 좋은 궁합</h3>
                    <p className="text-sm text-muted-foreground"><strong>잘 맞는 띠/방향:</strong> {result.compatibility.zodiacSign}</p>
                     <div className="text-sm text-muted-foreground">
                        <strong>행운 색상:</strong>
                        <div className="flex gap-2 items-center flex-wrap mt-1">
                        {result.compatibility.colors.map(color => (
                            <span key={color} className="inline-block px-2 py-0.5 text-xs rounded-md bg-accent text-accent-foreground shadow">
                            {color}
                            </span>
                        ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-foreground"><Gift className="h-5 w-5"/> 행운의 숫자</h3>
                    <div className="flex space-x-2">
                    {result.luckyNumbers.map((num) => (
                        <span key={num} className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-md shadow-md">
                        {num}
                        </span>
                    ))}
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-auto pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/" passHref>
          <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
