CREATE TABLE public.cpa_partner_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  firm_name text NOT NULL,
  clients_to_refer text,
  message text,
  wants_guide boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.cpa_partner_leads TO anon, authenticated;
GRANT ALL ON public.cpa_partner_leads TO service_role;
ALTER TABLE public.cpa_partner_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.cpa_partner_leads FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(full_name) BETWEEN 1 AND 120 AND char_length(email) BETWEEN 3 AND 255 AND char_length(firm_name) BETWEEN 1 AND 160
  AND (message IS NULL OR char_length(message) <= 2000) AND (phone IS NULL OR char_length(phone) <= 40)
  AND (clients_to_refer IS NULL OR char_length(clients_to_refer) <= 40)
);