import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from "@/app/ui/dashboard/revenue-chart"

export default async function ReportsPage() {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    redirect("/dashboard")
  }

  // Fetch full year data
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1) // Jan 1st
  const payments = await prisma.payment.findMany({
    where: {
      clubId: user.clubId,
      paidAt: { gte: startOfYear }
    },
    orderBy: { paidAt: 'asc' }
  })

  // Group by month
  const chartData = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), i, 1)
    const monthName = d.toLocaleString('es-ES', { month: 'long' }) // Spanish locale

    const total = payments
      .filter(p => p.paidAt && p.paidAt.getMonth() === i)
      .reduce((sum, p) => sum + p.amount, 0)

    chartData.push({ name: monthName, total })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reportes Financieros (Anual)</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ingresos {now.getFullYear()}</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  )
}
