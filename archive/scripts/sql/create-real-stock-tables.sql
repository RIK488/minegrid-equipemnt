-- =====================================================
-- CRÉATION DES TABLES POUR SYSTÈME DE STOCK 100% RÉEL
-- =====================================================

-- 1. TABLE DES PROMOTIONS
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  equipment_ids TEXT[] NOT NULL, -- Array des IDs d'equipements
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'expired')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE DES INSIGHTS DE STOCK
CREATE TABLE IF NOT EXISTS stock_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('performance', 'optimization', 'alert')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  action_required BOOLEAN DEFAULT false,
  action_description TEXT,
  data JSONB, -- Donnees detaillees de l'insight
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES ANALYSES DE PERFORMANCE
CREATE TABLE IF NOT EXISTS equipment_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  contacts_count INTEGER DEFAULT 0,
  visibility_score INTEGER DEFAULT 0,
  days_in_stock INTEGER DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  recommendations JSONB, -- Array des recommandations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE DES ACTIONS DE STOCK
CREATE TABLE IF NOT EXISTS stock_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('boost', 'price_update', 'photo_add', 'description_update', 'promotion_create')),
  action_data JSONB, -- Donnees de l'action
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COLONNES MANQUANTES DANS LES TABLES EXISTANTES
-- =====================================================

-- Ajouter colonne boosted aux machines
ALTER TABLE machines ADD COLUMN IF NOT EXISTS boosted BOOLEAN DEFAULT FALSE;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS boosted_at TIMESTAMP WITH TIME ZONE;

-- Ajouter colonne status aux machines si elle n'existe pas
ALTER TABLE machines ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved'));

-- =====================================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index pour les promotions
CREATE INDEX IF NOT EXISTS idx_promotions_seller_id ON promotions(seller_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);

-- Index pour les insights de stock
CREATE INDEX IF NOT EXISTS idx_stock_insights_seller_id ON stock_insights(seller_id);
CREATE INDEX IF NOT EXISTS idx_stock_insights_equipment_id ON stock_insights(equipment_id);
CREATE INDEX IF NOT EXISTS idx_stock_insights_type ON stock_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_stock_insights_created_at ON stock_insights(created_at);

-- Index pour les analytics
CREATE INDEX IF NOT EXISTS idx_equipment_analytics_equipment_id ON equipment_analytics(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_analytics_seller_id ON equipment_analytics(seller_id);
CREATE INDEX IF NOT EXISTS idx_equipment_analytics_date ON equipment_analytics(analysis_date);

-- Index pour les actions de stock
CREATE INDEX IF NOT EXISTS idx_stock_actions_equipment_id ON stock_actions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_stock_actions_seller_id ON stock_actions(seller_id);
CREATE INDEX IF NOT EXISTS idx_stock_actions_type ON stock_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_stock_actions_status ON stock_actions(status);

-- Index pour les machines
CREATE INDEX IF NOT EXISTS idx_machines_boosted ON machines(boosted);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);
CREATE INDEX IF NOT EXISTS idx_machines_sellerid ON machines(sellerid);

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
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer automatiquement le score de visibilité
CREATE OR REPLACE FUNCTION calculate_visibility_score(equipment_id UUID)
RETURNS INTEGER AS $$
DECLARE
    views_count INTEGER;
    clicks_count INTEGER;
    contacts_count INTEGER;
    visibility_score INTEGER;
BEGIN
    -- Compter les vues
    SELECT COUNT(*) INTO views_count
    FROM machine_views
    WHERE machine_id = equipment_id;
    
    -- Compter les clics (simulé pour l'instant)
    clicks_count := FLOOR(views_count * 0.15);
    
    -- Compter les contacts (messages + offres)
    SELECT 
        (SELECT COUNT(*) FROM messages WHERE machine_id = equipment_id) +
        (SELECT COUNT(*) FROM offers WHERE machine_id = equipment_id)
    INTO contacts_count;
    
    -- Calculer le score de visibilité
    visibility_score := LEAST(100, GREATEST(0, 
        (views_count * 0.4) + 
        (clicks_count * 0.3) + 
        (contacts_count * 0.3)
    ));
    
    RETURN visibility_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_actions ENABLE ROW LEVEL SECURITY;

-- Politiques pour promotions
CREATE POLICY "Users can view their own promotions" ON promotions FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own promotions" ON promotions FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own promotions" ON promotions FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own promotions" ON promotions FOR DELETE USING (auth.uid() = seller_id);

-- Politiques pour stock_insights
CREATE POLICY "Users can view their own stock insights" ON stock_insights FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own stock insights" ON stock_insights FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own stock insights" ON stock_insights FOR UPDATE USING (auth.uid() = seller_id);

-- Politiques pour equipment_analytics
CREATE POLICY "Users can view their own equipment analytics" ON equipment_analytics FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own equipment analytics" ON equipment_analytics FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Politiques pour stock_actions
CREATE POLICY "Users can view their own stock actions" ON stock_actions FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own stock actions" ON stock_actions FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own stock actions" ON stock_actions FOR UPDATE USING (auth.uid() = seller_id);

-- =====================================================
-- COMMENTAIRES POUR LA DOCUMENTATION (AJOUTÉS À LA FIN)
-- =====================================================

COMMENT ON TABLE promotions IS 'Table des promotions et offres flash pour les equipements';
COMMENT ON TABLE stock_insights IS 'Insights et recommandations IA pour la gestion du stock';
COMMENT ON TABLE equipment_analytics IS 'Analyses de performance des equipements';
COMMENT ON TABLE stock_actions IS 'Historique des actions effectuees sur le stock';

COMMENT ON COLUMN promotions.equipment_ids IS 'Array des IDs d''equipements concernes par la promotion';
COMMENT ON COLUMN stock_insights.insight_type IS 'Type d''insight: performance, optimization, alert';
COMMENT ON COLUMN equipment_analytics.performance_score IS 'Score de performance global de l''equipement';
COMMENT ON COLUMN stock_actions.action_type IS 'Type d''action: boost, price_update, photo_add, etc.'; 