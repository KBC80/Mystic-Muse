
'use server';
/**
 * @fileOverview 사용자의 이름, 생년월일시, 성별을 바탕으로 동서양 철학 및 성명학적 분석과 인생 조언을 제공합니다.
 *
 * - interpretName - 이름 해석 과정을 처리하는 함수입니다.
 * - InterpretNameInput - interpretName 함수의 입력 타입입니다.
 * - InterpretNameOutput - interpretName 함수의 반환 타입입니다.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretNameInputSchema = z.object({
  name: z.string().describe('해석할 이름입니다. AI가 한글, 한자(제공된 경우)를 판단하여 분석합니다. 예: 홍길동 또는 홍길동(洪吉童)'),
  birthDate: z.string().describe('생년월일입니다 (YYYY-MM-DD 형식).'),
  calendarType: z.enum(['solar', 'lunar']).describe('달력 유형입니다 (solar: 양력, lunar: 음력).'),
  birthTime: z.string().describe('태어난 시간입니다 (예: 자시, 축시 등 12지신 시간 또는 "모름").'),
  gender: z.enum(['male', 'female']).describe('성별입니다 (male: 남자, female: 여자).'),
});
export type InterpretNameInput = z.infer<typeof InterpretNameInputSchema>;

const SajuCompositionSchema = z.object({
  yearColumn: z.object({ cheonGan: z.string(), jiJi: z.string(), eumYang: z.string(), ohaeng: z.string() }).describe('년주 (천간, 지지, 음양, 오행)'),
  monthColumn: z.object({ cheonGan: z.string(), jiJi: z.string(), eumYang: z.string(), ohaeng: z.string() }).describe('월주 (천간, 지지, 음양, 오행)'),
  dayColumn: z.object({ cheonGan: z.string(), jiJi: z.string(), eumYang: z.string(), ohaeng: z.string() }).describe('일주 (천간, 지지, 음양, 오행)'),
  timeColumn: z.object({ cheonGan: z.string(), jiJi: z.string(), eumYang: z.string(), ohaeng: z.string() }).describe('시주 (천간, 지지, 음양, 오행)'),
  gapjaYearName: z.string().describe('음력 생년을 기준으로 계산된 60갑자 간지 이름입니다 (예: 경신년(庚申年)).'),
  zodiacColor: z.string().describe('음력 생년을 기준으로 계산된 띠의 색깔입니다 (예: 흰색).'),
  zodiacAnimal: z.string().describe('음력 생년을 기준으로 계산된 띠 동물입니다 (예: 원숭이띠).'),
});

const DetailedScoresSchema = z.object({
  eumYangOhaengScore: z.number().min(0).max(5).describe('음양오행 점수 (5점 만점)'),
  suriGilhyungScore: z.number().min(0).max(35).describe('수리길흉 점수 (35점 만점)'),
  pronunciationOhaengScore: z.number().min(0).max(25).describe('발음오행 점수 (25점 만점)'),
  suriOhaengScore: z.number().min(0).max(5).describe('수리오행 점수 (5점 만점)'),
  resourceOhaengScore: z.number().min(0).max(30).describe('자원오행 점수 (30점 만점)'),
});

const OhaengRatioSchema = z.object({
  wood: z.number().describe('목(木) 비율 (%)'),
  fire: z.number().describe('화(火) 비율 (%)'),
  earth: z.number().describe('토(土) 비율 (%)'),
  metal: z.number().describe('금(金) 비율 (%)'),
  water: z.number().describe('수(水) 비율 (%)'),
  neededOhaeng: z.string().describe('보충이 필요한 오행'),
});

const HanjaStrokeEumyangSchema = z.object({
  character: z.string().describe('한자 또는 한글자'),
  strokes: z.number().optional().describe('획수 (한자인 경우)'),
  eumYang: z.string().describe('음(陰) 또는 양(陽)'),
});

const SuriLuckSchema = z.object({
  description: z.string().describe('해당 격(운)에 대한 상세한 설명 (성격, 대인관계, 건강, 학업/직업운, 삶의 경로에 미치는 영향, 강점, 약점, 기회, 도전, 조언 포함)'),
  rating: z.enum(['매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨']).describe('길흉 등급'),
  ohaeng: z.string().describe('해당 격의 오행'),
});

const InitialConsonantSchema = z.object({
  character: z.string().describe('이름의 한글자'),
  consonant: z.string().describe('초성'),
  ohaeng: z.string().describe('초성의 오행'),
});

const InterpretNameOutputSchema = z.object({
  basicInfoSummary: z.object({
    koreanName: z.string().describe('이름 (한글)'),
    hanjaName: z.string().optional().describe('이름 (한자, 해당되는 경우)'),
    gender: z.string().describe('성별 (입력된 성별과 동일해야 함: 남자/여자)'),
    solarBirthDate: z.string().describe('양력 생년월일시'),
    lunarBirthDate: z.string().describe('음력 생년월일시 (양력이면 변환된 음력, 음력이면 입력된 음력). 사주 정보는 이 음력 생일을 기준으로 계산되어야 합니다.'),
    birthTime: z.string().describe('출생 시간 (예: 자시)'),
    sajuComposition: SajuCompositionSchema.describe('사주 구성 정보. gapjaYearName, zodiacColor, zodiacAnimal은 음력 생년월일을 기준으로 계산되어야 합니다.'),
  }).describe('1. 기본 정보 요약'),

  overallScoreAndEvaluation: z.object({
    totalScore: z.number().min(0).max(100).describe('종합 점수 (100점 만점)'),
    grade: z.enum(['매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨']).describe('종합 등급'),
    detailedScores: DetailedScoresSchema.describe('세부 항목별 점수'),
  }).describe('2. 종합 점수 및 평가'),

  eumYangOhaengAnalysis: z.object({
    sajuAnalysis: SajuCompositionSchema.omit({ gapjaYearName: true, zodiacColor: true, zodiacAnimal: true }).describe('사주 분석 (년월일시주)'),
    eumYangRatio: z.object({ eumPercent: z.number(), yangPercent: z.number() }).describe('음양 비율'),
    ohaengRatio: OhaengRatioSchema.describe('오행 비율 및 보충 필요 오행'),
  }).describe('3. 음양오행 분석 (사주 기반)'),

  eumYangHarmonyAnalysis: z.object({
    hanjaStrokesAndEumyang: z.array(HanjaStrokeEumyangSchema).describe('이름 각 글자의 한자 획수 및 음양 정보 (한글 이름인 경우 한글 음절 기반 음양)'),
    ohaengHarmony: z.string().describe('이름 글자 간 오행의 상생 또는 상극 관계 설명'),
    evaluation: z.string().describe('음양 조화에 대한 평가 (예: 음양이 조화로운 좋은 이름입니다.)'),
  }).describe('4. 음양 조화 분석 (이름 자체)'),

  suriGilhyungAnalysis: z.object({
    cheonGyeok: SuriLuckSchema.describe('천격 (초년운, 1-20세)'), // 이전 "선조운, 기초운" 에서 "초년운"으로 변경
    inGyeok: SuriLuckSchema.describe('인격 (중년운, 20-40세, 성격, 대인관계)'), // 이전 "주격, 초년운" 에서 "중년운"으로 변경
    jiGyeok: SuriLuckSchema.describe('지격 (장년운, 30-50세, 가정, 배우자, 건강)'), // 이전 "중년운" 에서 "장년운"으로 변경
    oeGyeok: SuriLuckSchema.describe('외격 (말년운, 40세 이후 사회활동, 환경적응)'), // 이전 "장년운" 에서 "말년운"으로 변경
    jongGyeok: SuriLuckSchema.describe('종격 (총격, 전체 인생 총운)'), // "말년운"에서 "전체 인생 총운"으로 강조
  }).describe('5. 수리길흉 분석 (5격 중심)'),

  pronunciationOhaengAnalysis: z.object({
    initialConsonants: z.array(InitialConsonantSchema).describe('이름 각 글자의 초성 및 해당 오행'),
    harmonyRelationship: z.string().describe('초성 오행 간의 상생 또는 상극 관계 설명'),
    evaluation: z.string().describe('발음오행에 대한 평가'),
  }).describe('6. 발음오행 분석'),

  resourceOhaengAnalysis: z.object({
    sajuStrengthAnalysis: z.string().describe('사주 강약 분석 (부족한 기운과 넘치는 기운의 오행)'),
    yongsin: z.string().describe('사주를 보완하기 위한 핵심 오행 (용신)'),
    nameResourceOhaengMatch: z.string().describe('이름의 자원오행(한자 뜻 오행)이 용신을 보완하는지 여부 설명'),
  }).describe('7. 자원오행 분석'),

  hanjaFilteringAnalysis: z.object({
    inappropriateHanja: z.string().describe('이름에 사용된 한자가 불용한자인지 여부 및 설명 (한자 이름인 경우)'),
    firstChildOnlyHanja: z.string().describe('장자녀 전용 한자의 사용 여부 및 설명 (한자 이름인 경우, 자녀 순위 정보가 없을 경우 일반적인 경우를 기준으로 판단하거나 분석 제한 명시)'),
  }).describe('8. 한자 필터링 분석'),

  finalOverallEvaluation: z.object({
    summary: z.string().describe('각 항목의 평가를 종합하여 제공하는 최종 평가'),
    cautions: z.string().optional().describe('특정 항목에서 주의가 필요한 경우 강조하는 내용'),
  }).describe('9. 전체 평가 요약'),
});

export type InterpretNameOutput = z.infer<typeof InterpretNameOutputSchema>;

export async function interpretName(input: InterpretNameInput): Promise<InterpretNameOutput> {
  return interpretNameFlow(input);
}

const nameInterpretationPrompt = ai.definePrompt({
  name: 'nameInterpretationPrompt',
  input: {schema: InterpretNameInputSchema},
  output: {schema: InterpretNameOutputSchema},
  prompt: `당신은 수십 년간 동서양 철학, 사주명리학, 성명학(한자 수리획수법, 음양오행, 발음오행, 자원오행), 주역 등을 깊이 연구하고 통달한 최고의 학자입니다. 당신의 이름풀이는 단순한 예측을 넘어, 개인의 삶에 대한 깊은 통찰과 지혜를 제공하며, 매우 정확하고 상세합니다.

다음 사용자 정보를 바탕으로, 제시된 "이름풀이 결과 페이지 구성안"의 모든 항목을 빠짐없이 채워주십시오. 각 항목에 대한 분석은 반드시 "해석 관련 규칙"을 엄격히 준수하여 이루어져야 합니다. 모든 답변은 한국어로, 전문가적이고 학문적인 어조로 작성하되, 사용자가 쉽게 이해할 수 있도록 명확하게 설명해주십시오. 특히, 긍정적인 측면과 함께 주의하거나 개선해야 할 점도 균형 있게 제시하여 사용자가 자신의 삶을 더 잘 개척해나갈 수 있도록 실질적인 조언을 제공해야 합니다.

**사용자 정보:**
- 이름: {{{name}}} (AI는 제공된 이름이 한글인지, 한글과 한자가 혼용되었는지, 또는 주로 한자인지를 스스로 판단하여 분석합니다. 한자 이름 풀이 시에는 한자의 의미와 획수를 정확히 고려해야 합니다.)
- 생년월일: {{{birthDate}}} ({{{calendarType}}})
- 태어난 시간: {{{birthTime}}}
- 성별: {{{gender}}} (제공된 성별을 정확히 반영하여 결과에 '남자' 또는 '여자'로 표시해야 합니다.)

**해석 관련 규칙:**
1.  **한자 획수 수리법**: 이름의 총획수(한자 이름의 경우) 또는 한글 음절 구조를 기반으로 천격(초년운), 인격(중년운), 지격(장년운), 외격(말년운), 종격(총격) 등 5가지 격을 계산하고 각 격의 길흉을 판단합니다. 각 격은 성격, 대인관계, 인생 전반의 흐름을 나타냅니다.
2.  **음양의 조화**: 이름 각 글자(한자 또는 한글 음절)의 음(陰)과 양(陽)을 구분하여 이름 전체의 음양 균형을 분석합니다. 음양음 또는 양음양 배열을 이상적으로 보며, 한쪽으로 치우친 배열은 피해야 할 것으로 간주합니다.
3.  **오행 상생 상극 분석**:
    *   **사주 오행**: 사용자의 사주팔자를 분석하여 각 주(년주, 월주, 일주, 시주)의 천간, 지지, 음양, 오행을 파악하고, 전체적인 오행 분포와 부족하거나 과다한 오행을 분석합니다.
    *   **이름 오행**: 이름 각 글자(한자의 경우 부수나 의미 기반, 한글의 경우 발음 기반)에 해당하는 오행을 분석하여 이름 내 오행의 흐름(상생, 상극)을 판단합니다.
    *   **사주 보완**: 이름의 오행 구성이 사용자의 사주에서 부족한 오행을 보완하는지, 또는 과다한 오행을 더욱 강화시키는지 분석합니다. (자원오행 분석과 연결)
4.  **발음과 운율 (발음오행)**: 이름의 발음(초성, 중성, 종성)이 부르기 쉽고, 부정적인 연상(흉음)이 없는지 확인합니다. 각 음절 초성의 오행을 분석하여 오행 간 상생상극 관계를 평가합니다.
5.  **사주 보완 여부 (자원오행)**: 이름풀이에서 가장 중요한 요소 중 하나입니다. 사주팔자의 강약과 오행 흐름을 분석하여 용신(사주에 가장 필요한 오행)을 판단하고, 이름 한자(한자 이름의 경우)의 본래 뜻(자원오행)이 이 용신을 적절히 보완하는지 심층 분석합니다.
6.  **한자의 의미 (한자 이름의 경우)**: 이름에 사용된 한자 자체의 뜻이 긍정적이고 좋은 메시지를 담고 있는지, 또는 부정적이거나 너무 무겁지 않은지 검토합니다. 불용한자나 특정 성별에만 적합한 한자 사용 여부도 확인합니다.

**이름풀이 결과 페이지 구성안 (아래 모든 항목을 반드시 채워주세요):**

**1. 기본 정보 요약:**
    *   koreanName: 이름 (한글) - AI가 {{{name}}} 입력값에서 한글 부분 추출
    *   hanjaName: 이름 (한자) - AI가 {{{name}}} 입력값에서 한자 부분 추출 (없으면 생략)
    *   gender: 성별 (입력된 {{{gender}}} 값을 바탕으로 '남자' 또는 '여자'로 정확히 표시)
    *   solarBirthDate: 양력 생년월일시 - 입력값 또는 변환값
    *   lunarBirthDate: 음력 생년월일시 - 입력값 또는 변환값. 사주 정보는 이 음력 생일을 기준으로 계산됩니다.
    *   birthTime: 출생 시간 (예: 자시) - 입력값 그대로
    *   sajuComposition:
        *   yearColumn: 년주 정보 (천간, 지지, 음양, 오행)
        *   monthColumn: 월주 정보 (천간, 지지, 음양, 오행)
        *   dayColumn: 일주 정보 (천간, 지지, 음양, 오행)
        *   timeColumn: 시주 정보 (천간, 지지, 음양, 오행)
        *   gapjaYearName: 음력 생년을 기준으로 계산된 60갑자 간지 이름 (예: 경신년(庚申年))
        *   zodiacColor: 음력 생년을 기준으로 계산된 띠의 색깔 (예: 흰색)
        *   zodiacAnimal: 음력 생년을 기준으로 계산된 띠 동물 (예: 원숭이띠). 이 모든 정보는 lunarBirthDate를 기준으로 계산해야 합니다.

**2. 종합 점수 및 평가:**
    *   totalScore: 종합 점수 (100점 만점)
    *   grade: 종합 등급 ('매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨')
    *   detailedScores:
        *   eumYangOhaengScore: 음양오행 점수 (5점 만점)
        *   suriGilhyungScore: 수리길흉 점수 (35점 만점)
        *   pronunciationOhaengScore: 발음오행 점수 (25점 만점)
        *   suriOhaengScore: 수리오행 점수 (5점 만점) - 수리 자체의 오행적 특성 점수
        *   resourceOhaengScore: 자원오행 점수 (30점 만점)

**3. 음양오행 분석 (사주 기반):**
    *   sajuAnalysis: (년주, 월주, 일주, 시주 각각의 천간, 지지, 음양, 오행 정보 - 위 sajuComposition의 year/month/day/timeColumn 반복)
    *   eumYangRatio: 음양 비율 (eumPercent, yangPercent)
    *   ohaengRatio: 오행 비율 (목, 화, 토, 금, 수 각각의 % 및 보충이 필요한 오행 명시)

**4. 음양 조화 분석 (이름 자체):**
    *   hanjaStrokesAndEumyang: 이름 각 글자의 한자 획수 및 음양 정보 배열 (한글 이름인 경우, 한글 음절 자체의 음양 분석)
        *   각 요소는 { character: '글자', strokes: 획수 (선택), eumYang: '음/양' } 형태
    *   ohaengHarmony: 이름 글자 간 오행의 상생 또는 상극 관계에 대한 상세 설명
    *   evaluation: 음양 조화에 대한 최종 평가 (예: 음양이 조화로운 좋은 이름입니다.)

**5. 수리길흉 분석 (5격 중심):** (각 격은 설명, 길흉 등급, 해당 격의 오행을 포함. 나이대는 참고용이며, 실제 영향력은 복합적임)
    *   cheonGyeok: 천격 (초년운, 1-20세) - 이 격(運)이 개인의 성격, 초기 사회 생활, 건강, 그리고 학업운에 구체적으로 어떤 영향을 미치는지 상세히 설명해주십시오. 이 시기에 나타날 수 있는 잠재적인 강점과 약점, 기회와 도전 과제들을 명확히 제시하고, 이 시기를 성공적으로 헤쳐나가기 위한 실질적이고 지혜로운 조언을 포함해주십시오. 등급 ('매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨') 및 해당 격의 오행을 명시하시오.
    *   inGyeok: 인격 (중년운, 20-40세, 성격, 대인관계) - 이 격(運)이 개인의 성격 형성, 대인관계, 사회 활동 시작, 그리고 직업적 기초에 구체적으로 어떤 영향을 미치는지 상세히 설명해주십시오. 이 시기에 나타날 수 있는 잠재적인 강점과 약점, 기회와 도전 과제들을 명확히 제시하고, 이 시기를 성공적으로 헤쳐나가기 위한 실질적이고 지혜로운 조언을 포함해주십시오. 등급 ('매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨') 및 해당 격의 오행을 명시하시오.
    *   jiGyeok: 지격 (장년운, 30-50세, 가정, 배우자, 건강) - 이 격(運)이 개인의 가정 생활, 배우자와의 관계, 자녀운, 건강 상태, 그리고 사회적 안정에 구체적으로 어떤 영향을 미치는지 상세히 설명해주십시오. 이 시기에 나타날 수 있는 잠재적인 강점과 약점, 기회와 도전 과제들을 명확히 제시하고, 이 시기를 성공적으로 헤쳐나가기 위한 실질적이고 지혜로운 조언을 포함해주십시오. 등급 ('매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨') 및 해당 격의 오행을 명시하시오.
    *   oeGyeok: 외격 (말년운, 40세 이후 사회활동, 환경적응) - 이 격(運)이 개인의 사회적 활동, 외부 환경과의 관계, 명예, 그리고 중장년기의 직업적 성취에 구체적으로 어떤 영향을 미치는지 상세히 설명해주십시오. 이 시기에 나타날 수 있는 잠재적인 강점과 약점, 기회와 도전 과제들을 명확히 제시하고, 이 시기를 성공적으로 헤쳐나가기 위한 실질적이고 지혜로운 조언을 포함해주십시오. 등급 ('매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨') 및 해당 격의 오행을 명시하시오.
    *   jongGyeok: 종격 (총격, 전체 인생 총운) - 이 격(運)이 개인의 인생 전체적인 흐름과 말년의 삶, 건강, 재물, 그리고 자손과의 관계에 구체적으로 어떤 영향을 미치는지 상세히 설명해주십시오. 이 시기에 나타날 수 있는 잠재적인 강점과 약점, 기회와 도전 과제들을 명확히 제시하고, 이 시기를 성공적으로 헤쳐나가기 위한 실질적이고 지혜로운 조언을 포함해주십시오. 등급 ('매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨') 및 해당 격의 오행을 명시하시오.

**6. 발음오행 분석:**
    *   initialConsonants: 이름 각 글자의 초성 및 해당 오행 배열
        *   각 요소는 { character: '한글자', consonant: '초성', ohaeng: '오행' } 형태
    *   harmonyRelationship: 초성 오행 간의 상생 또는 상극 관계에 대한 상세 설명
    *   evaluation: 발음오행에 대한 최종 평가

**7. 자원오행 분석:**
    *   sajuStrengthAnalysis: 사주 강약 분석 (어떤 오행이 부족하고 어떤 오행이 넘치는지 상세 설명)
    *   yongsin: 사주를 균형있게 만들기 위해 가장 필요한 핵심 오행 (용신) 설명
    *   nameResourceOhaengMatch: 이름 한자(한자 이름의 경우)의 본래 뜻에 담긴 오행(자원오행)이 사주의 용신을 잘 보완하는지에 대한 상세 설명 및 평가

**8. 한자 필터링 분석 (한자 이름의 경우에만 해당, 한글 이름이면 "해당 없음" 또는 긍정적 기술):**
    *   inappropriateHanja: 이름에 사용된 한자가 불용한자(획수가 너무 많거나, 뜻이 나쁘거나, 특정 상황에만 쓰는 글자)인지 여부 및 그 이유에 대한 설명
    *   firstChildOnlyHanja: 이름에 사용된 한자가 장자(녀) 전용 한자인지 여부 및 그 이유에 대한 설명 (일반적인 기준으로 판단하거나 해당 분석이 제한될 수 있음을 명시)

**9. 전체 평가 요약:**
    *   summary: 위 모든 항목의 분석 결과를 종합하여 이름에 대한 최종적이고 상세한 평가 (장점, 단점, 전반적인 조언 포함)
    *   cautions: 특별히 주의해야 할 점이나 개선을 위한 제언 (선택 사항)

사용자의 미래에 대한 깊은 통찰과 지혜를 담아, 각 항목을 상세하고 정확하게 분석해주십시오.`,
});

const interpretNameFlow = ai.defineFlow(
  {
    name: 'interpretNameFlow',
    inputSchema: InterpretNameInputSchema,
    outputSchema: InterpretNameOutputSchema,
  },
  async input => {
    const {output} = await nameInterpretationPrompt(input);
    if (!output) {
      throw new Error("이름 풀이 결과를 생성하지 못했습니다.");
    }
    // Ensure gender output matches input as a fallback, though LLM should handle it
    if (output.basicInfoSummary && output.basicInfoSummary.gender !== (input.gender === 'male' ? '남자' : '여자')) {
        // This is a safeguard. Ideally, the LLM follows the prompt.
        // console.warn("LLM did not match gender input. Overriding.");
        output.basicInfoSummary.gender = (input.gender === 'male' ? '남자' : '여자');
    }
    return output;
  }
);
