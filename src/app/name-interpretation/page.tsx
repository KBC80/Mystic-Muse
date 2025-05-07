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

const formSchema = z.object({
  birthDate: z.string().min(1, "Birth date is required."),
  calendarType: z.enum(["solar", "lunar"]),
  birthTime: z.string().min(1, "Birth time is required."),
  name: z.string().min(1, "Name is required."),
  nameType: z.enum(["korean", "chinese", "english"]),
});

type NameInterpretationFormValues = z.infer<typeof formSchema>;

// Placeholder for AI response structure
interface NameInterpretationResult {
  nameAnalysis: string;
  lifeStages: {
    earlyYears: string; // (love, health, career)
    middleYears: string;
    laterYears: string;
    finalYears: string;
  };
  compatibility: {
    zodiacSign: string;
    colors: string[];
  };
  luckyNumbers: number[];
}

// Placeholder server action
async function getNameInterpretation(data: NameInterpretationFormValues): Promise<NameInterpretationResult> {
  console.log("Placeholder: AI Name Interpretation called with", data);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock data
  return {
    nameAnalysis: `Based on ${data.nameType} name '${data.name}', born on ${data.birthDate} (${data.calendarType}) at ${data.birthTime}, the analysis reveals a personality that is both dynamic and thoughtful. The name resonates with energies of creativity and leadership.`,
    lifeStages: {
      earlyYears: "Early years show a focus on learning and forming strong bonds. Love: Promising. Health: Generally good. Career: Foundations are laid.",
      middleYears: "Middle years are marked by significant growth in career and personal achievements. Love: Stable. Health: Maintain a balanced lifestyle. Career: Peak performance.",
      laterYears: "Later years bring wisdom and fulfillment. Focus shifts to legacy and family. Love: Deep connections. Health: Requires attention. Career: Mentorship role.",
      finalYears: "Final years are for reflection and peace. Enjoying the fruits of labor. Love: Cherished. Health: Gentle care. Career: Legacy."
    },
    compatibility: {
      zodiacSign: "Dragon", // Example
      colors: ["Deep Indigo", "Gold", "Forest Green"],
    },
    luckyNumbers: [Math.floor(Math.random() * 45) + 1, Math.floor(Math.random() * 45) + 1, Math.floor(Math.random() * 45) + 1].filter((v, i, a) => a.indexOf(v) === i).slice(0,3) // ensure unique numbers
  };
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
            <PenTool className="text-primary h-6 w-6" /> Name Meaning Analysis
          </CardTitle>
          <CardDescription>
            Enter your birth information and name to discover its profound meanings and your life path.
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
                <FormField
                  control={form.control}
                  name="nameType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select name type" />
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
                {isLoading ? <LoadingSpinner size={20} /> : "Reveal My Name's Secrets"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">Analyzing your destiny...</p>
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
            <CardTitle className="text-2xl text-primary">Your Name Interpretation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2"><PenTool className="h-5 w-5 text-secondary-foreground"/>Name Analysis</h3>
              <p className="text-muted-foreground">{result.nameAnalysis}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-secondary-foreground"/>Life Stages Fortune</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Early Years</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{result.lifeStages.earlyYears}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Middle Years</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{result.lifeStages.middleYears}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Later Years</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{result.lifeStages.laterYears}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Final Years</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{result.lifeStages.finalYears}</p></CardContent>
                </Card>
              </div>
               <p className="text-xs text-muted-foreground mt-2">Aspects covered: Love (<Heart className="inline h-3 w-3"/>), Health (<Shield className="inline h-3 w-3"/>), Career (<Briefcase className="inline h-3 w-3"/>).</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-secondary-foreground"/>Good Compatibility</h3>
                <p className="text-muted-foreground">Zodiac Sign: {result.compatibility.zodiacSign}</p>
                <p className="text-muted-foreground">Colors: <span className="flex gap-1 items-center">{result.compatibility.colors.map(color => <span key={color} className="inline-block px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground">{color}</span>)}</span></p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-secondary-foreground"/>Lucky Numbers</h3>
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
