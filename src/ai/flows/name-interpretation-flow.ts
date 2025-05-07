'use server';
/**
 * @fileOverview 사용자의 이름과 생년월일시를 바탕으로 성명학적 분석과 인생 조언을 제공합니다.
 *
 * - interpretName - 이름 해석 과정을 처리하는 함수입니다.
 * - InterpretNameInput - interpretName 함수의 입력 타입입니다.
 * - InterpretNameOutput - interpretName 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretNameInputSchema = z.object({
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형입니다 (solar: 양력, lunar: 음력).'),
  birthTime: z.string().describe('태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  name: z.string().describe('해석할 이름입니다.'),
  nameType: z.enum(['korean', 'chinese', 'english']).describe('이름 유형입니다 (korean: 한글, chinese: 한자, english: 영문).'),
});
export type InterpretNameInput = z.infer<typeof InterpretNameInputSchema>;

const InterpretNameOutputSchema = z.object({
  nameAnalysis: z.string().describe('이름에 대한 성명학적 분석 결과입니다. (예: 발음오행, 수리오행, 자원오행 등)'),
  lifeStages: z.object({
    earlyYears: z.string().describe('초년운 (애정, 건강, 직업)에 대한 설명입니다.'),
    middleYears: z.string().describe('중년운 (애정, 건강, 직업)에 대한 설명입니다.'),
    laterYears: z.string().describe('말년운 (애정, 건강, 직업)에 대한 설명입니다.'),
    finalYears: z.string().describe('총운 또는 노년운 (애정, 건강, 직업)에 대한 설명입니다.'),
  }),
  compatibility: z.object({
    zodiacSign: z.string().describe('잘 맞는 띠 또는 좋은 궁합에 대한 설명입니다.'),
    colors: z.array(z.string()).length(3).describe('행운을 가져다주는 색상 3가지입니다.'),
  }),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('행운의 숫자 3개 (1-45 사이)입니다.'),
});
export type InterpretNameOutput = z.infer<typeof InterpretNameOutputSchema>;

export async function interpretName(input: InterpretNameInput): Promise<InterpretNameOutput> {
  return interpretNameFlow(input);
}

const nameInterpretationPrompt = ai.definePrompt({
  name: 'nameInterpretationPrompt',
  input: {schema: InterpretNameInputSchema},
  output: {schema: InterpretNameOutputSchema},
  prompt: `당신은 한국 전통 성명학 전문가입니다. 다음 정보를 바탕으로 사용자의 이름에 담긴 의미와 인생 전반에 걸친 운세를 분석해주세요. 모든 답변은 한국어로 해주세요.

정보:
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}
- 이름: {{{name}}} ({{{nameType}}})

분석 내용:
1.  **이름 분석**: 이름의 발음오행, 수리오행, 자원오행 등을 종합적으로 분석하여 성격, 잠재력, 장단점 등을 설명합니다.
2.  **생애 주기별 운세**:
    *   초년운: 애정, 건강, 학업/직업 초년.
    *   중년운: 애정, 건강, 직업/사업.
    *   말년운: 애정, 건강, 재물/자녀.
    *   총운/노년운: 인생 전반 또는 노년의 삶.
3.  **궁합 및 행운**:
    *   잘 맞는 띠 또는 좋은 궁합 (사람, 방향 등).
    *   행운을 가져다주는 색상 3가지.
4.  **행운의 숫자**: 1부터 45 사이의 행운의 숫자 3개를 추천합니다.

분석은 구체적이고 긍정적인 조언을 포함해야 합니다.
`,
});

const interpretNameFlow = ai.defineFlow(
  {
    name: 'interpretNameFlow',
    inputSchema: InterpretNameInputSchema,
    outputSchema: InterpretNameOutputSchema,
  },
  async input => {
    const {output} = await nameInterpretationPrompt(input);
    return output!;
  }
);
