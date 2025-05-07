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
import { PenTool, Palette, Users, TrendingUp, Gift } from 'lucide-react';
import { interpretName, type InterpretNameInput, type InterpretNameOutput } from '@/ai/flows/name-interpretation-flow';

const formSchema = z.object({
  birthDate: z.string().min(1, "생년월일을 입력해주세요."),
  calendarType: z.enum(["solar", "lunar"], { errorMap: () => ({ message: "달력 유형을 선택해주세요."}) }),
  birthTime: z.string().min(1, "태어난 시간을 선택해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
  nameType: z.enum(["korean", "chinese", "english"], { errorMap: () => ({ message: "이름 유형을 선택해주세요."}) }),
});

type NameInterpretationFormValues = z.infer<typeof formSchema>;


// AI 응답 구조는 InterpretNameOutput 타입을 사용합니다.
// interface NameInterpretationResult {
//   nameAnalysis: string;
//   lifeStages: {
//     초년운: string; 
//     중년운: string;
//     장년운: string;
//     말년운: string;
//   };
//   compatibility: {
//     zodiacSign: string; 
//     colors: string[];
//   };
//   luckyNumbers: number[];
// }


// 실제 AI 흐름 호출로 대체됩니다.
async function getNameInterpretation(data: NameInterpretationFormValues): Promise<InterpretNameOutput> {
  console.log("AI 이름 해석 호출됨", data);
  
  // 실제 AI Flow 호출
  // const input: InterpretNameInput = { ...data };
  // return await interpretName(input);

  // API 지연 시뮬레이션 및 예시 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 1500));

  const calendarTypeKr = CALENDAR_TYPES.find(c => c.value === data.calendarType)?.label || data.calendarType;
  const birthTimeKr = EAST_ASIAN_BIRTH_TIMES.find(t => t.value === data.birthTime)?.label || data.birthTime;
  const nameTypeKr = NAME_TYPES.find(n => n.value === data.nameType)?.label || data.nameType;

  return {
    nameAnalysis: `${data.birthDate} (${calendarTypeKr}) ${birthTimeKr}에 태어난 '${data.name}'(${nameTypeKr})님의 이름은 성명학적으로 볼 때, OOO 기운이 강하며 이는 창의성과 현실감각 사이의 조화를 의미합니다. 발음오행상으로는 X, 수리오행상으로는 Y의 특성을 지니고 있어... (더 상세한 분석 내용).`,
    lifeStages: {
      초년운: "초년에는 학업에 대한 호기심이 왕성하고 새로운 지식을 빠르게 습득하는 능력이 돋보입니다. 다만, 다소 내성적인 성향으로 인해 적극적인 친구 관계 형성에 어려움을 느낄 수 있으니, 다양한 활동 참여를 통해 사회성을 기르는 것이 중요합니다. 건강은 대체로 양호하나, 활동적인 시기인 만큼 안전사고에 유의하고 규칙적인 생활 습관을 형성하는 것이 좋습니다. 예술적 재능이 발현될 가능성이 높으니 관련 분야에 관심을 가져보는 것도 좋겠습니다.",
      중년운: "중년에는 타고난 분석력과 꾸준함을 바탕으로 전문 분야에서 두각을 나타낼 가능성이 높습니다. 직업적으로는 안정적인 성장을 이루며, 특히 연구 개발이나 교육 분야에서 큰 성과를 거둘 수 있습니다. 재물운은 꾸준히 상승하나, 투기보다는 장기적인 안목으로 안정적인 자산 관리에 힘써야 합니다. 결혼 생활에서는 배우자와의 진솔한 대화와 상호 존중이 중요하며, 자녀 양육에 있어서는 자율성을 존중하되 올바른 가치관을 심어주는 데 중점을 두어야 합니다.",
      장년운: "장년기에는 그동안 쌓아온 경험과 지혜를 바탕으로 사회적으로 존경받는 위치에 오르거나, 자신이 원하는 분야에서 의미 있는 성취를 이룰 수 있습니다. 다만, 건강 관리에 더욱 세심한 주의가 필요한 시기입니다. 규칙적인 운동과 균형 잡힌 식습관을 유지하고, 정기적인 건강 검진을 통해 잠재적인 질병을 예방하는 것이 중요합니다. 자녀들은 독립하여 각자의 길을 가고, 이들과의 원만하고 지지적인 관계 유지가 정서적 안정에 큰 도움이 될 것입니다. 새로운 취미나 학습을 통해 삶의 활력을 유지하는 것도 좋은 방법입니다.",
      말년운: "말년에는 정신적인 풍요로움과 내면의 평화를 누리며 안정된 생활을 영위할 것입니다. 과거의 노력과 성취를 바탕으로 후학을 양성하거나 사회에 공헌하는 활동에서 큰 보람을 느낄 수 있습니다. 건강은 꾸준한 관리가 중요하며, 무리한 활동보다는 명상, 가벼운 산책 등을 통해 심신의 안정을 도모하는 것이 좋습니다. 가족 및 오랜 친구들과의 따뜻한 교류가 삶의 만족도를 높여주며, 지나온 삶을 성찰하고 지혜를 나누는 시기가 될 것입니다."
    },
    compatibility: {
      zodiacSign: "원숭이띠, 쥐띠와 좋은 궁합을 이룹니다. 이들과 함께하면 긍정적인 에너지를 얻고 서로 발전할 수 있습니다.", 
      colors: ["하늘색", "연녹색", "상아색"],
    },
    luckyNumbers: [7, 16, 33].sort((a,b) => a-b)
  };
}


export default function NameInterpretationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretNameOutput | null>(null);

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
      // 실제 AI 흐름 호출
      const interpretationResult = await interpretName(values);
      // const interpretationResult = await getNameInterpretation(values); // Placeholder 사용 시
      setResult(interpretationResult);
    } catch (err) {
      console.error("이름 해석 오류:", err);
      setError(err instanceof Error ? err.message : "이름 해석 중 알 수 없는 오류가 발생했습니다.");
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
              <p className="text-muted-foreground whitespace-pre-wrap">{result.nameAnalysis}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-secondary-foreground"/>생애 주기별 운세</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">초년운</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.lifeStages.초년운}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">중년운</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.lifeStages.중년운}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">장년운</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.lifeStages.장년운}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">말년운</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.lifeStages.말년운}</p></CardContent>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-secondary-foreground"/>좋은 궁합</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">띠: {result.compatibility.zodiacSign}</p>
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
