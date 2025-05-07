// src/ai/flows/dream-interpretation.ts
'use server';

/**
 * @fileOverview Analyzes dream content to explain its meaning and provide guidance.
 *
 * - dreamInterpretation - A function that handles the dream interpretation process.
 * - DreamInterpretationInput - The input type for the dreamInterpretation function.
 * - DreamInterpretationOutput - The return type for the dreamInterpretation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DreamInterpretationInputSchema = z.object({
  dreamContent: z
    .string()
    .describe('The content of the dream that needs to be interpreted.'),
});
export type DreamInterpretationInput = z.infer<typeof DreamInterpretationInputSchema>;

const DreamInterpretationOutputSchema = z.object({
  summary: z.string().describe('A summary of the dream.'),
  symbolAnalysis: z
    .string()
    .describe('An analysis of the symbols present in the dream.'),
  omen: z.enum(['good', 'bad', 'neutral']).describe('Whether the dream is a good or bad omen.'),
  additionalCautions: z.string().describe('Any additional cautions based on the dream.'),
  goodFortune: z.string().describe('Any good fortune indicated by the dream.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('Three lucky numbers between 1 and 45.'),
});
export type DreamInterpretationOutput = z.infer<typeof DreamInterpretationOutputSchema>;

export async function dreamInterpretation(input: DreamInterpretationInput): Promise<DreamInterpretationOutput> {
  return dreamInterpretationFlow(input);
}

const dreamInterpretationPrompt = ai.definePrompt({
  name: 'dreamInterpretationPrompt',
  input: {schema: DreamInterpretationInputSchema},
  output: {schema: DreamInterpretationOutputSchema},
  prompt: `You are an expert dream interpreter. Analyze the dream and extract key symbols. Explain the meaning of the dream and indicate whether it is a good, bad, or neutral omen.

  Dream Content: {{{dreamContent}}}

  Provide additional cautions, potential good fortune, and three lucky numbers between 1 and 45 based on your interpretation.
  Omen must be one of "good", "bad", or "neutral".`,
});

const dreamInterpretationFlow = ai.defineFlow(
  {
    name: 'dreamInterpretationFlow',
    inputSchema: DreamInterpretationInputSchema,
    outputSchema: DreamInterpretationOutputSchema,
  },
  async input => {
    const {output} = await dreamInterpretationPrompt(input);
    return output!;
  }
);
