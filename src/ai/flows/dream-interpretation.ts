// src/ai/flows/dream-interpretation.ts
'use server';

/**
 * @fileOverview 꿈 내용을 분석하여 그 의미를 설명하고 조언을 제공합니다.
 *
 * - dreamInterpretation - 꿈 해석 과정을 처리하는 함수입니다.
 * - DreamInterpretationInput - dreamInterpretation 함수의 입력 타입입니다.
 * - DreamInterpretationOutput - dreamInterpretation 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DreamInterpretationInputSchema = z.object({
  dreamContent: z
    .string()
    .describe('해석이 필요한 꿈의 내용입니다.'),
});
export type DreamInterpretationInput = z.infer<typeof DreamInterpretationInputSchema>;

const DreamInterpretationOutputSchema = z.object({
  summary: z.string().describe('꿈에 대한 요약입니다.'),
  symbolAnalysis: z
    .string()
    .describe('꿈에 나타난 상징들에 대한 분석입니다.'),
  omen: z.enum(['good', 'bad', 'neutral']).describe('꿈이 좋은 징조인지 나쁜 징조인지, 혹은 중립적인지를 나타냅니다.'),
  additionalCautions: z.string().describe('꿈을 바탕으로 한 추가적인 주의사항입니다.'),
  goodFortune: z.string().describe('꿈이 나타내는 좋은 운세입니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('1에서 45 사이의 행운의 숫자 세 개입니다.'),
});
export type DreamInterpretationOutput = z.infer<typeof DreamInterpretationOutputSchema>;

export async function dreamInterpretation(input: DreamInterpretationInput): Promise<DreamInterpretationOutput> {
  return dreamInterpretationFlow(input);
}

const dreamInterpretationPrompt = ai.definePrompt({
  name: 'dreamInterpretationPrompt',
  input: {schema: DreamInterpretationInputSchema},
  output: {schema: DreamInterpretationOutputSchema},
  prompt: `당신은 전문 꿈 해석가입니다. 꿈을 분석하고 주요 상징을 추출해주세요. 꿈의 의미를 설명하고 좋은 징조, 나쁜 징조, 또는 중립적인 징조인지 알려주세요. 모든 답변은 한국어로 해주세요.

  꿈 내용: {{{dreamContent}}}

  해석을 바탕으로 추가적인 주의사항, 잠재적인 행운, 그리고 1에서 45 사이의 행운의 숫자 세 개를 제공해주세요.
  징조는 "good", "bad", "neutral" 중 하나여야 합니다.`,
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

