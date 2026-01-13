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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useFormStatus } from 'react-dom'
import { assignProfessor, State } from "@/app/lib/assignment-actions"
import { useState, useEffect, useActionState } from "react"

type Professor = { id: string; name: string; email: string }

export function AssignProfessorDialog({
  categoryId,
  disciplineId,
  professors
}: {
  categoryId: string
  disciplineId: string
  professors: Professor[]
}) {
  const [open, setOpen] = useState(false)
  const initialState: State = { message: null }
  const [state, dispatch, isPending] = useActionState(assignProfessor, initialState)

  useEffect(() => {
    if (state.message === 'Professor Assigned') {
      setOpen(false)
    }
  }, [state.message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" /> Asignar Profesor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar Profesor</DialogTitle>
          <DialogDescription>
            Selecciona un profesor para asignar a esta categoría.
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch}>
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="hidden" name="disciplineId" value={disciplineId} />
          <div className="grid gap-4 py-4">
            <Select name="userId" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar profesor" />
              </SelectTrigger>
              <SelectContent>
                {professors.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {state.message && state.message !== 'Professor Assigned' && (
            <p className="text-red-500 text-sm mb-4">{state.message}</p>
          )}
          <DialogFooter>
            <SubmitButton isPending={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || isPending}>
      {(pending || isPending) ? "Guardando..." : "Guardar"}
    </Button>
  )
}
