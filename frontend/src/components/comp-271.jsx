import React from "react";
import { CircleCheckIcon } from "lucide-react";

export default function PaymentSuccessAlert({ message = "Payment completed successfully!" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xl px-4 py-3 flex items-center gap-3"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
        <CircleCheckIcon className="text-emerald-600 dark:text-emerald-400 h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold">{message}</span>
    </div>
  );
}
