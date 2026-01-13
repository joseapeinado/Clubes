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
import { createClub } from "@/app/lib/club-actions"
import { useState, useEffect } from "react"

export function CreateClubDialog() {
  const [open, setOpen] = useState(false)
  const [state, dispatch] = useFormState(createClub, { message: null, errors: {} })

  useEffect(() => {
    if (state.message === 'Club Created') {
      setOpen(false)
      // Reset state? useFormState doesn't easily reset without unmount or key change
    }
  }, [state.message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Club</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Club</DialogTitle>
          <DialogDescription>
            Añade un nuevo club al sistema. El slug debe ser único.
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            {state.errors?.name && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.name}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input id="slug" name="slug" className="col-span-3" required />
            </div>
            {state.errors?.slug && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.slug}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primaryColor" className="text-right">
                Color
              </Label>
              <Input id="primaryColor" name="primaryColor" type="color" className="col-span-3 h-10 w-20 p-1" defaultValue="#000000" />
            </div>
          </div>
          {state.message && state.message !== 'Club Created' && (
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
