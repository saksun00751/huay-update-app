export type Lang = 'th' | 'en' | 'la' | 'kh'
export const LANGS: Lang[] = ['th', 'en', 'la', 'kh']
export const LANG_LABEL: Record<Lang, string> = {
  th: 'ไทย', en: 'English', la: 'ລາວ', kh: 'ខ្មែរ',
}
export const LANG_FLAG: Record<Lang, string> = {
  th: '🇹🇭', en: '🇬🇧', la: '🇱🇦', kh: '🇰🇭',
}
export const LANG_LOCALE: Record<Lang, string> = {
  th: 'th-TH', en: 'en-US', la: 'lo-LA', kh: 'km-KH',
}

export interface Dict {
  brand: string
  tagline: string
  todayResults: string
  all: string
  hasResult: string
  notFound: string
  tryOther: string
  loadFail: string
  firstPrize: string
  top3: string
  top2: string
  bottom2: string
  top3Short: string
  top2Short: string
  bottom2Short: string
  noResult: string
  notYet: string
  latest: string
  history: string
  draws: string
  hourSuffix: string
  language: string
}

export const DICT: Record<Lang, Dict> = {
  th: {
    brand: 'ตรวจหวย',
    tagline: 'ผลรางวัลตามวันที่',
    todayResults: '🎰 ผลหวยประจำวัน',
    all: 'ทั้งหมด',
    hasResult: 'มีผล',
    notFound: 'ไม่พบข้อมูล',
    tryOther: 'ลองเปลี่ยนวันที่หรือกลุ่มหวยอื่น',
    loadFail: 'โหลดข้อมูลไม่สำเร็จ',
    firstPrize: 'รางวัลที่ 1',
    top3: '3 ตัวบน',
    top2: '2 ตัวบน',
    bottom2: '2 ตัวล่าง',
    top3Short: '3 บน',
    top2Short: '2 บน',
    bottom2Short: '2 ล่าง',
    noResult: 'งดออกผล',
    notYet: 'ยังไม่มีผล',
    latest: 'งวดล่าสุด',
    history: 'ผลย้อนหลัง',
    draws: 'งวด',
    hourSuffix: 'น.',
    language: 'ภาษา',
  },
  en: {
    brand: 'Lottery Check',
    tagline: 'Results by date',
    todayResults: '🎰 Today\'s Results',
    all: 'All',
    hasResult: 'results',
    notFound: 'No data',
    tryOther: 'Try another date or group',
    loadFail: 'Failed to load',
    firstPrize: '1st Prize',
    top3: '3 Top',
    top2: '2 Top',
    bottom2: '2 Bottom',
    top3Short: '3 Top',
    top2Short: '2 Top',
    bottom2Short: '2 Bot',
    noResult: 'No draw',
    notYet: 'Not yet',
    latest: 'Latest draw',
    history: 'History',
    draws: 'draws',
    hourSuffix: '',
    language: 'Language',
  },
  la: {
    brand: 'ກວດຫວຍ',
    tagline: 'ຜົນຫວຍຕາມວັນທີ',
    todayResults: '🎰 ຜົນຫວຍປະຈຳວັນ',
    all: 'ທັງໝົດ',
    hasResult: 'ມີຜົນ',
    notFound: 'ບໍ່ພົບຂໍ້ມູນ',
    tryOther: 'ລອງປ່ຽນວັນທີ ຫຼື ກຸ່ມອື່ນ',
    loadFail: 'ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ',
    firstPrize: 'ລາງວັນທີ 1',
    top3: '3 ໂຕເທິງ',
    top2: '2 ໂຕເທິງ',
    bottom2: '2 ໂຕລຸ່ມ',
    top3Short: '3 ເທິງ',
    top2Short: '2 ເທິງ',
    bottom2Short: '2 ລຸ່ມ',
    noResult: 'ງົດອອກຜົນ',
    notYet: 'ຍັງບໍ່ມີຜົນ',
    latest: 'ງວດລ່າສຸດ',
    history: 'ຜົນຍ້ອນຫຼັງ',
    draws: 'ງວດ',
    hourSuffix: 'ໂມງ',
    language: 'ພາສາ',
  },
  kh: {
    brand: 'ឆែកឆ្នោត',
    tagline: 'លទ្ធផលតាមថ្ងៃ',
    todayResults: '🎰 លទ្ធផលឆ្នោតប្រចាំថ្ងៃ',
    all: 'ទាំងអស់',
    hasResult: 'មានលទ្ធផល',
    notFound: 'រកមិនឃើញទិន្នន័យ',
    tryOther: 'សូមសាកល្បងថ្ងៃ ឬ ក្រុមផ្សេង',
    loadFail: 'បរាជ័យក្នុងការផ្ទុក',
    firstPrize: 'រង្វាន់ទី១',
    top3: 'លេខ៣ខាងលើ',
    top2: 'លេខ២ខាងលើ',
    bottom2: 'លេខ២ខាងក្រោម',
    top3Short: '៣លើ',
    top2Short: '២លើ',
    bottom2Short: '២ក្រោម',
    noResult: 'ឈប់ប្រកាស',
    notYet: 'មិនទាន់មានលទ្ធផល',
    latest: 'ឆ្នោតថ្មីបំផុត',
    history: 'លទ្ធផលអតីតកាល',
    draws: 'ដង',
    hourSuffix: 'ម៉ោង',
    language: 'ភាសា',
  },
}

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as string[]).includes(v)
}
