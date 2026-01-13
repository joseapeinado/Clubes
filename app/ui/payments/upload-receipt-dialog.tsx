'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { registerPayment } from '@/app/lib/payment-actions'
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
import { Upload } from 'lucide-react'
import { UploadReceiptButton } from './upload-receipt-button'

export function UploadReceiptDialog({ paymentId }: { paymentId: string }) {
  const [open, setOpen] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState('')
  const initialState = { message: '', errors: {} }
  const [state, dispatch, isPending] = useActionState(registerPayment, initialState)

  const handleSubmit = async (formData: FormData) => {
    formData.set('receiptUrl', receiptUrl)
    await dispatch(formData)
  }

  useEffect(() => {
    if (state.message === 'Payment Registered') {
      setOpen(false)
      setReceiptUrl('')
    }
  }, [state.message])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Subir Comprobante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Sube el comprobante de pago para validar la cuota.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <input type="hidden" name="paymentId" value={paymentId} />
          <div className="grid gap-4 py-4">
            <UploadReceiptButton
              onUploadComplete={setReceiptUrl}
              currentUrl={receiptUrl}
            />
          </div>
          {state.message && !state.message.startsWith('Payment') && (
            <p className="text-sm text-red-500 mb-4">{state.message}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending || !receiptUrl}>
              {isPending ? 'Guardando...' : 'Registrar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
