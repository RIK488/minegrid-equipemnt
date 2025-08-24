-- =====================================================
-- CRÉATION DES TABLES POUR PIPELINE COMMERCIAL 100% RÉEL
-- =====================================================

-- 1. TABLE DES LEADS (PROSPECTS)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('Prospection', 'Qualification', 'Proposition', 'Négociation', 'Conclu', 'Perdu')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100) DEFAULT 0,
  next_action TEXT,
  assigned_to TEXT DEFAULT 'Vendeur',
  last_contact TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  contact_name TEXT,
  contact_company TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  source TEXT, -- 'message', 'offer', 'manual', 'website'
  source_id UUID, -- ID du message ou de l'offre d'origine
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE DES ACTIONS DU PIPELINE
CREATE TABLE IF NOT EXISTS pipeline_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('call', 'email', 'meeting', 'follow-up', 'quote', 'proposal', 'visit')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- en minutes
  actual_duration INTEGER, -- en minutes
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  ai_recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES ÉTAPES DU PIPELINE
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  transition_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE DES ANALYSES ET INSIGHTS
CREATE TABLE IF NOT EXISTS pipeline_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('performance', 'conversion', 'optimization', 'trend')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB, -- Données détaillées de l'insight
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  action_required BOOLEAN DEFAULT false,
  action_description TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLE DES RAPPORTS
CREATE TABLE IF NOT EXISTS pipeline_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  title TEXT NOT NULL,
  data JSONB NOT NULL, -- Données du rapport
  filters JSONB, -- Filtres appliqués
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index pour les leads
CREATE INDEX IF NOT EXISTS idx_leads_seller_id ON leads(seller_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_last_contact ON leads(last_contact);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source, source_id);

-- Index pour les actions
CREATE INDEX IF NOT EXISTS idx_pipeline_actions_seller_id ON pipeline_actions(seller_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_actions_lead_id ON pipeline_actions(lead_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_actions_status ON pipeline_actions(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_actions_due_date ON pipeline_actions(due_date);
CREATE INDEX IF NOT EXISTS idx_pipeline_actions_priority ON pipeline_actions(priority);

-- Index pour les étapes
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_seller_id ON pipeline_stages(seller_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_lead_id ON pipeline_stages(lead_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_transition_date ON pipeline_stages(transition_date);

-- Index pour les insights
CREATE INDEX IF NOT EXISTS idx_pipeline_insights_seller_id ON pipeline_insights(seller_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_insights_type ON pipeline_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_insights_created_at ON pipeline_insights(created_at);

-- Index pour les rapports
CREATE INDEX IF NOT EXISTS idx_pipeline_reports_seller_id ON pipeline_reports(seller_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_reports_type ON pipeline_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_reports_generated_at ON pipeline_reports(generated_at);

-- =====================================================
-- FONCTIONS POUR AUTOMATISER LES MISE À JOUR
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipeline_actions_updated_at BEFORE UPDATE ON pipeline_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_reports ENABLE ROW LEVEL SECURITY;

-- Politiques pour leads
CREATE POLICY "Users can view their own leads" ON leads FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own leads" ON leads FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own leads" ON leads FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own leads" ON leads FOR DELETE USING (auth.uid() = seller_id);

-- Politiques pour pipeline_actions
CREATE POLICY "Users can view their own pipeline actions" ON pipeline_actions FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own pipeline actions" ON pipeline_actions FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own pipeline actions" ON pipeline_actions FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own pipeline actions" ON pipeline_actions FOR DELETE USING (auth.uid() = seller_id);

-- Politiques pour pipeline_stages
CREATE POLICY "Users can view their own pipeline stages" ON pipeline_stages FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own pipeline stages" ON pipeline_stages FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Politiques pour pipeline_insights
CREATE POLICY "Users can view their own pipeline insights" ON pipeline_insights FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own pipeline insights" ON pipeline_insights FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own pipeline insights" ON pipeline_insights FOR UPDATE USING (auth.uid() = seller_id);

-- Politiques pour pipeline_reports
CREATE POLICY "Users can view their own pipeline reports" ON pipeline_reports FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own pipeline reports" ON pipeline_reports FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- =====================================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- =====================================================

COMMENT ON TABLE leads IS 'Table des prospects/leads du pipeline commercial';
COMMENT ON TABLE pipeline_actions IS 'Table des actions à effectuer sur les leads';
COMMENT ON TABLE pipeline_stages IS 'Historique des transitions d''étapes des leads';
COMMENT ON TABLE pipeline_insights IS 'Insights et recommandations IA pour le pipeline';
COMMENT ON TABLE pipeline_reports IS 'Rapports générés pour le pipeline commercial';

COMMENT ON COLUMN leads.source IS 'Source du lead: message, offer, manual, website';
COMMENT ON COLUMN leads.source_id IS 'ID de la source (message_id, offer_id, etc.)';
COMMENT ON COLUMN pipeline_actions.action_type IS 'Type d''action: call, email, meeting, follow-up, quote, proposal, visit';
COMMENT ON COLUMN pipeline_insights.insight_type IS 'Type d''insight: performance, conversion, optimization, trend'; 