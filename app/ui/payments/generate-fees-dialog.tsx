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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, AlertTriangle, Info } from "lucide-react"
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { generateMonthlyFees } from "@/app/lib/payment-actions"
import { useState, useEffect } from "react"

interface Discipline {
  id: string
  name: string
  categories: Array<{
    id: string
    name: string
    monthlyFee: number | null
    _count: { enrollments: number }
  }>
}

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

export function GenerateFeesDialog({ disciplines }: { disciplines: Discipline[] }) {
  const [open, setOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('ALL')

  // Period selection
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState<string>((currentDate.getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState<string>(currentDate.getFullYear().toString())
  const [dueDay, setDueDay] = useState<string>('10')

  const [state, dispatch, isPending] = useActionState(generateMonthlyFees, { message: '' })

  useEffect(() => {
    if (state.message?.startsWith('Generated')) {
      setOpen(false)
      setShowConfirm(false)
    } else if (state.message?.startsWith('CONFIRM_REGENERATE:')) {
      const msg = state.message.replace('CONFIRM_REGENERATE:', '')
      setConfirmMessage(msg)
      setShowConfirm(true)
    }
  }, [state.message])

  const handleConfirmRegenerate = () => {
    const form = document.getElementById('generate-fees-form') as HTMLFormElement
    if (form) {
      const formData = new FormData(form)
      formData.set('forceRegenerate', 'true')
      dispatch(formData)
    }
    setShowConfirm(false)
  }

  // Calculate preview stats
  const getPreviewStats = () => {
    const filteredDisciplines = selectedDisciplineId === 'ALL'
      ? disciplines
      : disciplines.filter(d => d.id === selectedDisciplineId)

    let totalEnrollments = 0
    let totalAmount = 0

    filteredDisciplines.forEach(d => {
      d.categories.forEach(c => {
        const enrollments = c._count.enrollments
        const fee = c.monthlyFee || 5000
        totalEnrollments += enrollments
        totalAmount += enrollments * fee
      })
    })

    return { totalEnrollments, totalAmount, disciplineCount: filteredDisciplines.length }
  }

  const stats = getPreviewStats()

  // Generate years (current year + 2 years forward)
  const years = Array.from({ length: 3 }, (_, i) => {
    const year = currentDate.getFullYear() + i
    return { value: year.toString(), label: year.toString() }
  })

  // Build period date (YYYY-MM-01)
  const periodDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`

  // Build due date (YYYY-MM-DD)
  const dueDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${dueDay.padStart(2, '0')}`

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button><CreditCard className="mr-2 h-4 w-4" /> Generar Cuotas</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Generar Cuotas Mensuales</DialogTitle>
            <DialogDescription>
              Selecciona el periodo y las disciplinas para generar cuotas automáticamente.
            </DialogDescription>
          </DialogHeader>
          <form id="generate-fees-form" action={dispatch}>
            <input type="hidden" name="forceRegenerate" value="false" />
            <input type="hidden" name="disciplineId" value={selectedDisciplineId} />
            <input type="hidden" name="period" value={periodDate} />
            <input type="hidden" name="dueDate" value={dueDate} />

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="disciplineSelect" className="text-right">
                  Disciplina
                </Label>
                <Select value={selectedDisciplineId} onValueChange={setSelectedDisciplineId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">📋 Todas las Disciplinas</SelectItem>
                    {disciplines.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Periodo
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => (
                        <SelectItem key={y.value} value={y.value}>
                          {y.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDay" className="text-right">
                  Vencimiento
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Día</span>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    de {MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </span>
                </div>
              </div>

              {/* Preview Stats */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 text-sm">Vista Previa</p>
                    <div className="mt-2 space-y-1 text-sm text-blue-800">
                      <p>• <strong>{stats.disciplineCount}</strong> disciplina(s) seleccionada(s)</p>
                      <p>• <strong>{stats.totalEnrollments}</strong> cuota(s) a generar</p>
                      <p>• Total estimado: <strong className="text-lg">${stats.totalAmount.toLocaleString()}</strong></p>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Los montos se toman de la configuración de cada categoría
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {state.message && !state.message.startsWith('Generated') && !state.message.startsWith('CONFIRM_REGENERATE:') && (
              <p className="text-red-500 text-sm mb-4">{state.message}</p>
            )}

            <DialogFooter>
              <SubmitButton disabled={stats.totalEnrollments === 0} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              ⚠️ Confirmar Regeneración de Cuotas
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="font-semibold">{confirmMessage}</div>

              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <div className="font-semibold text-amber-900 text-sm mb-2">Consecuencias de regenerar:</div>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Las cuotas existentes serán <strong>eliminadas</strong></li>
                  <li>Los pagos ya registrados se <strong>perderán</strong></li>
                  <li>Los comprobantes adjuntos se <strong>desvinculan</strong></li>
                  <li>Se creará un registro de auditoría con los datos anteriores</li>
                </ul>
              </div>

              <div className="text-xs text-muted-foreground">
                💡 <strong>Recomendación:</strong> Solo regenera si cometiste un error al generar.
                Para pagos individuales, usa "Subir Comprobante" en cada cuota.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRegenerate}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Sí, Regenerar Cuotas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? "Generando..." : "Generar Cuotas"}
    </Button>
  )
}
