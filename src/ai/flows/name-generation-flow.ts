'use server';
/**
 * @fileOverview 부모의 정보와 사주를 기반으로 아이에게 길운을 가져다 줄 이름을 생성합니다.
 *
 * - generateAuspiciousName - 길운 작명 과정을 처리하는 함수입니다.
 * - GenerateAuspiciousNameInput - generateAuspiciousName 함수의 입력 타입입니다.
 * - GenerateAuspiciousNameOutput - generateAuspiciousName 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAuspiciousNameInputSchema = z.object({
  fatherName: z.string().describe('아버지의 성함입니다.'),
  fatherSaju: z.string().describe('아버지의 사주 (예: 갑자년 을축월 병인일 정묘시).'),
  motherName: z.string().describe('어머니의 성함입니다.'),
  motherSaju: z.string().describe('어머니의 사주 (예: 갑자년 을축월 병인일 정묘시).'),
  childLastName: z.string().describe('자녀의 성입니다.'),
  childGender: z.enum(['male', 'female']).describe('자녀의 성별입니다 (male: 남자, female: 여자).'),
});
export type GenerateAuspiciousNameInput = z.infer<typeof GenerateAuspiciousNameInputSchema>;

const GeneratedNameSchema = z.object({
  name: z.string().describe('추천된 한글 이름입니다.'),
  hanja: z.string().optional().describe('추천된 이름의 한자 표기입니다 (선택 사항).'),
  meaning: z.string().describe('이름의 의미와 풀이입니다.'),
  yinYangFiveElements: z.string().describe('이름에 담긴 음양오행 분석 결과입니다.'),
});

const GenerateAuspiciousNameOutputSchema = z.object({
  recommendedNames: z.array(GeneratedNameSchema).length(5).describe('추천된 5개의 길운 이름 목록입니다.'),
});
export type GenerateAuspiciousNameOutput = z.infer<typeof GenerateAuspiciousNameOutputSchema>;

export async function generateAuspiciousName(input: GenerateAuspiciousNameInput): Promise<GenerateAuspiciousNameOutput> {
  return generateAuspiciousNameFlow(input);
}

const auspiciousNamePrompt = ai.definePrompt({
  name: 'auspiciousNamePrompt',
  input: {schema: GenerateAuspiciousNameInputSchema},
  output: {schema: GenerateAuspiciousNameOutputSchema},
  prompt: `당신은 한국 전통 성명학 전문가입니다. 다음 정보를 바탕으로 {{{childGender}}} 아이에게 길운을 가져다 줄 아름답고 의미 있는 한글 이름 5개를 추천해주세요. 각 이름에는 가능한 경우 한자 표기, 이름의 의미, 그리고 음양오행 분석을 포함해야 합니다. 모든 답변은 한국어로 해주세요.

부모 정보:
- 아버지 성함: {{{fatherName}}}
- 아버지 사주: {{{fatherSaju}}}
- 어머니 성함: {{{motherName}}}
- 어머니 사주: {{{motherSaju}}}

자녀 정보:
- 성: {{{childLastName}}}
- 성별: {{{childGender}}} (male: 남자, female: 여자)

각 추천 이름은 다음 형식을 따라야 합니다:
1.  **이름 (한글)**: 예) 지우
2.  **한자 (선택 사항)**: 예) 智祐
3.  **의미**: 이름의 뜻과 좋은 점을 상세히 설명합니다.
4.  **음양오행**: 이름이 사주와 어떻게 조화를 이루는지, 어떤 기운을 보강하는지 설명합니다.

5개의 독창적이고 현대적이면서도 전통적인 가치를 담은 이름을 제시해주세요.
`,
});

const generateAuspiciousNameFlow = ai.defineFlow(
  {
    name: 'generateAuspiciousNameFlow',
    inputSchema: GenerateAuspiciousNameInputSchema,
    outputSchema: GenerateAuspiciousNameOutputSchema,
  },
  async input => {
    const {output} = await auspiciousNamePrompt(input);
    return output!;
  }
);
