import Link from 'next/link'
import { formatSeoDate, localizedPath, lotteryGroups } from '@/lib/seo'
import type { Lang } from '@/lib/i18n'

export const LOTTERY_FAQS = [
  {
    question: 'ตรวจหวย Huay Update อัปเดตผลเมื่อไหร่',
    answer: 'ระบบจะแสดงผลหวยตามวันที่เลือก และอัปเดตข้อมูลเป็นระยะเมื่อมีผลออกจากแหล่งข้อมูลของแต่ละตลาดหวย',
  },
  {
    question: 'ดูผลหวยย้อนหลังได้อย่างไร',
    answer: 'เลือกวันที่จากปฏิทิน หรือกดลิงก์ผลหวยย้อนหลังด้านล่างเพื่อเปิดหน้าผลหวยรายวันย้อนหลัง',
  },
  {
    question: 'มีผลหวยประเภทไหนบ้าง',
    answer: 'หน้าเว็บรวมผลหวยหลายกลุ่ม เช่น หวยไทย หวยต่างประเทศ หวยหุ้น และหวยรายวันที่มีข้อมูลในระบบ',
  },
  {
    question: 'เลขที่แสดงมีอะไรบ้าง',
    answer: 'แต่ละตลาดหวยจะแสดงเลขรางวัลตามข้อมูลที่มี เช่น 3 ตัวบน 2 ตัวบน 2 ตัวล่าง หรือรางวัลที่ 1 สำหรับบางตลาด',
  },
]

function addDays(date: string, amount: number): string {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + amount)
  return d.toISOString().slice(0, 10)
}

export function recentLotteryDates(currentDate: string, total = 14): string[] {
  return Array.from({ length: total }, (_, index) => addDays(currentDate, -index))
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LOTTERY_FAQS.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export default function LotterySeoContent({ currentDate, lang = 'th' }: { currentDate: string; lang?: Lang }) {
  const dates = recentLotteryDates(currentDate)
  const href = (path: string) => localizedPath(path, lang)

  return (
    <section className="seo-section" aria-label="ข้อมูลตรวจหวยและผลหวยย้อนหลัง">
      <div className="seo-inner">
        <div className="seo-copy">
          <h2>ตรวจหวยย้อนหลังและผลหวยประจำวันที่ {formatSeoDate(currentDate)}</h2>
          <p>
            Huay Update รวมผลหวยตามวันที่ ทั้งหวยไทย หวยต่างประเทศ หวยหุ้น และหวยรายวัน
            เพื่อให้ตรวจผลรางวัลได้จากหน้าเดียว พร้อมลิงก์ย้อนหลังแยกตามวันที่สำหรับค้นหาง่าย
          </p>
        </div>

        <div className="seo-link-block">
          <h2>เลือกดูตามประเภทหวย</h2>
          <div className="seo-date-links">
            {lotteryGroups.map(group => (
              <Link key={group.code} href={href(`/lottery/group/${group.code}`)} className="seo-date-link">
                {group.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="seo-link-block">
          <h2>ผลหวยย้อนหลัง</h2>
          <div className="seo-date-links">
            {dates.map(date => (
              <Link key={date} href={href(`/lottery/${date}`)} className="seo-date-link">
                {formatSeoDate(date)}
              </Link>
            ))}
          </div>
        </div>

        <div className="seo-faq">
          <h2>คำถามที่พบบ่อย</h2>
          <div className="seo-faq-grid">
            {LOTTERY_FAQS.map(item => (
              <article key={item.question} className="seo-faq-item">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="seo-copy">
          <h1>ตรวจหวย Huay Update — ผลหวยล่าสุดวันนี้ ครบทุกประเภท</h1>
          <p>
            รวมผลหวยล่าสุดครบทุกประเภท ทั้งหวยไทย หวยหุ้น และหวยต่างประเทศ
            อัปเดตรวดเร็ว แม่นยำ ทุกวัน ที่นี่ที่เดียว
          </p>

          <h2>ผลหวยที่รองรับทั้งหมด</h2>

          <h3>หวยหุ้นไทยและต่างประเทศ</h3>
          <p>
            ติดตามผลหวยหุ้นนิเคอิ ฮั่งเส็ง ดาวโจนส์ และหุ้นอื่นๆ ทั้งรอบเช้าและรอบบ่าย
            พร้อมผล 3 ตัวบน 2 ตัวบน และ 2 ตัวล่าง
          </p>

          <h3>หวยลาวและหวยอาเซียน</h3>
          <p>
            ครอบคลุมหวยลาว TV ลาวประตูชัย ลาวสันติภาพ ฮานอยอาเซียน
            และหวยรายวันอื่นๆ อีกมากมาย
          </p>

          <h2>ทำไมต้องตรวจหวยที่ Huay Update?</h2>
          <p>
            เราอัปเดตผลหวยอย่างรวดเร็ว ครอบคลุมมากกว่า 14 ประเภทต่อวัน
            ใช้งานง่ายผ่านมือถือและคอมพิวเตอร์ ไม่ต้องสมัครสมาชิก เข้าดูได้ทันที
          </p>
        </div>
      </div>
    </section>
  )
}
