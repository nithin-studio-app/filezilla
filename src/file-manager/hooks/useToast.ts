import { useState } from "react";

export interface Toast {
  text: string;
  severity: "info" | "error";
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  function showToast(text: string, severity: "info" | "error" = "info") {
    setToast({ text, severity });
  }

  function closeToast() {
    setToast(null);
  }

  return { toast, showToast, closeToast };
}
