"use client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, X } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div key={t.id} className={cn(
          "flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-fade-in",
          t.variant === "destructive"
            ? "bg-destructive text-destructive-foreground border-destructive"
            : "bg-card text-card-foreground border-border"
        )}>
          {t.variant === "destructive"
            ? <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            : <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
