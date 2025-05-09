
'use server';
/**
 * @fileOverview 사용자의 생년월일시와 이름을 바탕으로 올해의 운세를 제공합니다.
 *
 * - getYearlyFortune - 올해 운세 제공 과정을 처리하는 함수입니다.
 * - GetYearlyFortuneInput - getYearlyFortune 함수의 입력 타입입니다.
 * - GetYearlyFortuneOutput - getYearlyFortune 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetYearlyFortuneInputSchema = z.object({
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형입니다 (solar: 양력, lunar: 음력).'),
  birthTime: z.string().describe('태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  name: z.string().describe('운세를 볼 사람의 이름입니다.'),
});
export type GetYearlyFortuneInput = z.infer<typeof GetYearlyFortuneInputSchema>;

const GetYearlyFortuneOutputSchema = z.object({
  overallFortune: z.string().describe('올해의 전반적인 총운입니다.'),
  love: z.string().describe('올해의 애정운입니다.'),
  health: z.string().describe('올해의 건강운입니다.'),
  work: z.string().describe('올해의 직업운 또는 학업운입니다.'),
  relationships: z.string().describe('올해의 대인관계운입니다.'),
  financial: z.string().describe('올해의 재물운입니다.'),
  monthlyBreakdown: z.array(z.string()).length(12).describe('각 월별 간단한 운세입니다 (1월부터 12월 순서).'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('올해의 행운의 숫자 3개 (1-45 사이)입니다.'),
  gapjaYearName: z.string().describe('태어난 해의 60갑자 간지 이름입니다 (예: 갑자년).'),
  zodiacColor: z.string().describe('태어난 해의 띠 색깔입니다 (예: 청색).'),
  zodiacAnimal: z.string().describe('태어난 해의 띠 동물입니다 (예: 쥐띠).'),
});
export type GetYearlyFortuneOutput = z.infer<typeof GetYearlyFortuneOutputSchema>;

export async function getYearlyFortune(input: GetYearlyFortuneInput): Promise<GetYearlyFortuneOutput> {
  const currentYear = new Date().getFullYear();
  return getYearlyFortuneFlow({...input, currentYear});
}

const yearlyFortunePrompt = ai.definePrompt({
  name: 'yearlyFortunePrompt',
  input: {schema: GetYearlyFortuneInputSchema.extend({ currentYear: z.number() })},
  output: {schema: GetYearlyFortuneOutputSchema},
  prompt: `당신은 한국 전통 사주 및 운세 전문가입니다. 다음 정보를 바탕으로 {{{name}}}님의 {{{currentYear}}}년 전체 운세를 알려주세요. 모든 답변은 한국어로 상세하고 친절하게 설명해주세요. 각 월별 운세 (1월부터 12월까지)는 반드시 포함되어야 하며, 각 항목은 긍정적이고 희망찬 조언을 담아야 합니다.

사용자 정보:
- 이름: {{{name}}}
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}

{{{currentYear}}}년 운세 항목:
1.  **총운 (overallFortune)**: {{{currentYear}}}년 한 해 전반적인 흐름과 조심해야 할 점, 그리고 기회가 될 만한 부분을 설명해주세요.
2.  **애정운 (love)**: 연애 중이거나 기혼인 경우, 싱글인 경우 각각에 맞춰 조언해주세요.
3.  **건강운 (health)**: 특별히 신경 써야 할 부분이나 건강 증진을 위한 팁을 알려주세요.
4.  **직업운/학업운 (work)**: 업무나 학업에서 성과를 내기 위한 조언이나 주의할 점을 알려주세요.
5.  **대인관계운 (relationships)**: 가족, 친구, 동료와의 관계에서 도움이 될 만한 조언을 해주세요.
6.  **재물운 (financial)**: 재물 흐름과 투자, 절약 등 재정 관리에 대한 조언을 해주세요.
7.  **월별 운세 (monthlyBreakdown - 12개 항목)**: 1월부터 12월까지 각 달의 간단한 운세와 조언을 제공해주세요. (예: "1월: 새로운 시작에 좋은 달, 계획을 세우세요.", "2월: 예상치 못한 만남이 있을 수 있습니다." 등)
8.  **행운의 숫자 (luckyNumbers)**: 1부터 45 사이의 올해의 행운의 숫자 3개를 추천해주세요.
9.  **사주 정보 (gapjaYearName, zodiacColor, zodiacAnimal)**: 생년월일을 바탕으로 태어난 해의 60갑자 간지(예: 갑자년), 띠 색깔(예: 청색), 그리고 띠 동물(예: 쥐띠)을 정확히 계산하여 알려주세요. 양력/음력 구분을 명확히 인지하여 계산해야 합니다.

운세는 구체적이고 긍정적인 방향으로 조언하며, 사용자에게 희망을 줄 수 있도록 작성해주세요.
`,
});

const getYearlyFortuneFlow = ai.defineFlow(
  {
    name: 'getYearlyFortuneFlow',
    inputSchema: GetYearlyFortuneInputSchema.extend({ currentYear: z.number() }),
    outputSchema: GetYearlyFortuneOutputSchema,
  },
  async input => {
    const {output} = await yearlyFortunePrompt(input);
    return output!;
  }
);
