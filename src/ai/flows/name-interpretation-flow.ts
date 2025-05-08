
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
    초년운: z.string().describe('초년운 (유년기부터 청년기까지, 학업, 사회성 발달, 건강 등)에 대한 심층 분석 및 조언입니다.'),
    중년운: z.string().describe('중년운 (청장년기, 직업, 결혼, 재물, 인간관계 등)에 대한 심층 분석 및 조언입니다.'),
    장년운: z.string().describe('장년운 (중장년기 이후, 사회적 성취, 건강 관리, 자녀운, 가정 등)에 대한 심층 분석 및 조언입니다.'),
    말년운: z.string().describe('말년운 (노년기, 전반적인 삶의 회고, 정신적 안정, 건강, 후손과의 관계 등)에 대한 심층 분석 및 조언입니다.'),
  }),
  compatibility: z.object({
    zodiacSign: z.string().describe('잘 맞는 띠 또는 좋은 궁합에 대한 설명입니다.'),
    colors: z.array(z.string()).length(3).describe('행운을 가져다주는 색상 3가지입니다.'),
  }),
  luckyNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(3)
    .describe('행운의 숫자 3개 (1-45 사이)입니다.'),
  gapjaYearName: z.string().describe('태어난 해의 60갑자 간지 이름입니다 (예: 갑자년).'),
  zodiacColor: z.string().describe('태어난 해의 띠 색깔입니다 (예: 청색).'),
  zodiacAnimal: z.string().describe('태어난 해의 띠 동물입니다 (예: 쥐띠).'),
});
export type InterpretNameOutput = z.infer<typeof InterpretNameOutputSchema>;

export async function interpretName(input: InterpretNameInput): Promise<InterpretNameOutput> {
  return interpretNameFlow(input);
}

const nameInterpretationPrompt = ai.definePrompt({
  name: 'nameInterpretationPrompt',
  input: {schema: InterpretNameInputSchema},
  output: {schema: InterpretNameOutputSchema},
  prompt: `당신은 수십 년간 사주명리학과 한국 전통 성명학을 깊이 연구해 온 학자입니다. 다음 정보를 바탕으로 사용자의 이름에 담긴 의미와 인생 전반에 걸친 운세를 심층적이고 학문적인 관점에서 분석해주세요. 모든 답변은 한국어로 상세하고 구체적인 조언을 포함하여 작성해야 합니다.

정보:
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}
- 이름: {{{name}}} ({{{nameType}}})

분석 내용:
1.  **이름 분석**: 이름의 발음오행, 수리오행, 자원오행 등을 종합적으로 분석하여 성격, 잠재력, 장단점, 그리고 개운을 위한 조언 등을 상세히 설명합니다.
2.  **생애 주기별 운세 (구체적이고 심도 있는 분석 필요)**:
    *   초년운: 유년기부터 청년기까지의 학업 성취도, 재능 발현 가능성, 건강 상태, 친구 관계 및 사회성 발달, 그리고 부모와의 관계 등을 심층적으로 분석하고, 이 시기를 슬기롭게 보낼 수 있는 구체적인 조언을 제공합니다. 예를 들어, 학업에서는 어떤 분야에 집중해야 할지, 대인관계에서는 어떤 점을 유의해야 할지 등을 명확히 제시합니다.
    *   중년운: 청장년기의 직업적 성취 가능성, 재물운의 구체적인 흐름과 관리 방안, 결혼 생활 및 배우자와의 관계, 자녀와의 관계 및 양육 지침, 사회적 활동 및 명예 등을 심층적으로 분석하고, 인생의 중요한 기회를 포착하고 어려움을 효과적으로 극복할 수 있는 실질적인 지혜를 제공합니다.
    *   장년운: 중장년기 이후의 사회적 지위 변화, 건강 관리의 중요성과 구체적인 방법, 자녀들의 성장과 독립 과정에서의 역할, 가정의 안정과 화목을 위한 조언, 그리고 인생의 경륜을 바탕으로 한 삶의 지혜 등을 심층적으로 분석합니다. 재물 관리, 여가 활동, 대인 관계 유지 등 현실적인 조언을 포함합니다.
    *   말년운: 노년기의 전반적인 삶의 만족도, 정신적 평화와 안정 유지 방법, 주요 건강 관리 비결, 후손과의 관계 및 그들에게 남길 유산(물질적, 정신적), 그리고 삶을 아름답게 마무리하기 위한 성찰과 조언 등을 심층적으로 분석합니다.
3.  **궁합 및 행운**:
    *   잘 맞는 띠 또는 좋은 궁합 (사람, 방향 등 상세 설명 포함).
    *   행운을 가져다주는 색상 3가지와 그 이유.
4.  **행운의 숫자**: 1부터 45 사이의 행운의 숫자 3개를 추천하고, 그 숫자가 어떤 의미를 갖는지 간략히 설명합니다.
5.  **사주 정보**: 생년월일을 바탕으로 태어난 해의 60갑자 간지(예: 갑자년), 띠 색깔(예: 청색), 그리고 띠 동물(예: 쥐띠)을 정확히 계산하여 알려주세요. 양력/음력 구분을 명확히 인지하여 계산해야 합니다.

분석은 단순한 나열이 아닌, 각 요소들이 어떻게 상호작용하는지에 대한 통찰을 담아야 하며, 사용자가 자신의 삶을 긍정적으로 개척해 나갈 수 있도록 격려와 지혜를 전달해야 합니다.
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

