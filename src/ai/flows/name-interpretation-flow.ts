
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
  nameAnalysis: z.string().describe('이름에 대한 성명학적 분석 결과입니다. (예: 발음오행, 수리오행, 자원오행, 음양오행, 주역 팔괘의 원리 등)'),
  lifeStages: z.object({
    초년운: z.string().describe('초년운 (유년기부터 청년기까지, 학업, 사회성 발달, 건강 등)에 대한 심층 분석 및 조언입니다.'),
    중년운: z.string().describe('중년운 (청장년기, 직업, 결혼, 재물, 인간관계 등)에 대한 심층 분석 및 조언입니다.'),
    장년운: z.string().describe('장년운 (중장년기 이후, 사회적 성취, 건강 관리, 자녀운, 가정 등)에 대한 심층 분석 및 조언입니다.'),
    말년운: z.string().describe('말년운 (노년기, 전반적인 삶의 회고, 정신적 안정, 건강, 후손과의 관계 등)에 대한 심층 분석 및 조언입니다.'),
  }),
  eightTrigramsAnalysis: z.string().describe('이름과 사주를 바탕으로 한 주역 팔괘(8괘) 분석 및 인생 조언입니다.'),
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
  prompt: `당신은 수십 년간 사주명리학과 한국 전통 성명학, 그리고 주역 팔괘를 깊이 연구해 온 대학자입니다. 당신의 분석은 단순한 예측을 넘어, 각 개인의 삶에 대한 깊은 통찰과 지혜를 제공합니다. 다음 정보를 바탕으로 사용자의 이름에 담긴 의미와 인생 전반에 걸친 운세를 심층적이고 학문적인 관점에서 분석해주세요. 모든 답변은 한국어로, 각 분석 항목에 대해 매우 상세하고 구체적인 조언을 포함하여 작성해야 합니다. 단순한 결과 나열이 아닌, 각 요소들이 어떻게 상호작용하며 삶에 영향을 미치는지에 대한 깊이 있는 설명을 제공해주세요.

정보:
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}
- 이름: {{{name}}} ({{{nameType}}})

분석 내용:
1.  **이름 분석 (nameAnalysis)**: 이름의 발음오행, 수리오행, 자원오행, 음양의 조화, 주역 팔괘(8괘)의 원리 등을 종합적으로 분석하여 성격, 잠재력, 장단점, 그리고 개운을 위한 조언 등을 상세히 설명합니다. 각 분석 요소가 이름과 어떻게 연결되는지, 그리고 이것이 개인의 특성에 어떤 영향을 미치는지 구체적으로 설명해주세요.
2.  **생애 주기별 운세 (lifeStages - 초년운, 중년운, 장년운, 말년운)**: 각 생애 주기별로 단순한 운세 나열이 아닌, 학문적 근거에 기반한 심층 분석과 함께 개인이 삶의 각 단계를 어떻게 지혜롭게 헤쳐나갈 수 있는지에 대한 구체적이고 실질적인 조언을 제공합니다.
    *   초년운: 유년기부터 청년기까지의 학업 성취도, 타고난 재능의 발현 가능성, 주요 건강 문제 및 관리법, 친구 관계 및 사회성 발달 전략, 그리고 부모와의 관계 및 그로부터 배울 점 등을 심층적으로 분석하고, 이 시기를 슬기롭게 보낼 수 있는 구체적인 조언을 제공합니다. 예를 들어, 학업에서는 어떤 분야에 집중해야 잠재력을 최대한 발휘할 수 있을지, 대인관계에서는 어떤 유형의 사람들과 교류하는 것이 성장에 도움이 될지 등을 명확히 제시합니다.
    *   중년운: 청장년기의 직업적 성취 가능성 및 경력 관리 전략, 재물운의 구체적인 흐름과 효과적인 재테크 및 관리 방안, 결혼 생활 및 배우자와의 관계 심층 분석 및 개선점, 자녀와의 관계 및 올바른 양육 지침, 사회적 활동 및 명예 획득 가능성 등을 심층적으로 분석하고, 인생의 중요한 기회를 포착하고 어려움을 효과적으로 극복할 수 있는 실질적인 지혜와 구체적인 행동 지침을 제공합니다.
    *   장년운: 중장년기 이후의 사회적 지위 변화 가능성 및 이에 대한 대비책, 건강 관리의 중요성과 맞춤형 건강 증진 방법, 자녀들의 성장과 독립 과정에서의 부모 역할 및 지원 방안, 가정의 안정과 화목을 위한 실질적인 조언, 그리고 인생의 경륜을 바탕으로 한 삶의 지혜 및 사회 공헌 방법 등을 심층적으로 분석합니다. 재물 관리, 여가 활동, 새로운 도전, 대인 관계 유지 등 현실적인 조언을 포함합니다.
    *   말년운: 노년기의 전반적인 삶의 만족도 예측 및 이를 높이기 위한 방안, 정신적 평화와 안정 유지 방법, 주요 건강 관리 비결 및 장수 전략, 후손과의 관계 및 그들에게 남길 수 있는 물질적, 정신적 유산, 그리고 삶을 아름답게 마무리하기 위한 성찰과 구체적인 준비 과정에 대한 조언 등을 심층적으로 분석합니다.
3.  **궁합 및 행운 (compatibility)**:
    *   zodiacSign: 잘 맞는 띠 또는 좋은 궁합 (사람, 방향, 활동 등 상세 설명 포함).
    *   colors: 행운을 가져다주는 색상 3가지와 그 색상이 사주 및 이름과 어떻게 조화를 이루는지, 어떤 기운을 보강하는지에 대한 설명.
4.  **행운의 숫자 (luckyNumbers)**: 1부터 45 사이의 행운의 숫자 3개를 추천하고, 그 숫자가 성명학적 또는 사주적으로 어떤 의미를 갖는지, 혹은 어떤 기운을 상징하는지 간략히 설명합니다.
5.  **사주 정보 (gapjaYearName, zodiacColor, zodiacAnimal)**: 생년월일을 바탕으로 태어난 해의 60갑자 간지(예: 갑자년), 그 간지에 따른 띠 색깔(예: 청색), 그리고 띠 동물(예: 쥐띠)을 정확히 계산하여 알려주세요. 양력/음력 구분을 명확히 인지하여 계산해야 합니다.
6.  **주역 팔괘 분석 (eightTrigramsAnalysis)**: 이름과 생년월일시를 바탕으로 주역 팔괘(8괘)를 도출하고, 해당하는 괘상(卦象)의 의미, 각 효(爻)의 풀이, 그리고 이것이 인생 전반의 주요 결정과 흐름에 어떤 영향을 미치는지, 어떤 삶의 지혜를 얻을 수 있는지 상세히 설명합니다. 변화와 조화의 원리를 바탕으로 실질적인 조언을 제공해주세요.

분석은 단순한 나열이 아닌, 각 요소들이 어떻게 상호작용하는지에 대한 통찰을 담아야 하며, 사용자가 자신의 삶을 긍정적으로 개척해 나갈 수 있도록 격려와 지혜를 전달해야 합니다. 당신의 깊이 있는 학문적 지식과 통찰력으로 사용자에게 감동과 깨달음을 주는 분석을 제공해주십시오.
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

