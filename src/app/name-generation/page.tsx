
"use client";

import { useState } from 'react';
import Link from 'next/link';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { GENDER_OPTIONS, CALENDAR_TYPES, EAST_ASIAN_BIRTH_TIMES } from "@/lib/constants";
import { LoadingSpinner } from '@/components/ui/loading-spinner'; 
import { Baby, Parentheses, Home, CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";


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
  const router = useRouter();
  const [isFatherCalendarOpen, setIsFatherCalendarOpen] = useState(false);
  const [isMotherCalendarOpen, setIsMotherCalendarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


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
    setIsSubmitting(true);
    const queryParams = new URLSearchParams({
      fatherName: values.fatherName,
      fatherBirthDate: values.fatherBirthDate,
      fatherCalendarType: values.fatherCalendarType,
      fatherBirthTime: values.fatherBirthTime,
      motherName: values.motherName,
      motherBirthDate: values.motherBirthDate,
      motherCalendarType: values.motherCalendarType,
      motherBirthTime: values.motherBirthTime,
      childLastName: values.childLastName,
      childGender: values.childGender,
    }).toString();
    
    router.push(`/name-generation/result?${queryParams}`);
  }

  return (
    <div className="space-y-8 flex flex-col flex-1">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Baby className="text-primary h-6 w-6" /> 작명 도우미
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
                      <FormItem className="flex flex-col">
                        <FormLabel>아버지 생년월일</FormLabel>
                        <Popover open={isFatherCalendarOpen} onOpenChange={setIsFatherCalendarOpen}>
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
                                  setIsFatherCalendarOpen(false);
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
                      <FormItem className="flex flex-col">
                        <FormLabel>어머니 생년월일</FormLabel>
                        <Popover open={isMotherCalendarOpen} onOpenChange={setIsMotherCalendarOpen}>
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
                                setIsMotherCalendarOpen(false);
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

              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <LoadingSpinner size={20} /> : "길운 이름 생성하기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 결과 표시 로직 제거 */}

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

