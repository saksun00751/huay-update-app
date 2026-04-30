import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ groupCode: string; date: string }>
}

export default async function LotteryGroupDatePage({ params }: PageProps) {
  const { groupCode, date } = await params
  redirect(`/th/lottery/group/${groupCode}/${date}`)
}
