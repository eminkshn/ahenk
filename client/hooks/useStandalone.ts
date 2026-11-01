'use client'

import { useEffect, useState } from 'react'

// Uygulama Ana Ekrana eklenmiş (PWA standalone) olarak mı çalışıyor?
// Sesli arama PWA'da kapatıldığı için bu bilgiyle ses UI'ı gizlenir.
export function useIsStandalone() {
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    const check = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    setStandalone(check())
    const mq = window.matchMedia('(display-mode: standalone)')
    const onChange = () => setStandalone(check())
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return standalone
}
