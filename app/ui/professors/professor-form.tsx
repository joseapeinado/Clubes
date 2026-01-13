'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil } from "lucide-react"
import { useActionState, useEffect, useState } from "react"
import { createProfessor, updateProfessor, ProfessorState } from "@/app/dashboard/professors/actions"
import { UserStatus, User } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ProfessorForm({ professor }: { professor?: User }) {
  const [open, setOpen] = useState(false)
  const initialState: ProfessorState = { message: '', errors: {} }
  const [state, dispatch, isPending] = useActionState(
    professor ? updateProfessor.bind(null, professor.id) : createProfessor,
    initialState
  )

  useEffect(() => {
    if (state.message === 'Professor Created' || state.message === 'Professor Updated') {
      setOpen(false)
    }
  }, [state.message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {professor ? (
          <Button variant="ghost" size="sm">Editar</Button>
        ) : (
          <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Profesor</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{professor ? 'Editar Profesor' : 'Crear Profesor'}</DialogTitle>
          <DialogDescription>
            {professor ? 'Modifica los datos del profesor.' : 'Crea un nuevo profesor para tu club.'}
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <div className="col-span-3">
                <Input id="name" name="name" defaultValue={professor?.name} required />
                {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <div className="col-span-3">
                <Input id="email" name="email" type="email" defaultValue={professor?.email} required />
                {state.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Contraseña</Label>
              <div className="col-span-3">
                <Input id="password" name="password" type="password" placeholder={professor ? "Dejar en blanco para no cambiar" : ""} required={!professor} minLength={6} />
                {state.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Estado</Label>
              <div className="col-span-3">
                <Select name="status" defaultValue={professor?.status || UserStatus.ACTIVE}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserStatus.ACTIVE}>Activo</SelectItem>
                    <SelectItem value={UserStatus.INACTIVE}>Inactivo</SelectItem>
                    <SelectItem value={UserStatus.PENDING}>Pendiente</SelectItem>
                  </SelectContent>
                </Select>
                {state.errors?.status && <p className="text-red-500 text-xs mt-1">{state.errors.status}</p>}
              </div>
            </div>
          </div>

          {state.message && !state.message.includes('Created') && !state.message.includes('Updated') && (
            <p className="text-red-500 text-sm mb-4">{state.message}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
