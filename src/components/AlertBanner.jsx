import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const TONOS = {
  error: { cls: 'bg-triaje-rojoSoft text-triaje-rojo border-triaje-rojo/20', icon: AlertTriangle },
  ok: { cls: 'bg-triaje-verdeSoft text-triaje-verde border-triaje-verde/20', icon: CheckCircle2 },
  info: { cls: 'bg-brand-soft text-brand-deep border-brand/20', icon: Info },
}

export default function AlertBanner({ tone = 'info', children, onClose }) {
  if (!children) return null
  const { cls, icon: Icon } = TONOS[tone]
  return (
    <div className={`rounded-md2 border px-4 py-2.5 text-sm flex items-start gap-2.5 ${cls}`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <span className="flex-1">{children}</span>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 shrink-0" aria-label="Cerrar">
          <X size={15} />
        </button>
      )}
    </div>
  )
}
