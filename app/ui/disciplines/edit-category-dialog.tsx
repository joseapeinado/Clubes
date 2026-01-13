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
import { Pencil } from 'lucide-react'

interface EditCategoryDialogProps {
  category: {
    id: string
    name: string
    description: string | null
    monthlyFee?: number | null
  }
  updateAction: (prevState: any, formData: FormData) => Promise<any>
}

export function EditCategoryDialog({ category, updateAction }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const initialState = { message: '', errors: {} }
  const [state, dispatch, isPending] = useActionState(updateAction, initialState)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Modifica los datos de la categoría.
          </DialogDescription>
        </DialogHeader>
        <form action={async (formData) => {
          await dispatch(formData)
          if (state.message === 'Category Updated') {
            setOpen(false)
          }
        }}>
          <input type="hidden" name="categoryId" value={category.id} />
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={category.name}
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
                defaultValue={category.description || ''}
                className="col-span-3"
              />
              {state.errors?.description && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.description}</p>}
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
                defaultValue={category.monthlyFee || 5000}
                className="col-span-3"
                required
              />
              {state.errors?.monthlyFee && <p className="text-red-500 text-xs ml-auto col-span-3">{state.errors.monthlyFee}</p>}
            </div>
          </div>
          {state.message && state.message !== 'Category Updated' && (
            <p className="text-red-500 text-sm mb-4">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
