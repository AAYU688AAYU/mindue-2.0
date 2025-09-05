-- Core Medical AI Database Schema - Simplified Version
-- Run this first to create essential tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients table (references auth.users)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id VARCHAR(50) UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fundus images table
CREATE TABLE IF NOT EXISTS public.fundus_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_filename TEXT NOT NULL,
  eye_side VARCHAR(10) CHECK (eye_side IN ('left', 'right', 'both')),
  image_quality_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ERG data table
CREATE TABLE IF NOT EXISTS public.erg_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  eye_side VARCHAR(10) CHECK (eye_side IN ('left', 'right', 'both')),
  a_wave_amplitude DECIMAL(8,3),
  b_wave_amplitude DECIMAL(8,3),
  data_quality_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
