-- Medical AI Database Schema for Color Blindness Detection
-- This script creates the core tables for storing patient data, medical images, ERG data, and AI analyses

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients table (references auth.users)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id VARCHAR(50) UNIQUE NOT NULL, -- Hospital/clinic patient ID
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  medical_record_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fundus images table
CREATE TABLE IF NOT EXISTS public.fundus_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, -- Blob storage URL
  image_filename TEXT NOT NULL,
  image_size_bytes INTEGER,
  eye_side VARCHAR(10) CHECK (eye_side IN ('left', 'right', 'both')),
  capture_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_quality_score DECIMAL(3,2), -- 0.00 to 1.00
  preprocessing_status VARCHAR(20) DEFAULT 'pending' CHECK (preprocessing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ERG (Electroretinography) data table
CREATE TABLE IF NOT EXISTS public.erg_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  eye_side VARCHAR(10) CHECK (eye_side IN ('left', 'right', 'both')),
  
  -- ERG measurements (numeric data for MLP processing)
  a_wave_amplitude DECIMAL(8,3), -- microvolts
  a_wave_latency DECIMAL(8,3), -- milliseconds
  b_wave_amplitude DECIMAL(8,3), -- microvolts
  b_wave_latency DECIMAL(8,3), -- milliseconds
  
  -- Photopic responses (cone function)
  photopic_amplitude DECIMAL(8,3),
  photopic_latency DECIMAL(8,3),
  
  -- Scotopic responses (rod function)
  scotopic_amplitude DECIMAL(8,3),
  scotopic_latency DECIMAL(8,3),
  
  -- Flicker responses
  flicker_30hz_amplitude DECIMAL(8,3),
  flicker_30hz_latency DECIMAL(8,3),
  
  -- Color-specific responses
  red_response DECIMAL(8,3),
  green_response DECIMAL(8,3),
  blue_response DECIMAL(8,3),
  
  -- Additional metadata
  test_conditions JSONB, -- Store test parameters as JSON
  raw_data_url TEXT, -- Link to raw ERG file if needed
  data_quality_score DECIMAL(3,2), -- 0.00 to 1.00
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analyses table (stores multimodal AI results)
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  fundus_image_id UUID REFERENCES public.fundus_images(id) ON DELETE SET NULL,
  erg_data_id UUID REFERENCES public.erg_data(id) ON DELETE SET NULL,
  
  -- Analysis metadata
  analysis_type VARCHAR(50) NOT NULL, -- 'fundus_only', 'erg_only', 'multimodal'
  model_version VARCHAR(50) NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- AI predictions
  color_blindness_detected BOOLEAN,
  color_blindness_type VARCHAR(50), -- 'protanopia', 'deuteranopia', 'tritanopia', 'protanomaly', 'deuteranomaly', 'tritanomaly'
  confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
  severity_level VARCHAR(20), -- 'mild', 'moderate', 'severe'
  
  -- Individual model results
  cnn_prediction JSONB, -- Fundus image CNN results
  mlp_prediction JSONB, -- ERG data MLP results
  fusion_prediction JSONB, -- Combined multimodal results
  
  -- Clinical recommendations
  clinical_notes TEXT,
  recommended_followup TEXT,
  additional_tests_suggested TEXT[],
  
  -- Quality metrics
  analysis_quality_score DECIMAL(3,2),
  processing_time_seconds INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical sessions table (for tracking analysis sessions)
CREATE TABLE IF NOT EXISTS public.medical_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_name VARCHAR(200) NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clinician_notes TEXT,
  session_status VARCHAR(20) DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'cancelled')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundus_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erg_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients table
CREATE POLICY "patients_select_own" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "patients_insert_own" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "patients_update_own" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "patients_delete_own" ON public.patients FOR DELETE USING (auth.uid() = id);

-- RLS Policies for fundus_images table
CREATE POLICY "fundus_images_select_own" ON public.fundus_images FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "fundus_images_insert_own" ON public.fundus_images FOR INSERT WITH CHECK (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "fundus_images_update_own" ON public.fundus_images FOR UPDATE USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "fundus_images_delete_own" ON public.fundus_images FOR DELETE USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);

-- RLS Policies for erg_data table
CREATE POLICY "erg_data_select_own" ON public.erg_data FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "erg_data_insert_own" ON public.erg_data FOR INSERT WITH CHECK (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "erg_data_update_own" ON public.erg_data FOR UPDATE USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "erg_data_delete_own" ON public.erg_data FOR DELETE USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);

-- RLS Policies for ai_analyses table
CREATE POLICY "ai_analyses_select_own" ON public.ai_analyses FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "ai_analyses_insert_own" ON public.ai_analyses FOR INSERT WITH CHECK (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "ai_analyses_update_own" ON public.ai_analyses FOR UPDATE USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "ai_analyses_delete_own" ON public.ai_analyses FOR DELETE USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);

-- RLS Policies for medical_sessions table
CREATE POLICY "medical_sessions_select_own" ON public.medical_sessions FOR SELECT USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "medical_sessions_insert_own" ON public.medical_sessions FOR INSERT WITH CHECK (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "medical_sessions_update_own" ON public.medical_sessions FOR UPDATE USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);
CREATE POLICY "medical_sessions_delete_own" ON public.medical_sessions FOR DELETE USING (
  patient_id IN (SELECT id FROM public.patients WHERE auth.uid() = id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_fundus_images_patient_id ON public.fundus_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_fundus_images_capture_date ON public.fundus_images(capture_date);
CREATE INDEX IF NOT EXISTS idx_erg_data_patient_id ON public.erg_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_erg_data_test_date ON public.erg_data(test_date);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_patient_id ON public.ai_analyses(patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_analysis_date ON public.ai_analyses(analysis_date);
CREATE INDEX IF NOT EXISTS idx_medical_sessions_patient_id ON public.medical_sessions(patient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fundus_images_updated_at BEFORE UPDATE ON public.fundus_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_erg_data_updated_at BEFORE UPDATE ON public.erg_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_analyses_updated_at BEFORE UPDATE ON public.ai_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_sessions_updated_at BEFORE UPDATE ON public.medical_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
