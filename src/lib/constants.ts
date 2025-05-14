
export const EAST_ASIAN_BIRTH_TIMES = [
  { value: "자시", label: "자시 (23:00 - 00:59)" },
  { value: "축시", label: "축시 (01:00 - 02:59)" },
  { value: "인시", label: "인시 (03:00 - 04:59)" },
  { value: "묘시", label: "묘시 (05:00 - 06:59)" },
  { value: "진시", label: "진시 (07:00 - 08:59)" },
  { value: "사시", label: "사시 (09:00 - 10:59)" },
  { value: "오시", label: "오시 (11:00 - 12:59)" },
  { value: "미시", label: "미시 (13:00 - 14:59)" },
  { value: "신시", label: "신시 (15:00 - 16:59)" },
  { value: "유시", label: "유시 (17:00 - 18:59)" },
  { value: "술시", label: "술시 (19:00 - 20:59)" },
  { value: "해시", label: "해시 (21:00 - 22:59)" },
  { value: "모름", label: "모름" },
];

export const CALENDAR_TYPES = [
  { value: "solar", label: "양력" },
  { value: "lunar", label: "음력" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
];

const FIREBASE_STORAGE_BUCKET_NAME_FOR_API = "mystic-muse-rj8ab.firebasestorage.app";
export const FIREBASE_STORAGE_IMAGE_FOLDER_PATH = "image";
const FIREBASE_STORAGE_BASE_URL_FOR_API = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET_NAME_FOR_API}/o`;
export const FIREBASE_STORAGE_SUFFIX = "?alt=media";

const encodeFirebasePath = (pathSegment: string) => encodeURIComponent(pathSegment);

export const TAROT_BACK_IMAGE_URL = `${FIREBASE_STORAGE_BASE_URL_FOR_API}/${encodeFirebasePath(`${FIREBASE_STORAGE_IMAGE_FOLDER_PATH}/tarot-back.jpg`)}${FIREBASE_STORAGE_SUFFIX}`;
export const RUNE_BACK_IMAGE_URL = `${FIREBASE_STORAGE_BASE_URL_FOR_API}/${encodeFirebasePath(`${FIREBASE_STORAGE_IMAGE_FOLDER_PATH}/rune-back.png`)}${FIREBASE_STORAGE_SUFFIX}`;
export const RUNE_FRONT_IMAGE_URL = `${FIREBASE_STORAGE_BASE_URL_FOR_API}/${encodeFirebasePath(`${FIREBASE_STORAGE_IMAGE_FOLDER_PATH}/rune-front.png`)}${FIREBASE_STORAGE_SUFFIX}`;

export const getTarotCardImageUrl = (imageName: string): string => {
  return `${FIREBASE_STORAGE_BASE_URL_FOR_API}/${encodeFirebasePath(`${FIREBASE_STORAGE_IMAGE_FOLDER_PATH}/${imageName}`)}${FIREBASE_STORAGE_SUFFIX}`;
};

export const getRuneImageUrl = (imageName: string): string => {
  return `${FIREBASE_STORAGE_BASE_URL_FOR_API}/${encodeFirebasePath(`${FIREBASE_STORAGE_IMAGE_FOLDER_PATH}/${imageName}`)}${FIREBASE_STORAGE_SUFFIX}`;
};

// JSON 파일들은 이제 public 폴더에서 직접 fetch 되므로, URL 생성 헬퍼는 필요하지 않습니다.
// 필요하다면, fetch('/filename.json') 형태로 사용됩니다.
