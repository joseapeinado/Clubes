'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react"
import { useState, useRef } from "react"

interface UploadReceiptButtonProps {
  onUploadComplete: (url: string) => void
  currentUrl?: string
}

export function UploadReceiptButton({ onUploadComplete, currentUrl }: UploadReceiptButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setFileName(file.name)
    setFileType(file.type)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onUploadComplete(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
      setFileName(null)
      setFileType(null)
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setFileName(null)
    setFileType(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onUploadComplete('')
  }

  return (
    <div className="space-y-3">
      <Label>Comprobante de Pago</Label>

      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="receipt-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {preview ? 'Cambiar archivo' : 'Seleccionar archivo'}
            </>
          )}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {fileName && !error && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {fileType?.startsWith('image/') ? (
            <ImageIcon className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span className="truncate">{fileName}</span>
        </div>
      )}

      {preview && fileType?.startsWith('image/') && (
        <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Formatos permitidos: JPEG, PNG, WebP, PDF (máx. 5MB)
      </p>
    </div>
  )
}
