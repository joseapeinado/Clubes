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
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { createCategory } from "@/app/lib/discipline-actions"
import { useState, useEffect } from "react"

export function CreateCategoryDialog({ disciplineId }: { disciplineId: string }) {
  const [open, setOpen] = useState(false)
  const [state, dispatch, isPending] = useActionState(createCategory, { message: '', errors: {} })

  useEffect(() => {
    if (state.message === 'Category Created') {
      setOpen(false)
    }
  }, [state.message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Nueva Categoría</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Categoría</DialogTitle>
          <DialogDescription>
            Ejemplo: Sub-14, Primera, Reserva.
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch}>
          <input type="hidden" name="disciplineId" value={disciplineId} />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
            {state.errors?.name && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.name}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea id="description" name="description" className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthlyFee" className="text-right">
                Cuota Mensual
              </Label>
              <Input
                id="monthlyFee"
                name="monthlyFee"
                type="number"
                step="0.01"
                defaultValue="5000"
                className="col-span-3"
                required
              />
            </div>
            {state.errors?.monthlyFee && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.monthlyFee}</p>}
          </div>
          {state.message && state.message !== 'Category Created' && (
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
