
import { getRuneImageUrl } from '@/lib/constants';

export interface Rune {
  id: string;
  name: string; // English name
  koreanName: string;
  symbol: string; // Rune unicode character
  keywordsUpright: string; // For AI prompt
  keywordsReversed: string; // For AI prompt
  description: string; // Simple description for UI
  imageUrl: string; 
  dataAiHint: string; 
}

// Define image filenames for each rune
const runeImageFilenames: { [key: string]: string } = {
  "Fehu": "rune_fehu.png",
  "Uruz": "rune_uruz.png",
  "Thurisaz": "rune_thurisaz.png",
  "Ansuz": "rune_ansuz.png",
  "Raidho": "rune_raidho.png",
  "Kenaz": "rune_kenaz.png",
  "Gebo": "rune_gebo.png",
  "Wunjo": "rune_wunjo.png",
  "Hagalaz": "rune_hagalaz.png",
  "Nauthiz": "rune_nauthiz.png",
  "Isa": "rune_isa.png",
  "Jera": "rune_jera.png",
  "Eihwaz": "rune_eihwaz.png",
  "Perthro": "rune_perthro.png",
  "Algiz": "rune_algiz.png",
  "Sowilo": "rune_sowilo.png",
  "Tiwaz": "rune_tiwaz.png",
  "Berkano": "rune_berkano.png",
  "Ehwaz": "rune_ehwaz.png",
  "Mannaz": "rune_mannaz.png",
  "Laguz": "rune_laguz.png",
  "Ingwaz": "rune_ingwaz.png",
  "Dagaz": "rune_dagaz.png",
  "Othala": "rune_othala.png",
};

