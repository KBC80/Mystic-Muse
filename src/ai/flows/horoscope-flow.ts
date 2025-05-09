
'use server';
/**
 * @fileOverview 사용자의 생년월일을 바탕으로 별자리를 판단하고 주간 운세를 제공합니다.
 *
 * - getWeeklyHoroscope - 주간 별자리 운세 제공 과정을 처리하는 함수입니다.
 * - GetWeeklyHoroscopeInput - getWeeklyHoroscope 함수의 입력 타입입니다.
 * - GetWeeklyHoroscopeOutput - getWeeklyHoroscope 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWeeklyHoroscopeInputSchema = z.object({
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식). 이 정보를 바탕으로 별자리를 판단합니다.'),
  name: z.string().describe('운세를 볼 사람의 이름입니다.'),
});
export type GetWeeklyHoroscopeInput = z.infer<typeof GetWeeklyHoroscopeInputSchema>;

const GetWeeklyHoroscopeOutputSchema = z.object({
  zodiacSign: z.string().describe('판단된 사용자의 별자리입니다 (예: 양자리, 황소자리 등).'),
  weeklyOverall: z.string().describe('이번 주 해당 별자리의 종합적인 운세입니다.'),
  weeklyLove: z.string().describe('이번 주 애정운입니다.'),
  weeklyCareer: z.string().describe('이번 주 직업운 또는 학업운입니다.'),
  weeklyHealth: z.string().describe('이번 주 건강운입니다.'),
  luckyItem: z.string().describe('이번 주 행운을 가져다 줄 아이템입니다.'),
  luckyDayOfWeek: z.string().describe('이번 주 행운의 요일입니다 (예: 월요일, 화요일 등).'),
});
export type GetWeeklyHoroscopeOutput = z.infer<typeof GetWeeklyHoroscopeOutputSchema>;

export async function getWeeklyHoroscope(input: GetWeeklyHoroscopeInput): Promise<GetWeeklyHoroscopeOutput> {
  return getWeeklyHoroscopeFlow(input);
}

const weeklyHoroscopePrompt = ai.definePrompt({
  name: 'weeklyHoroscopePrompt',
  input: {schema: GetWeeklyHoroscopeInputSchema},
  output: {schema: GetWeeklyHoroscopeOutputSchema},
  prompt: `당신은 수십 년 경력의 저명한 서양 점성술사입니다. 사용자의 생년월일 정보를 바탕으로 해당 사용자의 정확한 별자리를 판단해주세요. 그 후, {{{name}}}님의 이번 주 (오늘부터 7일간) 별자리 운세를 상세하고 희망찬 어조로 제공해주세요. 모든 답변은 한국어로 작성합니다.

사용자 정보:
- 이름: {{{name}}}
- 생년월일: {{{birthDate}}}

별자리 운세 항목:
1.  **별자리 (zodiacSign)**: 사용자의 생년월일을 바탕으로 정확한 한국어 별자리 이름을 판단하여 명시해주세요. (예: 양자리, 황소자리, 쌍둥이자리, 게자리, 사자자리, 처녀자리, 천칭자리, 전갈자리, 사수자리, 염소자리, 물병자리, 물고기자리)
2.  **주간 종합운 (weeklyOverall)**: 이번 주 전반적인 흐름, 주요 기회, 그리고 주의해야 할 점을 포함하여 설명해주세요.
3.  **주간 애정운 (weeklyLove)**: 연애 중인 사람과 싱글인 사람 모두에게 도움이 될 수 있는 조언을 포함해주세요.
4.  **주간 직업운/학업운 (weeklyCareer)**: 업무나 학업 성취를 위한 팁이나 긍정적인 전망을 알려주세요.
5.  **주간 건강운 (weeklyHealth)**: 이번 주 건강 관리에 도움이 될 만한 조언을 제공해주세요.
6.  **행운 아이템 (luckyItem)**: 이번 주 행운을 가져다 줄 수 있는 특정 아이템을 추천해주세요.
7.  **행운의 요일 (luckyDayOfWeek)**: 이번 주 특별히 운이 좋은 요일을 알려주세요.

각 항목에 대해 구체적이고 긍정적인 메시지를 전달하여 사용자에게 영감을 주세요.
`,
});

const getWeeklyHoroscopeFlow = ai.defineFlow(
  {
    name: 'getWeeklyHoroscopeFlow',
    inputSchema: GetWeeklyHoroscopeInputSchema,
    outputSchema: GetWeeklyHoroscopeOutputSchema,
  },
  async input => {
    const {output} = await weeklyHoroscopePrompt(input);
    return output!;
  }
);
