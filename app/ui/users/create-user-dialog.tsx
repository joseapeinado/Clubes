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
import { Plus } from "lucide-react"
import { useFormState, useFormStatus } from 'react-dom'
import { createUser } from "@/app/lib/user-actions"
import { useState, useEffect } from "react"
import { Role } from "@prisma/client"

export function CreateUserDialog({ role }: { role: "PROFESSOR" | "STUDENT" }) {
  const [open, setOpen] = useState(false)
  const [state, dispatch] = useFormState(createUser, { message: null, errors: {} })

  useEffect(() => {
    if (state.message === 'User Created') {
      setOpen(false)
    }
  }, [state.message])

  const title = role === 'PROFESSOR' ? 'Profesor' : 'Alumno'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Nuevo {title}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear {title}</DialogTitle>
          <DialogDescription>
            Crear un nuevo usuario con rol {role}.
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch}>
          <input type="hidden" name="role" value={role} />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            {state.errors?.name && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.name}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" className="col-span-3" required />
            </div>
            {state.errors?.email && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.email}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input id="password" name="password" type="password" className="col-span-3" required minLength={6} />
            </div>
            {state.errors?.password && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.password}</p>}
          </div>

          {state.message && state.message !== 'User Created' && (
            <p className="text-red-500 text-sm mb-4">{state.message}</p>
          )}
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  )
}
