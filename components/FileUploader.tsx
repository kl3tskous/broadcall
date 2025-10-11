'use client'

import { useState } from 'react'

interface FileUploaderProps {
  onUploadComplete: (url: string) => void
  accept?: string
  maxSizeMB?: number
  buttonText?: string
  buttonClassName?: string
}

export function FileUploader({
  onUploadComplete,
  accept = 'image/*',
  maxSizeMB = 10,
  buttonText = 'Upload File',
  buttonClassName = 'btn-primary'
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploadRes = await fetch('/api/upload', { method: 'POST' })
      const { uploadURL } = await uploadRes.json()

      const putRes = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!putRes.ok) {
        throw new Error('Upload failed')
      }

      // Extract just the object path from the signed URL
      const url = new URL(uploadURL)
      const pathname = decodeURIComponent(url.pathname)
      const parts = pathname.split('/').filter(p => p)
      const objectPath = parts.slice(1).join('/')
      const normalizedURL = `/api/objects/${objectPath}`
      
      onUploadComplete(normalizedURL)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        accept={accept}
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      <label htmlFor="file-upload" className={`cursor-pointer ${buttonClassName} inline-block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {uploading ? 'Uploading...' : buttonText}
      </label>
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}
