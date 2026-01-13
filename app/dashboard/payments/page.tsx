
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Role, PaymentStatus } from "@prisma/client"
import { redirect } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { GenerateFeesDialog } from "@/app/ui/payments/generate-fees-dialog"
import { UploadReceiptDialog } from "@/app/ui/payments/upload-receipt-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

// Helper for date formatting
const formatDate = (date: Date) => date.toISOString().split('T')[0]

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: {
    month?: string
    year?: string
    search?: string
  }
}) {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    redirect("/dashboard")
  }

  // Parse Filters
  const currentDate = new Date()
  const selectedMonth = searchParams?.month ? parseInt(searchParams.month) : currentDate.getMonth() + 1
  const selectedYear = searchParams?.year ? parseInt(searchParams.year) : currentDate.getFullYear()
  const searchQuery = searchParams?.search || ""

  // Construct Date Date Range for Filter
  const startDate = new Date(selectedYear, selectedMonth - 1, 1)
  const endDate = new Date(selectedYear, selectedMonth, 0) // Last day of month

  // Base Where Clause
  const whereClause: any = {
    clubId: user.clubId,
    period: {
      gte: startDate,
      lte: endDate
    }
  }

  // Add Search Filter
  if (searchQuery) {
    whereClause.user = {
      name: {
        contains: searchQuery,
        mode: 'insensitive'
      }
    }
  }

  // Fetch Data
  const payments = await prisma.payment.findMany({
    where: whereClause,
    include: { user: true, category: { include: { discipline: true } } },
    orderBy: { period: 'desc' }
  })

  // Fetch disciplines for the dialog
  const disciplines = await prisma.discipline.findMany({
    where: { clubId: user.clubId },
    include: {
      categories: {
        include: {
          _count: { select: { enrollments: true } }
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Calculate Stats
  const stats = {
    collected: payments.filter(p => p.status === PaymentStatus.PAID).reduce((acc, curr) => acc + curr.amount, 0),
    pending: payments.filter(p => p.status === PaymentStatus.PENDING).reduce((acc, curr) => acc + curr.amount, 0),
    overdue: payments.filter(p => p.status === PaymentStatus.OVERDUE).reduce((acc, curr) => acc + curr.amount, 0),
    total: payments.reduce((acc, curr) => acc + curr.amount, 0)
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
          <p className="text-muted-foreground">Administra las cuotas y verifica comprobantes.</p>
        </div>
        <GenerateFeesDialog disciplines={disciplines} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Periodo</CardTitle>
            <div className="text-muted-foreground">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monto esperado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
            <div className="text-green-500 font-bold">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.collected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <div className="text-amber-500 font-bold">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">${stats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">A la espera de pago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <div className="text-red-500 font-bold">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats.overdue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Requiere atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <div className="space-y-4">
        {/* Filter Component could be client side, but usually simple form get is enough */}
        <form className="flex gap-2 items-end bg-card p-4 rounded-lg border">
          <div className="space-y-1">
            <label className="text-sm font-medium">Mes</label>
            <select name="month" defaultValue={selectedMonth} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('es-ES', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Año</label>
            <select name="year" defaultValue={selectedYear} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Buscar Alumno</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input name="search" placeholder="Nombre del alumno..." defaultValue={searchQuery} className="pl-8" />
            </div>
          </div>
          <Button type="submit" variant="secondary">
            <Filter className="mr-2 h-4 w-4" /> Filtrar
          </Button>
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No hay pagos encontrados para este periodo.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.user.name}</div>
                      <div className="text-xs text-muted-foreground">{p.user.email}</div>
                    </TableCell>
                    <TableCell>{formatDate(p.dueDate)}</TableCell>
                    <TableCell>${p.amount}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'PAID' ? 'default' : p.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status !== 'PAID' && (
                        <UploadReceiptDialog paymentId={p.id} />
                      )}
                      {p.status === 'PAID' && p.receiptUrl && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer">
                            Ver Comprobante
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
