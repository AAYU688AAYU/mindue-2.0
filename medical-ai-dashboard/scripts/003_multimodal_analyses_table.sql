-- Create multimodal_analyses table for storing AI analysis results
CREATE TABLE IF NOT EXISTS multimodal_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fundus_image_id UUID REFERENCES fundus_images(id) ON DELETE CASCADE,
    erg_data_id UUID REFERENCES erg_data(id) ON DELETE CASCADE,
    
    -- Analysis status and timing
    analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- AI model results
    fundus_confidence DECIMAL(3,2), -- CNN confidence score (0.00-1.00)
    erg_confidence DECIMAL(3,2),    -- MLP confidence score (0.00-1.00)
    combined_confidence DECIMAL(3,2), -- Fused confidence score (0.00-1.00)
    
    -- Diagnosis results
    color_blindness_type TEXT, -- Normal, Protanopia, Deuteranopia, etc.
    severity_level TEXT,       -- None, Mild, Moderate, Severe
    
    -- Detailed analysis data (JSON)
    analysis_details JSONB,
    
    -- Metadata
    model_version TEXT DEFAULT 'v1.0.0',
    processing_time_ms INTEGER,
    
    CONSTRAINT valid_confidences CHECK (
        (fundus_confidence IS NULL OR (fundus_confidence >= 0 AND fundus_confidence <= 1)) AND
        (erg_confidence IS NULL OR (erg_confidence >= 0 AND erg_confidence <= 1)) AND
        (combined_confidence IS NULL OR (combined_confidence >= 0 AND combined_confidence <= 1))
    )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_multimodal_analyses_user_id ON multimodal_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_multimodal_analyses_status ON multimodal_analyses(analysis_status);
CREATE INDEX IF NOT EXISTS idx_multimodal_analyses_created_at ON multimodal_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_multimodal_analyses_fundus_id ON multimodal_analyses(fundus_image_id);
CREATE INDEX IF NOT EXISTS idx_multimodal_analyses_erg_id ON multimodal_analyses(erg_data_id);

-- Enable Row Level Security
ALTER TABLE multimodal_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own analyses" ON multimodal_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" ON multimodal_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" ON multimodal_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" ON multimodal_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to automatically set user_id
CREATE OR REPLACE FUNCTION set_multimodal_analysis_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_multimodal_analysis_user_id_trigger
    BEFORE INSERT ON multimodal_analyses
    FOR EACH ROW
    EXECUTE FUNCTION set_multimodal_analysis_user_id();

-- Grant necessary permissions
GRANT ALL ON multimodal_analyses TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
