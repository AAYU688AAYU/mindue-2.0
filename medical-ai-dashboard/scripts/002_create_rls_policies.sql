-- Row Level Security Policies
-- Run this after script 001

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundus_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erg_data ENABLE ROW LEVEL SECURITY;

-- Patients policies
CREATE POLICY "patients_all_own" ON public.patients FOR ALL USING (auth.uid() = id);

-- Fundus images policies  
CREATE POLICY "fundus_images_all_own" ON public.fundus_images FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);

-- ERG data policies
CREATE POLICY "erg_data_all_own" ON public.erg_data FOR ALL USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
