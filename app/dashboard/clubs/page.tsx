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
import { Plus } from "lucide-react"
import { CreateClubDialog } from "@/app/ui/clubs/create-club-dialog"

export default async function ClubsPage() {
  const session = await auth()
  if (session?.user?.role !== Role.SUPER_ADMIN) {
    redirect("/dashboard")
  }

  const clubs = await prisma.club.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clubes</h1>
        <CreateClubDialog />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No hay clubes registrados.
                </TableCell>
              </TableRow>
            ) : (
              clubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>{club.slug}</TableCell>
                  <TableCell>{club._count.users}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
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
