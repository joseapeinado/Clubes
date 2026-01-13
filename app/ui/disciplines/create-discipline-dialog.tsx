'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateDisciplineDialogProps {
  createAction: (prevState: any, formData: FormData) => Promise<any>
}

export function CreateDisciplineDialog({ createAction }: CreateDisciplineDialogProps) {
  const [open, setOpen] = useState(false)
  const initialState = { message: '', errors: {} }
  const [state, dispatch, isPending] = useActionState(createAction, initialState)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Nueva Disciplina</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Disciplina</DialogTitle>
          <DialogDescription>
            Agrega una nueva disciplina al club.
          </DialogDescription>
        </DialogHeader>
        <form action={async (formData) => {
          await dispatch(formData)
          if (state.message === 'Discipline Created') {
            setOpen(false)
          }
        }}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Fútbol, Natación..."
                className="col-span-3"
                required
              />
              {state.errors?.name && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.name}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="Descripción opcional"
                className="col-span-3"
              />
              {state.errors?.description && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.description}</p>}
            </div>
          </div>
          {state.message && state.message !== 'Discipline Created' && (
            <p className="text-red-500 text-sm mb-4">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear Disciplina'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
