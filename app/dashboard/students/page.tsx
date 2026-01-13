
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
import { Badge } from "@/components/ui/badge"
import { StudentForm } from "@/app/ui/students/student-form"
import { StudentEnrollmentsDialog } from "@/app/ui/students/student-enrollments-dialog"
import { StudentPaymentsDialog } from "@/app/ui/students/student-payments-dialog"

export default async function StudentsPage() {
  const session = await auth()
  const user = session?.user

  if (!user?.clubId || user.role !== Role.CLUB_ADMIN) {
    redirect("/dashboard")
  }

  const students = await prisma.user.findMany({
    where: {
      clubId: user.clubId,
      role: Role.STUDENT
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Alumnos</h1>
          <p className="text-muted-foreground">Gestiona el padrón de alumnos de tu club.</p>
        </div>
        <StudentForm />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No hay alumnos registrados.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    <div>{student.name}</div>
                    {student.sex && <div className="text-xs text-muted-foreground text-[10px]">{student.sex}</div>}
                  </TableCell>
                  <TableCell>{student.dni || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{student.email}</span>
                      {student.phone && <span className="text-xs text-muted-foreground">{student.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <StudentForm student={student} />
                    <StudentEnrollmentsDialog student={student} />
                    <StudentPaymentsDialog student={student} />
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
