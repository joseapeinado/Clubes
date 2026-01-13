import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/app/ui/dashboard/stat-card"
import { RevenueChart } from "@/app/ui/dashboard/revenue-chart"
import { Role } from "@prisma/client"
import { Users, CreditCard, DollarSign, Trophy } from "lucide-react"

async function getAdminStats(clubId: string) {
  const totalStudents = await prisma.user.count({
    where: { clubId, role: Role.STUDENT, status: 'ACTIVE' }
  })

  // Calculate current month revenue
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const payments = await prisma.payment.findMany({
    where: {
      clubId,
      period: {
        gte: firstDay,
        lt: nextMonth
      }
    }
  })

  const totalIncome = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingIncome = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0)

  // Last 6 months revenue for chart
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const chartPayments = await prisma.payment.findMany({
    where: {
      clubId,
      status: 'PAID',
      paidAt: { gte: sixMonthsAgo }
    }
  })

  const chartData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = d.toLocaleString('es-ES', { month: 'short' })

    const total = chartPayments
      .filter(p => p.paidAt && p.paidAt.getMonth() === d.getMonth() && p.paidAt.getFullYear() === d.getFullYear())
      .reduce((sum, p) => sum + p.amount, 0)

    chartData.push({ name: monthName, total })
  }

  return { totalStudents, totalIncome, pendingIncome, chartData }
}

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user

  if (!user?.clubId) {
    return <div>Por favor contacta a soporte para vincular tu cuenta a un club.</div>
  }

  // Fetch metrics for Professor
  if (user.role === Role.PROFESSOR && user.clubId && user.id) {
    const stats = await getProfessorStats(user.clubId, user.id)
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Mi Panel</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Mis Clases"
            value={stats.activeClasses}
            icon={Trophy}
            description="Categorías asignadas"
          />
          <StatCard
            title="Mis Alumnos"
            value={stats.activeStudents}
            icon={Users}
            description="Total alumnos en mis clases"
          />
        </div>
        <div className="grid gap-4">
          {/* Future: Schedule or Class List */}
          <Card>
            <CardHeader><CardTitle>Información</CardTitle></CardHeader>
            <CardContent>
              <p>Bienvenido al panel de profesor. Aquí podrás ver tus próximas clases y gestionar a tus alumnos.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Admin view
  const stats = await getAdminStats(user.clubId)

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Resumen General</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Alumnos Activos"
          value={stats.totalStudents}
          icon={Users}
        />
        <StatCard
          title="Ingresos Mensuales"
          value={`$${stats.totalIncome}`}
          icon={DollarSign}
          description="Pagos confirmados este mes"
        />
        <StatCard
          title="Ingresos Pendientes"
          value={`$${stats.pendingIncome}`}
          icon={CreditCard}
          description="Cuotas esperadas este mes"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ingresos por Mes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={stats.chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function getProfessorStats(clubId: string, professorId: string) {
  // Count categories assigned to this professor
  // We use the TeachingAssignment model to find assignments
  const assignments = await prisma.teachingAssignment.findMany({
    where: {
      userId: professorId,
      category: {
        discipline: {
          clubId: clubId
        }
      }
    },
    include: {
      category: {
        include: {
          enrollments: true
        }
      }
    }
  })

  // Wait, let's check schema. Enrollment links User to Category.
  // We need to count unique students.
  // category.students is NOT valid if relation is `enrollments`?
  // Schema check: Category has `enrollments Enrollment[]`. It does NOT have `students User[]`.
  // So we need to fetch enrollments.

  const activeClasses = assignments.length

  const studentIds = new Set<string>()

  // We need to fetch the actual students via enrollments
  // This might be better done with a separate query if performance matters, 
  // but for now let's use the relation if we can deep fetch.
  // Actually, let's just query enrollments directly for all these categories.

  const categoryIds = assignments.map(a => a.categoryId)

  const enrollments = await prisma.enrollment.findMany({
    where: {
      categoryId: { in: categoryIds }
    },
    select: { userId: true }
  })

  enrollments.forEach(e => studentIds.add(e.userId))

  return {
    activeClasses,
    activeStudents: studentIds.size
  }
}
