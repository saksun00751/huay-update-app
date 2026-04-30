import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ groupCode: string }>
}

export default async function LotteryGroupPage({ params }: PageProps) {
  const { groupCode } = await params
  redirect(`/th/lottery/group/${groupCode}`)
}
