
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionState, useEffect, useState } from "react"
import { createStudent, updateStudent, StudentState } from "@/app/dashboard/students/actions"
import { UserStatus } from "@prisma/client"
import { User } from "@prisma/client"
import { Plus, Pencil } from "lucide-react"

export function StudentForm({ student }: { student?: User }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    student ? updateStudent.bind(null, student.id) : createStudent,
    { message: "", errors: {} }
  )

  useEffect(() => {
    if (!state.message && !state.errors && !isPending && open) {
      // Success case (checking !message is tricky if initial is empty string, 
      // but typically error returns a message. Improved in action to return null or success flag usually)
      // Let's rely on checking if it was submitted to close? 
      // Simple hack: if no errors and not pending, close. 
      // Better: Actions return { success: true }. 
      // For now, if state is "empty" it might be initial render. 
      // We'll close manually or if state.message becomes explicitly null.
    }
    if (state.message === null) {
      setOpen(false)
    }
  }, [state, isPending, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {student ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Alumno
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{student ? "Editar Alumno" : "Crear Alumno"}</DialogTitle>
          <DialogDescription>
            {student ? "Modifica los datos del alumno." : "Ingresa los datos del nuevo alumno."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nombre</Label>
            <div className="col-span-3">
              <Input id="name" name="name" defaultValue={student?.name} required />
              {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dni" className="text-right">DNI</Label>
            <div className="col-span-3">
              <Input id="dni" name="dni" defaultValue={student?.dni || ''} required />
              {state.errors?.dni && <p className="text-sm text-red-500">{state.errors.dni}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <div className="col-span-3">
              <Input id="email" name="email" type="email" defaultValue={student?.email} required />
              {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sex" className="text-right">Sexo</Label>
            <div className="col-span-3">
              <Select name="sex" defaultValue={student?.sex || "M"}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                  <SelectItem value="X">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Teléfono</Label>
            <Input id="phone" name="phone" className="col-span-3" defaultValue={student?.phone || ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Estado</Label>
            <div className="col-span-3">
              <Select name="status" defaultValue={student?.status || UserStatus.ACTIVE}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserStatus.ACTIVE}>Activo</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE}>Inactivo</SelectItem>
                  <SelectItem value={UserStatus.PENDING}>Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {state.message && state.message !== null && (
            <div className="text-sm text-red-500">{state.message}</div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
