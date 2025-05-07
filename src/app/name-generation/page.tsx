"use client";

import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GENDER_OPTIONS } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Baby, Sparkles } from 'lucide-react';
// Placeholder for actual AI flow import
// import { generateAuspiciousName, type GenerateAuspiciousNameInput, type GenerateAuspiciousNameOutput } from '@/ai/flows/name-generation-flow';


const formSchema = z.object({
  fatherName: z.string().min(1, "아버지 성함을 입력해주세요."),
  fatherSaju: z.string().min(1, "아버지 사주를 입력해주세요."), 
  motherName: z.string().min(1, "어머니 성함을 입력해주세요."),
  motherSaju: z.string().min(1, "어머니 사주를 입력해주세요."),
  childLastName: z.string().min(1, "자녀의 성을 입력해주세요."),
  childGender: z.enum(["male", "female"], { errorMap: () => ({ message: "자녀의 성별을 선택해주세요."}) }),
});

type NameGenerationFormValues = z.infer<typeof formSchema>;

interface GeneratedName {
  name: string;
  hanja?: string; // Optional Chinese characters
  meaning: string;
  yinYangFiveElements: string; // 음양오행
}

// Placeholder for AI response structure
interface NameGenerationResult {
  recommendedNames: GeneratedName[];
}

// Placeholder server action - replace with actual AI flow call
async function generateNames(data: NameGenerationFormValues): Promise<NameGenerationResult> {
  console.log("임시 함수: AI 이름 생성 호출됨", data);
  await new Promise(resolve => setTimeout(resolve, 2000)); // API 지연 시뮬레이션

  // 예시 데이터 반환
  const exampleNames: GeneratedName[] = [
    { name: `${data.childLastName}지우`, hanja: "智祐", meaning: "지혜롭고 복이 많음. 총명함과 신의 가호를 암시하는 이름입니다.", yinYangFiveElements: "목(木), 토(土) - 균형" },
    { name: `${data.childLastName}서준`, hanja: "瑞準", meaning: "상서롭고 기준이 됨. 좋은 원칙을 따르는 행운의 삶을 의미합니다.", yinYangFiveElements: "금(金), 수(水) - 조화" },
    { name: `${data.childLastName}하은`, hanja: "廈恩", meaning: "큰 은혜. 풍부한 축복을 받고 베푸는 사람을 의미합니다.", yinYangFiveElements: "화(火), 토(土) - 양육" },
    { name: `${data.childLastName}유찬`, hanja: "裕贊", meaning: "풍요로운 칭찬. 번영과 찬사로 가득한 삶을 암시합니다.", yinYangFiveElements: "토(土), 금(金) - 생산" },
    { name: `${data.childLastName}시_아`, hanja: "詩雅", meaning: "시적인 우아함. 세련되고 예술적인 성품을 의미합니다.", yinYangFiveElements: "수(水), 목(木) - 창조" },
  ];
  
  if (data.childGender === "female") {
    exampleNames[0].name = `${data.childLastName}지아`; // 예: 김지아
    exampleNames[1].name = `${data.childLastName}서윤`; // 예: 이서윤
  }

  return {
    recommendedNames: exampleNames.slice(0, 5), // 5개 이름 보장
  };
  // 실제 AI Flow 호출 예시:
  // const input: GenerateAuspiciousNameInput = { ...data };
  // return await generateAuspiciousName(input);
}


export default function NameGenerationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NameGenerationResult | null>(null);

  const form = useForm<NameGenerationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fatherName: "",
      fatherSaju: "",
      motherName: "",
      motherSaju: "",
      childLastName: "",
      childGender: "male",
    },
  });

  async function onSubmit(values: NameGenerationFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const generationResult = await generateNames(values);
      setResult(generationResult);
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
            <Baby className="text-primary h-6 w-6" /> 길운 작명
          </CardTitle>
          <CardDescription>
            부모님 정보를 입력하시면 자녀를 위한 아름답고 의미 있는 이름 다섯 개를 추천해 드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>아버지 성함</FormLabel>
                      <FormControl>
                        <Input placeholder="아버지 성함을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherSaju"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>아버지 사주</FormLabel>
                      <FormControl>
                        <Input placeholder="예) 연주, 월주..." {...field} />
                      </FormControl>
                      <FormDescription>아버지의 사주 정보를 입력하세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>어머니 성함</FormLabel>
                      <FormControl>
                        <Input placeholder="어머니 성함을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motherSaju"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>어머니 사주</FormLabel>
                      <FormControl>
                        <Input placeholder="예) 연주, 월주..." {...field} />
                      </FormControl>
                      <FormDescription>어머니의 사주 정보를 입력하세요.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="childLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자녀 성</FormLabel>
                      <FormControl>
                        <Input placeholder="자녀의 성을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="childGender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자녀 성별</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="자녀의 성별을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENDER_OPTIONS.map((gender) => (
                            <SelectItem key={gender.value} value={gender.value}>
                              {gender.label}
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
                {isLoading ? <LoadingSpinner size={20} /> : "길운 이름 생성하기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">완벽한 이름을 만들고 있습니다...</p>
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
              <Sparkles className="h-6 w-6 text-primary" /> 추천 이름
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.recommendedNames.map((name, index) => (
              <Card key={index} className="p-4 bg-secondary/30">
                <h3 className="text-xl font-semibold text-primary">{name.name} {name.hanja && `(${name.hanja})`}</h3>
                <p className="text-sm text-muted-foreground mt-1"><strong className="text-secondary-foreground">의미:</strong> {name.meaning}</p>
                <p className="text-sm text-muted-foreground"><strong className="text-secondary-foreground">음양오행:</strong> {name.yinYangFiveElements}</p>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
