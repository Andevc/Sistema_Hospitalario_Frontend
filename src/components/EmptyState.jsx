import { Inbox } from 'lucide-react'

export default function EmptyState({ label = 'Sin registros todavía.', hint, icon: Icon = Inbox }) {
  return (
    <div className="siih-card flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="h-11 w-11 rounded-full bg-brand-soft text-brand flex items-center justify-center mb-1">
        <Icon size={20} />
      </div>
      <p className="font-display text-lg text-ink">{label}</p>
      {hint && <p className="text-sm text-inksoft max-w-sm">{hint}</p>}
    </div>
  )
}
