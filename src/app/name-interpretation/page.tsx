"use client";

import { useState, type FormEvent } from 'react';
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EAST_ASIAN_BIRTH_TIMES, CALENDAR_TYPES, NAME_TYPES } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PenTool, Palette, Users, Heart, Shield, Briefcase, TrendingUp, Gift } from 'lucide-react';
// Placeholder for actual AI flow import
// import { interpretName, type InterpretNameInput, type InterpretNameOutput } from '@/ai/flows/name-interpretation-flow';

const formSchema = z.object({
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
  nameType: z.enum(["korean", "chinese", "english"], { errorMap: () => ({ message: "이름 유형을 선택해주세요."}) }),
});

type NameInterpretationFormValues = z.infer<typeof formSchema>;

// Placeholder for AI response structure
interface NameInterpretationResult {
  nameAnalysis: string;
  lifeStages: {
    earlyYears: string; // (애정, 건강, 직업)
    middleYears: string;
    laterYears: string;
    finalYears: string;
  };
  compatibility: {
    zodiacSign: string; // 띠
    colors: string[];
  };
  luckyNumbers: number[];
}

// Placeholder server action - replace with actual AI flow call
async function getNameInterpretation(data: NameInterpretationFormValues): Promise<NameInterpretationResult> {
  console.log("임시 함수: AI 이름 해석 호출됨", data);
  // API 지연 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1500));

  const calendarTypeKr = CALENDAR_TYPES.find(c => c.value === data.calendarType)?.label || data.calendarType;
  const birthTimeKr = EAST_ASIAN_BIRTH_TIMES.find(t => t.value === data.birthTime)?.label || data.birthTime;
  const nameTypeKr = NAME_TYPES.find(n => n.value === data.nameType)?.label || data.nameType;

  // 예시 데이터 반환 (한국어)
  return {
    nameAnalysis: `${data.birthDate} (${calendarTypeKr}) ${birthTimeKr}에 태어난 '${data.name}'(${nameTypeKr})님의 이름을 분석한 결과, 역동적이면서도 사려 깊은 성향을 나타냅니다. 이 이름은 창의성과 리더십의 에너지와 공명합니다.`,
    lifeStages: {
      earlyYears: "초년: 학업과 강한 유대감 형성에 중점을 둡니다. 애정: 유망. 건강: 대체로 양호. 직업: 기초 다짐.",
      middleYears: "중년: 직업 및 개인적 성취에서 상당한 성장을 이룹니다. 애정: 안정적. 건강: 균형 잡힌 생활 유지. 직업: 최고 성과.",
      laterYears: "말년: 지혜와 성취감을 가져옵니다. 유산과 가족에 초점 이동. 애정: 깊은 관계. 건강: 주의 필요. 직업: 멘토 역할.",
      finalYears: "노년: 성찰과 평화의 시기. 노력의 결실을 즐깁니다. 애정: 소중함. 건강: 부드러운 관리. 직업: 유산."
    },
    compatibility: {
      zodiacSign: "용띠", // 예시
      colors: ["진청색", "금색", "숲 녹색"],
    },
    luckyNumbers: [Math.floor(Math.random() * 45) + 1, Math.floor(Math.random() * 45) + 1, Math.floor(Math.random() * 45) + 1].filter((v, i, a) => a.indexOf(v) === i).slice(0,3) // 중복 없는 숫자
  };
  // 실제 AI Flow 호출 예시:
  // const input: InterpretNameInput = { ...data };
  // return await interpretName(input);
}


export default function NameInterpretationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NameInterpretationResult | null>(null);

  const form = useForm<NameInterpretationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: "",
      calendarType: "solar",
      birthTime: "",
      name: "",
      nameType: "korean",
    },
  });

  async function onSubmit(values: NameInterpretationFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const interpretationResult = await getNameInterpretation(values);
      setResult(interpretationResult);
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
            <PenTool className="text-primary h-6 w-6" /> 이름 뜻 풀이 (성명학)
          </CardTitle>
          <CardDescription>
            생년월일시와 이름을 입력하여 이름에 담긴 깊은 의미와 인생 경로를 알아보세요.
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
                <FormField
                  control={form.control}
                  name="nameType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름 유형</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="이름 유형을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NAME_TYPES.map((type) => (
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
              </div>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "내 이름의 비밀 풀기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">당신의 운명을 분석 중입니다...</p>
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
            <CardTitle className="text-2xl text-primary">이름 풀이 결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2"><PenTool className="h-5 w-5 text-secondary-foreground"/>이름 분석</h3>
              <p className="text-muted-foreground">{result.nameAnalysis}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-secondary-foreground"/>생애 주기별 운세</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">초년운</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{result.lifeStages.earlyYears}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">중년운</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{result.lifeStages.middleYears}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">말년운</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{result.lifeStages.laterYears}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">노년운</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{result.lifeStages.finalYears}</p></CardContent>
                </Card>
              </div>
               <p className="text-xs text-muted-foreground mt-2">포함된 요소: 애정 (<Heart className="inline h-3 w-3"/>), 건강 (<Shield className="inline h-3 w-3"/>), 직업 (<Briefcase className="inline h-3 w-3"/>).</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-secondary-foreground"/>좋은 궁합</h3>
                <p className="text-muted-foreground">띠: {result.compatibility.zodiacSign}</p>
                <p className="text-muted-foreground">색상: <span className="flex gap-1 items-center flex-wrap">{result.compatibility.colors.map(color => <span key={color} className="inline-block px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground">{color}</span>)}</span></p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-secondary-foreground"/>행운의 숫자</h3>
                <div className="flex space-x-2">
                  {result.luckyNumbers.map((num) => (
                    <span key={num} className="flex items-center justify-center h-10 w-10 rounded-full bg-accent text-accent-foreground font-bold text-lg shadow-md">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
