
'use server';
/**
 * @fileOverview 과학적 분석을 바탕으로 로또 번호를 추천합니다.
 *
 * - recommendScientificLottoNumbers - 과학적 로또 번호 추천 과정을 처리하는 함수입니다.
 * - ScientificLottoRecommendationInput - recommendScientificLottoNumbers 함수의 입력 타입입니다.
 * - ScientificLottoRecommendationOutput - recommendScientificLottoNumbers 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScientificLottoRecommendationInputSchema = z.object({
  historicalDataSummary: z.string().describe('과거 로또 당첨 번호 데이터의 요약입니다. 예: "최근 24회차 평균 합계는 130-150 사이이며, 짝수와 홀수 비율은 3:3 또는 2:4가 자주 등장합니다. 특정 숫자(예: 7, 14)가 최근 자주 출현했습니다."'),
  includeNumbers: z.array(z.number().int().min(1).max(45)).optional().describe('반드시 포함할 숫자들의 목록입니다.'),
  excludeNumbers: z.array(z.number().int().min(1).max(45)).optional().describe('반드시 제외할 숫자들의 목록입니다.'),
});
export type ScientificLottoRecommendationInput = z.infer<typeof ScientificLottoRecommendationInputSchema>;

const LottoSetSchema = z.object({
  numbers: z
    .array(z.number().int().min(1).max(45))
    .length(6)
    .describe('추천된 로또 번호 6개입니다 (1-45 사이).'),
  reasoning: z.string().describe('이 번호 조합을 추천하는 통계적 근거나 논리입니다.'),
});

const ScientificLottoRecommendationOutputSchema = z.object({
  recommendedSets: z.array(LottoSetSchema).length(5).describe('추천된 로또 번호 조합 5세트입니다.'),
  predictedSumRange: z.string().describe('다음 회차 예상 당첨 번호 합계 범위입니다. 예: "135-145"'),
  predictedEvenOddRatio: z.string().describe('다음 회차 예상 짝수:홀수 비율입니다. 예: "3:3 또는 4:2"'),
});
export type ScientificLottoRecommendationOutput = z.infer<typeof ScientificLottoRecommendationOutputSchema>;

export async function recommendScientificLottoNumbers(input: ScientificLottoRecommendationInput): Promise<ScientificLottoRecommendationOutput> {
  return scientificLottoRecommendationFlow(input);
}

const scientificLottoNumberRecommendationPrompt = ai.definePrompt({
  name: 'scientificLottoNumberRecommendationPrompt',
  input: {schema: ScientificLottoRecommendationInputSchema},
  output: {schema: ScientificLottoRecommendationOutputSchema},
  prompt: `당신은 데이터 분석가이자 통계 전문가입니다. 제공된 과거 로또 당첨 번호 데이터의 요약과 사용자가 지정한 포함/제외 숫자를 고려하여, 통계적 가능성을 높일 수 있는 로또 번호 조합 5세트를 추천해주세요. 또한, 과거 데이터 요약을 바탕으로 다음 회차의 예상 당첨 번호 합계 범위와 예상되는 짝수:홀수 비율을 예측해주세요.

과거 데이터 요약:
{{{historicalDataSummary}}}

사용자 지정:
- 포함할 숫자: {{#if includeNumbers}} {{#each includeNumbers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}} 없음 {{/if}}
- 제외할 숫자: {{#if excludeNumbers}} {{#each excludeNumbers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}} {{else}} 없음 {{/if}}

각 번호 조합은 1부터 45 사이의 중복되지 않는 숫자 6개로 구성되어야 합니다. 각 조합에 대한 간략한 통계적 근거나 추천 논리를 설명해주세요.
모든 답변은 한국어로, 명확하고 분석적인 어조로 작성해주세요.
예상 합계 범위와 짝홀 비율 예측도 반드시 포함해주세요.
`,
});

const scientificLottoRecommendationFlow = ai.defineFlow(
  {
    name: 'scientificLottoRecommendationFlow',
    inputSchema: ScientificLottoRecommendationInputSchema,
    outputSchema: ScientificLottoRecommendationOutputSchema,
  },
  async input => {
    const {output} = await scientificLottoNumberRecommendationPrompt(input);
    return output!;
  }
);

