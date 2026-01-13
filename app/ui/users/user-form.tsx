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
import { adminCreateUser, adminUpdateUser, UserAdminState } from "@/app/dashboard/users/actions"
import { UserStatus, Role, User, Club } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UserForm({ user, clubs }: { user?: User, clubs: Club[] }) {
  const [open, setOpen] = useState(false)
  const initialState: UserAdminState = { message: '', errors: {} }
  const [state, dispatch, isPending] = useActionState(
    user ? adminUpdateUser.bind(null, user.id) : adminCreateUser,
    initialState
  )

  useEffect(() => {
    if (state.message === 'User Created' || state.message === 'User Updated') {
      setOpen(false)
    }
  }, [state.message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {user ? (
          <Button variant="ghost" size="sm">Editar</Button>
        ) : (
          <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Usuario</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
          <DialogDescription>
            {user ? 'Modifica los datos globales del usuario.' : 'Crea un nuevo usuario en la plataforma.'}
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <div className="col-span-3">
                <Input id="name" name="name" defaultValue={user?.name} required />
                {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <div className="col-span-3">
                <Input id="email" name="email" type="email" defaultValue={user?.email} required />
                {state.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Contraseña</Label>
              <div className="col-span-3">
                <Input id="password" name="password" type="password" placeholder={user ? "Dejar en blanco para no cambiar" : ""} required={!user} minLength={6} />
                {state.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Rol</Label>
              <div className="col-span-3">
                <Select name="role" defaultValue={user?.role || Role.CLUB_ADMIN}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.SUPER_ADMIN}>Súper Admin</SelectItem>
                    <SelectItem value={Role.CLUB_ADMIN}>Admin de Club</SelectItem>
                    <SelectItem value={Role.PROFESSOR}>Profesor</SelectItem>
                    <SelectItem value={Role.STUDENT}>Alumno</SelectItem>
                  </SelectContent>
                </Select>
                {state.errors?.role && <p className="text-red-500 text-xs mt-1">{state.errors.role}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clubId" className="text-right">Club</Label>
              <div className="col-span-3">
                <Select name="clubId" defaultValue={user?.clubId || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin Club (Súper Admin)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin Club / General</SelectItem>
                    {clubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.errors?.clubId && <p className="text-red-500 text-xs mt-1">{state.errors.clubId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Estado</Label>
              <div className="col-span-3">
                <Select name="status" defaultValue={user?.status || UserStatus.ACTIVE}>
                  <SelectTrigger>
                    <SelectValue />
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
