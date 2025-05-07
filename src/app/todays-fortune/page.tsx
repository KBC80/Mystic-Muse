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

const formSchema = z.object({
  birthDate: z.string().min(1, "Birth date is required."),
  calendarType: z.enum(["solar", "lunar"]),
  birthTime: z.string().min(1, "Birth time is required."),
  name: z.string().min(1, "Name is required."),
});

type TodaysFortuneFormValues = z.infer<typeof formSchema>;

// Placeholder for AI response structure
interface TodaysFortuneResult {
  overallFortune: string; // (love, health, work, relationships)
  love: string;
  health: string;
  work: string;
  relationships: string;
  luckyNumbers: number[];
}

// Placeholder server action
async function getTodaysFortune(data: TodaysFortuneFormValues): Promise<TodaysFortuneResult> {
  console.log("Placeholder: AI Today's Fortune called with", data);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

  // Return mock data
  return {
    overallFortune: `Today, ${data.name}, your energy is vibrant and opportunities may arise unexpectedly. Focus on clear communication and stay open to new experiences. A generally positive day ahead!`,
    love: "A good day for deepening connections. If single, a chance encounter could be meaningful. For those in relationships, express your appreciation.",
    health: "Energy levels are good. Consider some light exercise. Pay attention to hydration.",
    work: "Productivity is high. A good day to tackle challenging tasks. Collaboration will be fruitful.",
    relationships: "Social interactions are favored. Reconnect with old friends or make new ones. Harmony in family life.",
    luckyNumbers: [Math.floor(Math.random() * 45) + 1, Math.floor(Math.random() * 45) + 1, Math.floor(Math.random() * 45) + 1].filter((v, i, a) => a.indexOf(v) === i).slice(0,3)
  };
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
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CalendarHeart className="text-primary h-6 w-6" /> Today's Fortune
          </CardTitle>
          <CardDescription>
            Discover your fortune for today across various aspects of life. Enter your details below.
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
                      <FormLabel>Date of Birth</FormLabel>
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
                      <FormLabel>Calendar Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select calendar type" />
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
                      <FormLabel>Time of Birth (Eastern tradition)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select birth time" />
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "Reveal Today's Fortune"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">Reading the stars for you...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Your Fortune for Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2"><Star className="h-5 w-5 text-secondary-foreground"/>Overall Fortune</h3>
              <p className="text-muted-foreground">{result.overallFortune}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center gap-2"><Heart className="h-5 w-5 text-pink-500"/><CardTitle className="text-lg">Love</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.love}</p></CardContent>
              </Card>
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center gap-2"><Shield className="h-5 w-5 text-green-500"/><CardTitle className="text-lg">Health</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.health}</p></CardContent>
              </Card>
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center gap-2"><Briefcase className="h-5 w-5 text-blue-500"/><CardTitle className="text-lg">Work/Career</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.work}</p></CardContent>
              </Card>
              <Card className="bg-secondary/20">
                <CardHeader className="pb-2 flex flex-row items-center gap-2"><Users className="h-5 w-5 text-yellow-500"/><CardTitle className="text-lg">Relationships</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.relationships}</p></CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-secondary-foreground"/>Today's Lucky Numbers</h3>
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
