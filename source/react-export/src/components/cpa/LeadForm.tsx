import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { submitLead, leadSchema } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";

const field =
  "w-full min-h-[52px] rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function LeadForm({ wantsGuide, onWantsGuide }: { wantsGuide: boolean; onWantsGuide: (v: boolean) => void }) {
  const send = useServerFn(submitLead);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = leadSchema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      firm_name: fd.get("firm_name"),
      clients_to_refer: fd.get("clients_to_refer"),
      message: fd.get("message"),
      wants_guide: wantsGuide,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await send({ data: parsed.data });
      if (res.ok) setStatus("done");
      else {
        setError(res.error);
        setStatus("idle");
      }
    } catch {
      setError("We couldn't send your request. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand" />
        <h3 className="mt-4 text-2xl">Thank you. We'll be in touch.</h3>
        <p className="mt-2 text-muted-foreground">A member of our CPA partnership team will reach out to schedule your conversation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 shadow-card sm:p-10" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">Full name*<input name="full_name" required maxLength={120} className={`${field} mt-2`} /></label>
        <label className="block text-sm font-medium">Work email*<input name="email" type="email" required maxLength={255} className={`${field} mt-2`} /></label>
        <label className="block text-sm font-medium">Phone<input name="phone" type="tel" maxLength={40} className={`${field} mt-2`} /></label>
        <label className="block text-sm font-medium">Firm name*<input name="firm_name" required maxLength={160} className={`${field} mt-2`} /></label>
        <label className="block text-sm font-medium sm:col-span-2">
          How many clients might you refer?
          <select name="clients_to_refer" className={`${field} mt-2`} defaultValue="">
            <option value="">Select an option</option>
            <option>Just one to start</option>
            <option>2–5</option>
            <option>6–15</option>
            <option>16+</option>
          </select>
        </label>
        <label className="block text-sm font-medium sm:col-span-2">
          Tell us what's happening
          <textarea name="message" maxLength={2000} rows={4} className={`${field} mt-2 min-h-[130px] resize-y`} />
        </label>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input type="checkbox" checked={wantsGuide} onChange={(e) => onWantsGuide(e.target.checked)} className="h-4 w-4 accent-primary" />
          Send me the CPA Partnership Guide
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
      <Button type="submit" variant="cta" size="xl" className="mt-6 w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Let's Talk About Your Firm"}
      </Button>
    </form>
  );
}
