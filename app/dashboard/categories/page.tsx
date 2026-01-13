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
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function CategoriesPage() {
  const session = await auth()
  const user = session?.user

  if (user?.role !== Role.CLUB_ADMIN || !user.clubId) {
    redirect("/dashboard")
  }

  // Fetch categories where the parent discipline belongs to the user's club
  const categories = await prisma.category.findMany({
    where: {
      discipline: {
        clubId: user.clubId
      }
    },
    include: {
      discipline: true,
      _count: { select: { enrollments: true } }
    },
    orderBy: {
      discipline: {
        name: 'asc'
      }
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Todas las Categorías</h1>
        <Button asChild>
          <Link href="/dashboard/disciplines">
            Gestionar por Disciplina
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Disciplina</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Inscriptos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No hay categorías registradas. Ve a "Disciplinas" para crear una.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{c.discipline.name}</Badge>
                  </TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell>{c._count.enrollments}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/disciplines/${c.disciplineId}/categories/${c.id}`}>
                        Ver Detalles
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