const baseRunesData = [
  {
    id: "fehu",
    name: "Fehu",
    koreanName: "페후",
    symbol: "ᚠ",
    keywordsUpright: "재산, 풍요, 소유, 수입, 번영, 성공, 새로운 시작",
    keywordsReversed: "손실, 빈곤, 실패, 장애물, 탐욕, 박탈",
    description: "재산, 가축, 풍요를 상징합니다. 물질적 부와 성취를 의미합니다.",
    dataAiHint: "rune fehu",
  },
  {
    id: "uruz",
    name: "Uruz",
    koreanName: "우루즈",
    symbol: "ᚢ",
    keywordsUpright: "힘, 건강, 활력, 용기, 인내, 지구력, 개인적 성장",
    keywordsReversed: "약함, 질병, 무기력, 두려움, 포기, 저항",
    description: "들소, 원초적인 힘, 건강을 상징합니다. 육체적, 정신적 강인함을 의미합니다.",
    dataAiHint: "rune uruz",
  },
  {
    id: "thurisaz",
    name: "Thurisaz",
    koreanName: "투리사즈",
    symbol: "ᚦ",
    keywordsUpright: "보호, 방어, 저항, 가시, 파괴적인 힘, 결단력",
    keywordsReversed: "위험, 공격성, 배신, 무방비, 충동적인 행동",
    description: "가시, 거인, 보호를 상징합니다. 강력한 방어와 때로는 파괴적인 힘을 의미합니다.",
    dataAiHint: "rune thurisaz",
  },
  {
    id: "ansuz",
    name: "Ansuz",
    koreanName: "안수즈",
    symbol: "ᚫ",
    keywordsUpright: "지혜, 의사소통, 영감, 신성한 메시지, 조언, 학습",
    keywordsReversed: "오해, 거짓말, 속임수, 부족한 조언, 혼란",
    description: "신, 입, 소통을 상징합니다. 지혜, 영감, 신성한 메시지를 의미합니다.",
    dataAiHint: "rune ansuz",
  },
  {
    id: "raidho",
    name: "Raidho",
    koreanName: "라이도",
    symbol: "ᚱ",
    keywordsUpright: "여행, 여정, 움직임, 변화, 진보, 올바른 길",
    keywordsReversed: "정체, 지연, 잘못된 방향, 방해, 혼란스러운 여정",
    description: "수레바퀴, 여행, 움직임을 상징합니다. 육체적, 정신적 여정과 진보를 의미합니다.",
    dataAiHint: "rune raidho",
  },
  {
    id: "kenaz",
    name: "Kenaz",
    koreanName: "케나즈",
    symbol: "ᚲ",
    keywordsUpright: "지식, 깨달음, 창의력, 영감, 빛, 명확성, 통찰력",
    keywordsReversed: "무지, 혼란, 창의력 부족, 어둠, 오해",
    description: "횃불, 빛, 지식을 상징합니다. 깨달음, 창의력, 명확한 통찰을 의미합니다.",
    dataAiHint: "rune kenaz",
  },
  {
    id: "gebo",
    name: "Gebo",
    koreanName: "게보",
    symbol: "ᚷ",
    keywordsUpright: "선물, 관대함, 파트너십, 균형, 교환, 관계",
    keywordsReversed: "이기심, 불균형, 의무, 희생, 관계의 어려움", // Note: Gebo has no reversed typically, but for completeness.
    description: "선물, 관대함을 상징합니다. 파트너십, 균형, 상호 교환을 의미합니다. (역방향 없음)",
    dataAiHint: "rune gebo",
  },
  {
    id: "wunjo",
    name: "Wunjo",
    koreanName: "운조",
    symbol: "ᚹ",
    keywordsUpright: "기쁨, 행복, 성공, 조화, 만족, 공동체",
    keywordsReversed: "슬픔, 불행, 갈등, 고립, 실망",
    description: "기쁨, 영광, 행복을 상징합니다. 성공, 조화, 만족감을 의미합니다.",
    dataAiHint: "rune wunjo",
  },
  {
    id: "hagalaz",
    name: "Hagalaz",
    koreanName: "하갈라즈",
    symbol: "ᚺ",
    keywordsUpright: "파괴, 혼란, 갑작스러운 변화, 위기, 자연의 힘, 정화",
    keywordsReversed: "통제 불능, 재난, 고통, 손실, 지연된 변화", // Note: Hagalaz has no reversed typically.
    description: "우박, 파괴적인 자연의 힘을 상징합니다. 갑작스러운 변화와 위기를 통한 정화를 의미합니다. (역방향 없음)",
    dataAiHint: "rune hagalaz",
  },
  {
    id: "nauthiz",
    name: "Nauthiz",
    koreanName: "나우티즈",
    symbol: "ᚾ",
    keywordsUpright: "필요, 제약, 어려움, 인내, 자기 극복, 운명",
    keywordsReversed: "궁핍, 고통, 속박, 절망, 저항할 수 없는 욕구",
    description: "필요, 궁핍, 제약을 상징합니다. 어려움을 통한 인내와 자기 극복을 의미합니다.",
    dataAiHint: "rune nauthiz",
  },
  {
    id: "isa",
    name: "Isa",
    koreanName: "이싸",
    symbol: "ᛁ",
    keywordsUpright: "얼음, 정체, 지연, 인내, 집중, 자기 통제",
    keywordsReversed: "움직임 없음, 좌절, 고립, 차가움, 감정적 마비", // Note: Isa has no reversed typically.
    description: "얼음, 정체를 상징합니다. 지연, 인내, 자기 통제의 시간을 의미합니다. (역방향 없음)",
    dataAiHint: "rune isa",
  },
  {
    id: "jera",
    name: "Jera",
    koreanName: "예라",
    symbol: "ᛃ",
    keywordsUpright: "수확, 결실, 순환, 시간, 보상, 인과응보",
    keywordsReversed: "나쁜 시기, 노력의 부족, 지연된 결실, 반복되는 문제", // Note: Jera has no reversed typically.
    description: "수확, 한 해, 순환을 상징합니다. 노력의 결실과 시간의 흐름을 의미합니다. (역방향 없음)",
    dataAiHint: "rune jera",
  },
  {
    id: "eihwaz",
    name: "Eihwaz",
    koreanName: "에이와즈",
    symbol: "ᛇ",
    keywordsUpright: "주목, 방어, 인내, 변화, 연결, 영적 성장",
    keywordsReversed: "혼란, 약점, 파괴, 두려움, 변화에 대한 저항",
    description: "주목(yew tree), 죽음과 재생, 보호를 상징합니다. 인내와 변화를 통한 영적 성장을 의미합니다.",
    dataAiHint: "rune eihwaz",
  },
  {
    id: "perthro",
    name: "Perthro",
    koreanName: "페르드로",
    symbol: "ᛈ",
    keywordsUpright: "비밀, 운명, 기회, 숨겨진 것, 직관, 주사위 컵",
    keywordsReversed: "폭로, 불운, 막힘, 비밀의 유출, 잘못된 판단",
    description: "주사위 컵, 비밀, 운명을 상징합니다. 숨겨진 기회와 직관의 중요성을 의미합니다.",
    dataAiHint: "rune perthro",
  },
  {
    id: "algiz",
    name: "Algiz",
    koreanName: "알기즈",
    symbol: "ᛉ",
    keywordsUpright: "보호, 방어, 신성한 연결, 수호, 경계, 안전",
    keywordsReversed: "취약함, 위험, 보호받지 못함, 잘못된 신뢰, 망상",
    description: "엘크, 보호, 방어를 상징합니다. 신성한 수호와 안전을 의미합니다.",
    dataAiHint: "rune algiz",
  },
  {
    id: "sowilo",
    name: "Sowilo",
    koreanName: "소윌로",
    symbol: "ᛊ",
    keywordsUpright: "태양, 성공, 활력, 건강, 명확성, 자기 실현",
    keywordsReversed: "실패, 에너지 부족, 어둠, 혼란, 잘못된 성공", // Note: Sowilo has no reversed typically.
    description: "태양, 성공, 활력을 상징합니다. 건강, 명확성, 자기 실현을 의미합니다. (역방향 없음)",
    dataAiHint: "rune sowilo",
  },
  {
    id: "tiwaz",
    name: "Tiwaz",
    koreanName: "티와즈",
    symbol: "ᛏ",
    keywordsUpright: "정의, 용기, 승리, 명예, 자기 희생, 지도력",
    keywordsReversed: "불의, 패배, 비겁함, 불명예, 잘못된 희생",
    description: "전쟁의 신 티르, 정의, 용기를 상징합니다. 승리, 명예, 자기 희생을 의미합니다.",
    dataAiHint: "rune tiwaz",
  },
  {
    id: "berkano",
    name: "Berkano",
    koreanName: "베르카노",
    symbol: "ᛒ",
    keywordsUpright: "성장, 탄생, 다산, 새로운 시작, 치유, 가족",
    keywordsReversed: "정체, 문제, 가족 불화, 성장 장애, 임신 문제",
    description: "자작나무, 탄생, 성장을 상징합니다. 새로운 시작, 치유, 가족의 의미를 지닙니다.",
    dataAiHint: "rune berkano",
  },
  {
    id: "ehwaz",
    name: "Ehwaz",
    koreanName: "에와즈",
    symbol: "ᛖ",
    keywordsUpright: "말, 움직임, 파트너십, 협력, 진보, 신뢰",
    keywordsReversed: "정체, 불화, 불신, 장애물, 여행 문제",
    description: "말, 움직임, 파트너십을 상징합니다. 협력, 진보, 신뢰를 의미합니다.",
    dataAiHint: "rune ehwaz",
  },
  {
    id: "mannaz",
    name: "Mannaz",
    koreanName: "만나즈",
    symbol: "ᛗ",
    keywordsUpright: "인간, 자기, 공동체, 협력, 지성, 사회적 관계",
    keywordsReversed: "고립, 자기기만, 타인과의 문제, 편견, 우울",
    description: "인간, 자아, 공동체를 상징합니다. 사회적 관계와 협력의 중요성을 의미합니다.",
    dataAiHint: "rune mannaz",
  },
  {
    id: "laguz",
    name: "Laguz",
    koreanName: "라구즈",
    symbol: "ᛚ",
    keywordsUpright: "물, 흐름, 감정, 직관, 치유, 꿈, 무의식",
    keywordsReversed: "정체된 감정, 두려움, 환상, 혼란, 잘못된 직관",
    description: "물, 흐름, 감정을 상징합니다. 직관, 치유, 무의식의 세계를 의미합니다.",
    dataAiHint: "rune laguz",
  },
  {
    id: "ingwaz",
    name: "Ingwaz",
    koreanName: "잉와즈",
    symbol: "ᛝ",
    keywordsUpright: "풍요, 다산, 내적 성장, 완성, 휴식, 새로운 단계",
    keywordsReversed: "미완성, 정체, 생산성 부족, 에너지 낭비", // Note: Ingwaz has no reversed typically.
    description: "풍요의 신 잉, 내적 성장, 완성을 상징합니다. 휴식과 새로운 단계로의 진입을 의미합니다. (역방향 없음)",
    dataAiHint: "rune ingwaz",
  },
  {
    id: "dagaz",
    name: "Dagaz",
    koreanName: "다가지",
    symbol: "ᛞ",
    keywordsUpright: "낮, 깨달음, 돌파구, 변화, 희망, 명확성",
    keywordsReversed: "절망, 어둠, 끝없는 밤, 변화의 부재, 혼란", // Note: Dagaz has no reversed typically.
    description: "낮, 깨달음, 돌파구를 상징합니다. 변화, 희망, 명확성을 의미합니다. (역방향 없음)",
    dataAiHint: "rune dagaz",
  },
  {
    id: "othala",
    name: "Othala",
    koreanName: "오달라",
    symbol: "ᛟ",
    keywordsUpright: "유산, 상속, 고향, 가족, 전통, 조상",
    keywordsReversed: "상실, 가족 문제, 고립, 전통과의 단절, 뿌리 없음",
    description: "유산, 상속, 고향을 상징합니다. 가족, 전통, 조상의 중요성을 의미합니다.",
    dataAiHint: "rune othala",
  },
];

export const elderFutharkRunes: Rune[] = baseRunesData.map(rune => {
  const imageName = runeImageFilenames[rune.name];
  let imageUrl: string;
  if (imageName) {
    imageUrl = getRuneImageUrl(imageName);
  } else {
    // Fallback placeholder if image name is not found in map
    imageUrl = `https://placehold.co/100x150.png?text=${encodeURIComponent(rune.symbol)}`; 
    console.warn(`경고: 룬 "${rune.name}"에 대한 이미지를 찾을 수 없습니다. 플레이스홀더 이미지를 사용합니다: ${imageUrl}`);
  }
  return {
    ...rune,
    imageUrl,
  };
});

// Ensure all rune names have a corresponding image filename
const missingRuneImages = baseRunesData.filter(rune => !runeImageFilenames[rune.name]);
if (missingRuneImages.length > 0) {
  console.error(`오류: 다음 룬 이름에 대한 이미지 파일 이름이 runeImageFilenames에 없습니다: ${missingRuneImages.map(r => r.name).join(', ')}`);
}
