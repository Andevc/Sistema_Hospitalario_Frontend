export default function PageHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="h-10 w-10 rounded-md2 bg-brand-soft text-brand flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-inksoft mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
