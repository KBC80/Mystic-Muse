'use server';

/**
 * @fileOverview A tarot card reading AI agent.
 *
 * - tarotCardReading - A function that handles the tarot card reading process.
 * - TarotCardReadingInput - The input type for the tarotCardReading function.
 * - TarotCardReadingOutput - The return type for the tarotCardReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TarotCardReadingInputSchema = z.object({
  question: z.string().describe('The question the user is asking.'),
  card1: z.string().describe('The first tarot card selected by the user.'),
  card2: z.string().describe('The second tarot card selected by the user.'),
  card3: z.string().describe('The third tarot card selected by the user.'),
});
export type TarotCardReadingInput = z.infer<typeof TarotCardReadingInputSchema>;

const TarotCardReadingOutputSchema = z.object({
  card1Interpretation: z
    .string()
    .describe('The interpretation of the first tarot card.'),
  card2Interpretation: z
    .string()
    .describe('The interpretation of the second tarot card.'),
  card3Interpretation: z
    .string()
    .describe('The interpretation of the third tarot card.'),
  overallAdvice: z.string().describe('Overall advice based on the card readings.'),
});
export type TarotCardReadingOutput = z.infer<typeof TarotCardReadingOutputSchema>;

export async function tarotCardReading(input: TarotCardReadingInput): Promise<TarotCardReadingOutput> {
  return tarotCardReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tarotCardReadingPrompt',
  input: {schema: TarotCardReadingInputSchema},
  output: {schema: TarotCardReadingOutputSchema},
  prompt: `You are an expert tarot card reader. A user has asked the following question: {{{question}}}. They have selected three cards: {{{card1}}}, {{{card2}}}, and {{{card3}}}.

  Provide an interpretation of each card in relation to the user's question.

  Then, provide overall advice based on the card readings, and offer specific interpretations for the user's current situation.
  Remember that tarot card reading is a blend of art and intuition. Trust the wisdom of the cards and let them guide you toward clarity and insight.
  Interpret each card in relation to the question: {{{question}}}.
  Make sure to add a card interpretation for each of the 3 cards chosen. 

  Card 1: {{{card1}}}
  Card 2: {{{card2}}}
  Card 3: {{{card3}}}
`,
});

const tarotCardReadingFlow = ai.defineFlow(
  {
    name: 'tarotCardReadingFlow',
    inputSchema: TarotCardReadingInputSchema,
    outputSchema: TarotCardReadingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
