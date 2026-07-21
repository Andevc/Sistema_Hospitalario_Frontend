export default function LoadingSpinner({ label = 'Cargando…' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-inksoft py-8 justify-center">
      <span className="h-3.5 w-3.5 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
      {label}
    </div>
  )
}
