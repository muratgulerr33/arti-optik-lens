"use client"

interface EmptyStateProps {
  /** "db-error" → Veritabanına bağlanılamadı; "empty" → özelleştirilebilir mesaj */
  variant: "db-error" | "empty"
  /** variant="empty" iken gösterilecek ana mesaj */
  message?: string
  /** Opsiyonel alt mesaj (örn. "Farklı bir arama terimi deneyin.") */
  subMessage?: string
  className?: string
}

const DB_ERROR_MESSAGE = "Veritabanına bağlanılamadı. Lütfen daha sonra tekrar deneyin."

export function EmptyState({
  variant,
  message,
  subMessage,
  className = "py-12 text-center text-muted-foreground",
}: EmptyStateProps) {
  const main =
    variant === "db-error" ? DB_ERROR_MESSAGE : message ?? "Henüz içerik yok."

  return (
    <div className={className}>
      <p className={variant === "db-error" ? "text-lg mb-0" : "text-base"}>
        {main}
      </p>
      {subMessage && (
        <p className="text-sm mt-2 text-muted-foreground">{subMessage}</p>
      )}
    </div>
  )
}
