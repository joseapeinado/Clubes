
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { fetchStudentPayments } from "@/app/lib/payment-actions"
import { User, PaymentStatus } from "@prisma/client"
import { DollarSign, Loader2, FileText, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { UploadReceiptDialog } from "@/app/ui/payments/upload-receipt-dialog"

export function StudentPaymentsDialog({ student }: { student: User }) {
  const [open, setOpen] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  async function loadData() {
    setLoading(true)
    try {
      const data = await fetchStudentPayments(student.id)
      setPayments(data)
    } finally {
      setLoading(false)
    }
  }

  // Reload when dialog opens or after an upload theoretically? 
  // For now simple load on open.

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <DollarSign className="mr-2 h-4 w-4" /> Pagos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Historial de Pagos - {student.name}</DialogTitle>
          <DialogDescription>
            Historial de cuotas y comprobantes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No hay pagos registrados.</p>
          ) : (
            <div className="border rounded-md">
              <div className="grid grid-cols-5 gap-4 p-3 bg-muted/50 font-medium text-sm">
                <div>Periodo</div>
                <div>Vencimiento</div>
                <div>Monto</div>
                <div>Estado</div>
                <div className="text-right">Comprobante</div>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {payments.map(p => (
                  <div key={p.id} className="grid grid-cols-5 gap-4 p-3 text-sm items-center">
                    <div>{new Date(p.period).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</div>
                    <div className="text-muted-foreground">{new Date(p.dueDate).toLocaleDateString()}</div>
                    <div className="font-semibold">${p.amount}</div>
                    <div>
                      <Badge variant={p.status === 'PAID' ? 'default' : p.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                        {p.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      {p.status === 'PAID' && p.receiptUrl ? (
                        <Button size="sm" variant="ghost" asChild className="h-8">
                          <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" /> Ver
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
