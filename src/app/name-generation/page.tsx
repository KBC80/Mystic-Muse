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
import { GENDER_OPTIONS, CALENDAR_TYPES, EAST_ASIAN_BIRTH_TIMES } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Baby, Sparkles, Parentheses, CalendarDays, Clock } from 'lucide-react';
import { generateAuspiciousName, type GenerateAuspiciousNameInput, type GenerateAuspiciousNameOutput } from '@/ai/flows/name-generation-flow';


const formSchema = z.object({
  fatherName: z.string().min(1, "아버지 성함을 입력해주세요."),
  fatherBirthDate: z.string().min(1, "아버지 생년월일을 입력해주세요."),
  fatherCalendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "아버지 달력 유형을 선택해주세요."}) }),
  fatherBirthTime: z.string().min(1, "아버지 태어난 시간을 선택해주세요."),
  motherName: z.string().min(1, "어머니 성함을 입력해주세요."),
  motherBirthDate: z.string().min(1, "어머니 생년월일을 입력해주세요."),
  motherCalendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "어머니 달력 유형을 선택해주세요."}) }),
  motherBirthTime: z.string().min(1, "어머니 태어난 시간을 선택해주세요."),
  childLastName: z.string().min(1, "자녀의 성을 입력해주세요."),
  childGender: z.enum(["male", "female"], { errorMap: () => ({ message: "자녀의 성별을 선택해주세요."}) }),
});

type NameGenerationFormValues = z.infer<typeof formSchema>;

export default function NameGenerationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateAuspiciousNameOutput | null>(null);

  const form = useForm<NameGenerationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fatherName: "",
      fatherBirthDate: "",
      fatherCalendarType: "solar",
      fatherBirthTime: "모름",
      motherName: "",
      motherBirthDate: "",
      motherCalendarType: "solar",
      motherBirthTime: "모름",
      childLastName: "",
      childGender: "male",
    },
  });

  async function onSubmit(values: NameGenerationFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const input: GenerateAuspiciousNameInput = { ...values };
      const generationResult = await generateAuspiciousName(input);
      setResult(generationResult);
    } catch (err) {
      console.error("이름 생성 오류:", err);
      setError(err instanceof Error ? err.message : "이름 생성 중 알 수 없는 오류가 발생했습니다.");
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
            부모님과 자녀 정보를 입력하시면 아이를 위한 아름답고 의미 있는 이름 다섯 개를 추천해 드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><Parentheses className="h-5 w-5"/>아버지 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>아버지 성함</FormLabel>
                        <FormControl>
                          <Input placeholder="홍길동" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherBirthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>아버지 생년월일</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherCalendarType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>아버지 달력 유형</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="달력 유형 선택" />
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
                    name="fatherBirthTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>아버지 태어난 시간</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="태어난 시간 선택" />
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><Parentheses className="h-5 w-5"/>어머니 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>어머니 성함</FormLabel>
                        <FormControl>
                          <Input placeholder="성춘향" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="motherBirthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>어머니 생년월일</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherCalendarType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>어머니 달력 유형</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="달력 유형 선택" />
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
                    name="motherBirthTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>어머니 태어난 시간</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="태어난 시간 선택" />
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
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2"><Baby className="h-5 w-5"/>자녀 정보</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name="childLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>자녀 성</FormLabel>
                          <FormControl>
                            <Input placeholder="예) 김" {...field} />
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
                <p className="text-sm text-muted-foreground"><strong className="text-secondary-foreground">음양오행 및 사주 조화:</strong> {name.yinYangFiveElements}</p>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
