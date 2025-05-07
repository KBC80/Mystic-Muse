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

const formSchema = z.object({
  fatherName: z.string().min(1, "Father's name is required."),
  fatherSaju: z.string().min(1, "Father's Saju (사주) is required."), // Saju can be complex, using string for simplicity
  motherName: z.string().min(1, "Mother's name is required."),
  motherSaju: z.string().min(1, "Mother's Saju (사주) is required."),
  childLastName: z.string().min(1, "Child's last name is required."),
  childGender: z.enum(["male", "female"]),
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

// Placeholder server action
async function generateNames(data: NameGenerationFormValues): Promise<NameGenerationResult> {
  console.log("Placeholder: AI Name Generation called with", data);
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

  // Return mock data
  const exampleNames: GeneratedName[] = [
    { name: `${data.childLastName}지우`, hanja: "智祐", meaning: "Wise and blessed. A name suggesting intelligence and divine protection.", yinYangFiveElements: "Wood (목), Earth (토) - Balanced" },
    { name: `${data.childLastName}서준`, hanja: "瑞準", meaning: "Auspicious and standard. Implies a fortunate life adhering to good principles.", yinYangFiveElements: "Metal (금), Water (수) - Harmonious" },
    { name: `${data.childLastName}하은`, hanja: "廈恩", meaning: "Great grace. Signifies a person who receives and gives abundant blessings.", yinYangFiveElements: "Fire (화), Earth (토) - Nurturing" },
    { name: `${data.childLastName}유찬`, hanja: "裕贊", meaning: "Abundant praise. Suggests a life filled with prosperity and admiration.", yinYangFiveElements: "Earth (토), Metal (금) - Productive" },
    { name: `${data.childLastName}시_아`, hanja: "詩雅", meaning: "Poetic elegance. Implies a refined and artistic nature.", yinYangFiveElements: "Water (수), Wood (목) - Creative" },
  ];
  
  // Simple gender adaptation for example
  if (data.childGender === "female") {
    exampleNames[0].name = `${data.childLastName}지아`;
    exampleNames[1].name = `${data.childLastName}서윤`;
  }


  return {
    recommendedNames: exampleNames.slice(0, 5), // Ensure 5 names
  };
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
            <Baby className="text-primary h-6 w-6" /> Auspicious Name Generation
          </CardTitle>
          <CardDescription>
            Provide parental information to receive five beautifully crafted and meaningful names for your child.
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
                      <FormLabel>Father's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's full name" {...field} />
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
                      <FormLabel>Father's Saju (사주)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Year Pillar, Month Pillar..." {...field} />
                      </FormControl>
                      <FormDescription>Enter father's birth chart details.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's full name" {...field} />
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
                      <FormLabel>Mother's Saju (사주)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Year Pillar, Month Pillar..." {...field} />
                      </FormControl>
                      <FormDescription>Enter mother's birth chart details.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="childLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child's Last Name (Surname)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter child's surname" {...field} />
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
                      <FormLabel>Child's Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select child's gender" />
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
                {isLoading ? <LoadingSpinner size={20} /> : "Generate Auspicious Names"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner size={32} />
          <p className="ml-2 text-muted-foreground">Crafting perfect names...</p>
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
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> Recommended Names for Your Child
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.recommendedNames.map((name, index) => (
              <Card key={index} className="p-4 bg-secondary/30">
                <h3 className="text-xl font-semibold text-primary">{name.name} {name.hanja && `(${name.hanja})`}</h3>
                <p className="text-sm text-muted-foreground mt-1"><strong className="text-secondary-foreground">Meaning:</strong> {name.meaning}</p>
                <p className="text-sm text-muted-foreground"><strong className="text-secondary-foreground">Yin-Yang & Five Elements (음양오행):</strong> {name.yinYangFiveElements}</p>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
