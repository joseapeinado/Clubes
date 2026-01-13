import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CreateDisciplineDialog } from "@/app/ui/disciplines/create-discipline-dialog"
import { createDiscipline } from "@/app/lib/discipline-actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function DisciplinesPage() {
  const session = await auth()
  const user = session?.user

  if (!user?.clubId || (user.role !== Role.CLUB_ADMIN && user.role !== Role.PROFESSOR)) {
    redirect("/dashboard")
  }

  const whereCondition: any = { clubId: user.clubId }

  // If Professor, filter by assigned categories
  if (user.role === Role.PROFESSOR) {
    whereCondition.categories = {
      some: {
        teachingAssignments: {
          some: {
            userId: user.id
          }
        }
      }
    }
  }

  const disciplines = await prisma.discipline.findMany({
    where: whereCondition,
    include: {
      _count: { select: { categories: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Disciplinas</h1>
        {user.role === Role.CLUB_ADMIN && <CreateDisciplineDialog createAction={createDiscipline} />}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Categorías</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disciplines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No hay disciplinas registradas.
                </TableCell>
              </TableRow>
            ) : (
              disciplines.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.description}</TableCell>
                  <TableCell>{d._count.categories}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/disciplines/${d.id}`}>
                        Ver Detalles <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
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
