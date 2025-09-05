-- Create audit log table for medical data access
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user consent tracking
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  consent_version VARCHAR(10) NOT NULL,
  consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  UNIQUE(user_id, consent_type)
);

-- Create data retention policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  retention_period_days INTEGER DEFAULT 2555, -- 7 years default for medical data
  auto_delete_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add encryption status to sensitive tables
ALTER TABLE fundus_images ADD COLUMN IF NOT EXISTS encryption_status VARCHAR(20) DEFAULT 'encrypted';
ALTER TABLE erg_data ADD COLUMN IF NOT EXISTS encryption_status VARCHAR(20) DEFAULT 'encrypted';
ALTER TABLE multimodal_analyses ADD COLUMN IF NOT EXISTS encryption_status VARCHAR(20) DEFAULT 'encrypted';

-- Add compliance flags
ALTER TABLE patients ADD COLUMN IF NOT EXISTS hipaa_consent BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS data_sharing_consent BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS research_consent BOOLEAN DEFAULT false;

-- Enable RLS on audit tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit logs (admin access only)
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for user consents
CREATE POLICY "Users can manage their own consents" ON user_consents
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for data retention
CREATE POLICY "Users can manage their own retention policies" ON data_retention_policies
  FOR ALL USING (auth.uid() = user_id);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action VARCHAR(50),
  p_resource_type VARCHAR(50),
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for automatic data cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired fundus images based on retention policy
  DELETE FROM fundus_images 
  WHERE created_at < NOW() - INTERVAL '7 years'
  AND id IN (
    SELECT fi.id FROM fundus_images fi
    JOIN data_retention_policies drp ON drp.user_id = fi.patient_id
    WHERE drp.data_type = 'fundus_images' 
    AND drp.auto_delete_enabled = true
    AND fi.created_at < NOW() - (drp.retention_period_days || ' days')::INTERVAL
  );
  
  -- Delete expired ERG data
  DELETE FROM erg_data 
  WHERE created_at < NOW() - INTERVAL '7 years'
  AND id IN (
    SELECT ed.id FROM erg_data ed
    JOIN data_retention_policies drp ON drp.user_id = ed.patient_id
    WHERE drp.data_type = 'erg_data' 
    AND drp.auto_delete_enabled = true
    AND ed.created_at < NOW() - (drp.retention_period_days || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
