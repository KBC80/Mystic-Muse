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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { dreamInterpretation, type DreamInterpretationOutput, type DreamInterpretationInput } from '@/ai/flows/dream-interpretation';
import { CloudMoon, Sparkles, AlertTriangle, Gift, WandSparkles } from 'lucide-react';

const formSchema = z.object({
  dreamContent: z.string().min(10, "Please describe your dream in at least 10 characters."),
});

type DreamInterpretationFormValues = z.infer<typeof formSchema>;

export default function DreamInterpretationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DreamInterpretationOutput | null>(null);

  const form = useForm<DreamInterpretationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dreamContent: "",
    },
  });

  async function onSubmit(values: DreamInterpretationFormValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const interpretationResult = await dreamInterpretation(values as DreamInterpretationInput);
      setResult(interpretationResult);
    } catch (err) {
      console.error("Dream interpretation error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during dream interpretation.");
    } finally {
      setIsLoading(false);
    }
  }
  
  const getOmenStyle = (omen: 'good' | 'bad' | 'neutral') => {
    switch (omen) {
      case 'good':
        return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'bad':
        return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
    }
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CloudMoon className="text-primary h-6 w-6" /> Dream Interpretation
          </CardTitle>
          <CardDescription>
            Describe your dream, and we'll help you uncover its hidden meanings and symbols.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dreamContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Dream</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I dreamt of flying over a vast ocean..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more details you provide, the better the interpretation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <LoadingSpinner size={20} /> : "Interpret My Dream"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">Unraveling the mysteries of your dream...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Interpretation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <WandSparkles className="h-6 w-6 text-primary"/> Your Dream's Meaning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary-foreground"/> Dream Summary
              </h3>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Symbol Analysis</h3>
              <p className="text-muted-foreground">{result.symbolAnalysis}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Omen</h3>
              <p className={`px-3 py-1 inline-block rounded-md text-sm font-medium ${getOmenStyle(result.omen)}`}>
                {result.omen.charAt(0).toUpperCase() + result.omen.slice(1)} Omen
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-secondary-foreground"/> Additional Cautions
                </h3>
                <p className="text-muted-foreground">{result.additionalCautions}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary-foreground"/> Good Fortune
                </h3>
                <p className="text-muted-foreground">{result.goodFortune}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold flex items-center gap-2"><Gift className="h-5 w-5 text-secondary-foreground"/> Lucky Numbers from Your Dream</h3>
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
