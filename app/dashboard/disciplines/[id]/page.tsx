import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"
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
import { CreateCategoryDialog } from "@/app/ui/disciplines/create-category-dialog"
import { EditCategoryDialog } from "@/app/ui/disciplines/edit-category-dialog"
import { updateCategory } from "@/app/lib/discipline-actions"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function DisciplineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const user = session?.user

  if (!user?.clubId || (user.role !== Role.CLUB_ADMIN && user.role !== Role.PROFESSOR)) {
    redirect("/dashboard")
  }

  // If Professor, verify they have at least one assignment in this discipline
  if (user.role === Role.PROFESSOR) {
    const hasAssignment = await prisma.teachingAssignment.findFirst({
      where: {
        userId: user.id,
        category: { disciplineId: id }
      }
    })

    if (!hasAssignment) {
      redirect("/dashboard")
    }
  }

  const discipline = await prisma.discipline.findUnique({
    where: { id: id },
    include: {
      categories: {
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { enrollments: true } }
        }
      }
    }
  })

  // Security check: belong to same club
  if (!discipline || discipline.clubId !== user.clubId) {
    redirect("/dashboard/disciplines")
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/disciplines">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{discipline.name}</h1>
          <p className="text-muted-foreground">{discipline.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
        <h2 className="text-xl font-semibold">Categorías</h2>
        {user.role === Role.CLUB_ADMIN && <CreateCategoryDialog disciplineId={discipline.id} />}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Inscriptos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discipline.categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No hay categorías en esta disciplina.
                </TableCell>
              </TableRow>
            ) : (
              discipline.categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell>{c._count.enrollments}</TableCell>
                  <TableCell className="text-right">
                    {user.role === Role.CLUB_ADMIN && <EditCategoryDialog category={c} updateAction={updateCategory} />}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
