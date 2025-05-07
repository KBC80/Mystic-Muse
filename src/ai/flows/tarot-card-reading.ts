'use server';

/**
 * @fileOverview 타로 카드 리딩 AI 에이전트입니다.
 *
 * - tarotCardReading - 타로 카드 리딩 과정을 처리하는 함수입니다.
 * - TarotCardReadingInput - tarotCardReading 함수의 입력 타입입니다.
 * - TarotCardReadingOutput - tarotCardReading 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TarotCardReadingInputSchema = z.object({
  question: z.string().describe('사용자가 묻는 질문입니다.'),
  card1: z.string().describe('사용자가 선택한 첫 번째 타로 카드입니다.'),
  card2: z.string().describe('사용자가 선택한 두 번째 타로 카드입니다.'),
  card3: z.string().describe('사용자가 선택한 세 번째 타로 카드입니다.'),
});
export type TarotCardReadingInput = z.infer<typeof TarotCardReadingInputSchema>;

const TarotCardReadingOutputSchema = z.object({
  card1Interpretation: z
    .string()
    .describe('첫 번째 타로 카드에 대한 해석입니다.'),
  card2Interpretation: z
    .string()
    .describe('두 번째 타로 카드에 대한 해석입니다.'),
  card3Interpretation: z
    .string()
    .describe('세 번째 타로 카드에 대한 해석입니다.'),
  overallAdvice: z.string().describe('카드 리딩을 바탕으로 한 전반적인 조언입니다.'),
});
export type TarotCardReadingOutput = z.infer<typeof TarotCardReadingOutputSchema>;

export async function tarotCardReading(input: TarotCardReadingInput): Promise<TarotCardReadingOutput> {
  return tarotCardReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tarotCardReadingPrompt',
  input: {schema: TarotCardReadingInputSchema},
  output: {schema: TarotCardReadingOutputSchema},
  prompt: `당신은 전문 타로 카드 리더입니다. 사용자가 다음 질문을 했습니다: {{{question}}}. 사용자는 세 장의 카드 {{{card1}}}, {{{card2}}}, {{{card3}}}를 선택했습니다. 모든 답변은 한국어로 해주세요.

  사용자의 질문과 관련하여 각 카드를 해석해주세요.

  그런 다음, 카드 리딩을 바탕으로 전반적인 조언을 제공하고, 사용자의 현재 상황에 대한 구체적인 해석을 제시해주세요.
  타로 카드 리딩은 예술과 직관의 조화라는 것을 기억하세요. 카드의 지혜를 믿고 명확성과 통찰력으로 인도하도록 하세요.
  각 카드를 질문과 관련하여 해석해주세요: {{{question}}}.
  선택된 3장의 각 카드에 대한 해석을 반드시 추가해주세요.

  카드 1: {{{card1}}}
  카드 2: {{{card2}}}
  카드 3: {{{card3}}}
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

