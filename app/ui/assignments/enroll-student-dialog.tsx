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
import { useFormState, useFormStatus } from 'react-dom'
import { enrollStudent } from "@/app/lib/assignment-actions"
import { useState, useEffect } from "react"

// Types
type Student = { id: string; name: string; email: string; dni?: string | null }

export function EnrollStudentDialog({
  categoryId,
  disciplineId,
  students
}: {
  categoryId: string
  disciplineId: string
  students: Student[]
}) {
  const [open, setOpen] = useState(false)
  const [state, dispatch] = useFormState(enrollStudent, { message: null })

  useEffect(() => {
    if (state.message === 'Student Enrolled') {
      setOpen(false)
    }
  }, [state.message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Inscribir Alumno</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inscribir Alumno</DialogTitle>
          <DialogDescription>
            Selecciona un alumno para inscribir en esta categoría.
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch}>
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="hidden" name="disciplineId" value={disciplineId} />
          <div className="grid gap-4 py-4">
            <Select name="userId" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar alumno" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.dni ? `DNI: ${s.dni}` : s.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {state.message && state.message !== 'Student Enrolled' && (
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
