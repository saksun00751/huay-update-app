import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ date: string }>
}

export default async function LotteryDatePage({ params }: PageProps) {
  const { date } = await params
  redirect(`/th/lottery/${date}`)
}
