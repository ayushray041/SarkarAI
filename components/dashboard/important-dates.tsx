"use client"
import { useAnalysis } from "@/lib/analysis-context"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { CalendarClock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"


const toneStyles: Record<string, string> = {
  open: "bg-accent text-accent-foreground",
  upcoming: "bg-secondary text-secondary-foreground",
  critical: "bg-destructive/20 text-destructive",
  tentative: "bg-muted text-muted-foreground",
}

export function ImportantDates() {
  const { language } = useLanguage()
  const t = translations[language]
  const { analysis } = useAnalysis()



 function getDaysRemaining(dateString: string) {
  const target = new Date(Date.parse(dateString))

  if (isNaN(target.getTime())) {
    return null
  }

  const today = new Date()

  target.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diff =
    target.getTime() - today.getTime()

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  )
}


  return (
    <Card className="glass flex h-full flex-col border-0 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
          <CalendarClock className="size-4.5" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-lg font-semibold tracking-tight">
        {t.dates}
        </h2>
      </div>

      <ol className="relative flex-1 space-y-5 pl-5">
  <span
    className="absolute left-[3px] top-1 h-[calc(100%-1rem)] w-px bg-border"
    aria-hidden="true"
  />
  {(!analysis?.importantDates ||
  analysis.importantDates.length === 0) && (
  <div className="flex h-48 flex-col items-center justify-center text-center">
  <CalendarClock className="mb-4 size-10 text-muted-foreground/50" />

  <h3 className="font-medium">
    No important dates detected
  </h3>

  <p className="mt-1 text-sm text-muted-foreground">
    Upload a government document and AI will extract deadlines automatically.
  </p>

  <div className="mt-4 text-xs text-muted-foreground">
    Application Deadlines • Verification Dates • Submission Alerts
  </div>
</div>
)}

  {((analysis?.importantDates || []).map((item) => {
    const daysLeft = getDaysRemaining(item.date);

    // 1. Compute the text color class before rendering
    let textColorClass = "text-green-500";
    if (daysLeft !== null) {
        if (daysLeft <= 7) textColorClass = "text-red-500";
        else if (daysLeft <= 30) textColorClass = "text-yellow-500";
    }

    // 2. Compute the status/warning message text before rendering
    let statusText = "";
    if (daysLeft === null) {
        statusText = "Invalid date";
    } else if (daysLeft < 0) {
        statusText = "❌ Deadline passed";
    } else if (daysLeft === 0) {
        statusText = "🚨 Last day to apply";
    } else if (daysLeft <= 3) {
        statusText = `🔥 Urgent: ${daysLeft} days left`;
    } else if (daysLeft <= 7) {
        statusText = `⚠️ Warning: ${daysLeft} days left`;
    } else {
        statusText = `🗓️ ${daysLeft} days remaining`;
    }

    // 3. Clean and straightforward Return block
    return (
        <li key={item.label} className="relative">
            <span className="absolute -left-5 top-1.5 size-2 rounded-full bg-primary ring-4 ring-primary/15" aria-hidden="true" />
            
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.label}</p>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", toneStyles[item.tone])}>
                    {item.status}
                </span>
            </div>

            <p className="mt-0.5 text-sm text-muted-foreground">
                {item.date}
            </p>

            {/* Cleaned up paragraph using the pre-computed strings */}
            <p className={`mt-1 text-xs ${textColorClass}`}>
                {statusText}
            </p>
        </li>
    );
}))}
</ol>
    </Card>
  )
}
