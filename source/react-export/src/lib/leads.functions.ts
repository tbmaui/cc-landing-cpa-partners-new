import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const leadSchema = z.object({
  full_name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  firm_name: z.string().trim().min(1, "Please enter your firm name").max(160),
  clients_to_refer: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  wants_guide: z.boolean().default(false),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { error } = await supabase.from("cpa_partner_leads").insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      firm_name: data.firm_name,
      clients_to_refer: data.clients_to_refer || null,
      message: data.message || null,
      wants_guide: data.wants_guide,
    });
    if (error) {
      console.error("Lead insert failed", error);
      return { ok: false as const, error: "We couldn't send your request. Please try again." };
    }
    return { ok: true as const };
  });
