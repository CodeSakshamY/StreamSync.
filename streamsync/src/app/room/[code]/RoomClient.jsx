'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { WatchRoom } from '@/components/room/WatchRoom'
import { Toast } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export default function RoomClient({ code }) {
  const searchParams         = useSearchParams()
  const router               = useRouter()
  const { toast, showToast } = useToast()

  const rcode  = code.toUpperCase()
  // vid is only meaningful when isHost=true (room creation).
  // Guests don't need it — the server sends the real vid after room:join.
  const vid    = searchParams.get('vid') || ''
  const nick   = searchParams.get('nick') || 'Viewer'
  const isHost = searchParams.get('host') === 'true'

  return (
    <>
      {toast && <Toast msg={toast.msg} kind={toast.kind} />}
      <WatchRoom
        rcode={rcode}
        vid={vid}
        nick={nick}
        isHost={isHost}
        showToast={showToast}
        onLeave={() => router.push('/')}
      />
    </>
  )
}
