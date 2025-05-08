
'use server';
/**
 * @fileOverview 사용자의 생년월일시와 이름을 바탕으로 오늘의 운세를 제공합니다.
 *
 * - getDailyFortune - 오늘의 운세 제공 과정을 처리하는 함수입니다.
 * - GetDailyFortuneInput - getDailyFortune 함수의 입력 타입입니다.
 * - GetDailyFortuneOutput - getDailyFortune 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetDailyFortuneInputSchema = z.object({
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형입니다 (solar: 양력, lunar: 음력).'),
  birthTime: z.string().describe('태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  name: z.string().describe('운세를 볼 사람의 이름입니다.'),
});
export type GetDailyFortuneInput = z.infer<typeof GetDailyFortuneInputSchema>;

const GetDailyFortuneOutputSchema = z.object({
  overallFortune: z.string().describe('오늘의 전반적인 총운입니다.'),
  love: z.string().describe('오늘의 애정운입니다.'),
  health: z.string().describe('오늘의 건강운입니다.'),
  work: z.string().describe('오늘의 직업운 또는 학업운입니다.'),
  relationships: z.string().describe('오늘의 대인관계운입니다.'),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('오늘의 행운의 숫자 3개 (1-45 사이)입니다.'),
  gapjaYearName: z.string().describe('태어난 해의 60갑자 간지 이름입니다 (예: 갑자년).'),
  zodiacColor: z.string().describe('태어난 해의 띠 색깔입니다 (예: 청색).'),
  zodiacAnimal: z.string().describe('태어난 해의 띠 동물입니다 (예: 쥐띠).'),
});
export type GetDailyFortuneOutput = z.infer<typeof GetDailyFortuneOutputSchema>;

export async function getDailyFortune(input: GetDailyFortuneInput): Promise<GetDailyFortuneOutput> {
  return getDailyFortuneFlow(input);
}

const dailyFortunePrompt = ai.definePrompt({
  name: 'dailyFortunePrompt',
  input: {schema: GetDailyFortuneInputSchema},
  output: {schema: GetDailyFortuneOutputSchema},
  prompt: `당신은 한국 전통 사주 및 운세 전문가입니다. 다음 정보를 바탕으로 {{{name}}}님의 오늘의 운세를 알려주세요. 모든 답변은 한국어로 상세하고 친절하게 설명해주세요.

사용자 정보:
- 이름: {{{name}}}
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}

오늘의 운세 항목:
1.  **총운**: 오늘 하루 전반적인 흐름과 조심해야 할 점, 그리고 기회가 될 만한 부분을 설명해주세요.
2.  **애정운**: 연애 중이거나 기혼인 경우, 싱글인 경우 각각에 맞춰 조언해주세요.
3.  **건강운**: 특별히 신경 써야 할 부분이나 건강 증진을 위한 팁을 알려주세요.
4.  **직업운/학업운**: 업무나 학업에서 성과를 내기 위한 조언이나 주의할 점을 알려주세요.
5.  **대인관계운**: 가족, 친구, 동료와의 관계에서 도움이 될 만한 조언을 해주세요.
6.  **행운의 숫자**: 1부터 45 사이의 오늘의 행운의 숫자 3개를 추천해주세요.
7.  **사주 정보**: 생년월일을 바탕으로 태어난 해의 60갑자 간지(예: 갑자년), 띠 색깔(예: 청색), 그리고 띠 동물(예: 쥐띠)을 정확히 계산하여 알려주세요. 양력/음력 구분을 명확히 인지하여 계산해야 합니다.

운세는 구체적이고 긍정적인 방향으로 조언하며, 사용자에게 희망을 줄 수 있도록 작성해주세요.
`,
});

const getDailyFortuneFlow = ai.defineFlow(
  {
    name: 'getDailyFortuneFlow',
    inputSchema: GetDailyFortuneInputSchema,
    outputSchema: GetDailyFortuneOutputSchema,
  },
  async input => {
    const {output} = await dailyFortunePrompt(input);
    return output!;
  }
);

