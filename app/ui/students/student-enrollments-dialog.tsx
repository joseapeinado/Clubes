
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { fetchStudentEnrollments, fetchAvailableClasses, enrollStudent, removeEnrollment } from "@/app/lib/assignment-actions"
import { User } from "@prisma/client"
import { BookOpen, Plus, Trash2, Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useActionState } from "react"

export function StudentEnrollmentsDialog({ student }: { student: User }) {
  const [open, setOpen] = useState(false)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Enrollment Form State
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("")
  const [isEnrolling, setIsEnrolling] = useState(false)

  // Fetch data when opening
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  async function loadData() {
    setLoading(true)
    try {
      const [enr, classes] = await Promise.all([
        fetchStudentEnrollments(student.id),
        fetchAvailableClasses()
      ])
      setEnrollments(enr)
      setAvailableClasses(classes)
    } finally {
      setLoading(false)
    }
  }

  async function handleUnenroll(id: string) {
    if (!confirm("¿Estás seguro de dar de baja esta inscripción?")) return;
    await removeEnrollment(id)
    loadData() // Refresh list
  }

  // Handle Enrollment Submission
  const [enrollState, enrollDispatch, isEnrollPending] = useActionState(enrollStudent, { message: '' })

  // When enrollState changes indicating success, refresh list
  useEffect(() => {
    if (enrollState.message === 'Student Enrolled') {
      loadData()
      setIsEnrolling(false)
      setSelectedDisciplineId("")
      // Reset form state message somehow? 
      // enrollState is immutable from here, but next dispatch will clear/change it.
    }
  }, [enrollState])

  const selectedDiscipline = availableClasses.find(d => d.id === selectedDisciplineId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <BookOpen className="mr-2 h-4 w-4" /> Inscripciones
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Inscripciones - {student.name}</DialogTitle>
          <DialogDescription>
            Gestiona las disciplinas y categorías del alumno.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Active Enrollments List */}
          <div>
            <h3 className="text-sm font-medium mb-2">Inscripciones Activas</h3>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No tiene inscripciones activas.</p>
            ) : (
              <div className="border rounded-md divide-y">
                {enrollments.map(enr => (
                  <div key={enr.id} className="flex justify-between items-center p-3 text-sm">
                    <div>
                      <span className="font-semibold">{enr.category.discipline.name}</span>
                      <span className="mx-2 text-muted-foreground">/</span>
                      <Badge variant="secondary">{enr.category.name}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleUnenroll(enr.id)} className="text-destructive h-8 w-8 hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Enrollment Section */}
          <div className="bg-slate-50 p-4 rounded-md border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Nueva Inscripción</h3>
            </div>

            <form action={enrollDispatch} className="flex gap-2 items-end">
              <input type="hidden" name="userId" value={student.id} />

              <div className="flex-1 space-y-1">
                <span className="text-xs font-medium">Disciplina</span>
                <Select onValueChange={setSelectedDisciplineId} value={selectedDisciplineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-xs font-medium">Categoría</span>
                <Select name="categoryId" disabled={!selectedDisciplineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDiscipline?.categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" size="default" disabled={!selectedDisciplineId}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            {enrollState.message && enrollState.message !== 'Student Enrolled' && (
              <p className="text-red-500 text-xs mt-2">{enrollState.message}</p>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
