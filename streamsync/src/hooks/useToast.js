'use client'

import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, kind = 'success') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 2800)
  }, [])

  return { toast, showToast }
}
