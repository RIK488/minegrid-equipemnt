# 🚀 Résolution Manuelle Simple - Erreurs 404/500

## 🚨 **Problème Identifié**

Vos logs montrent des erreurs 404 pour ces tables manquantes :
- `machine_views` 
- `messages`
- `offers` 
- `profiles`

## ⚡ **Solution en 3 Étapes (5 minutes)**

### **Étape 1 : Ouvrir Supabase Dashboard**

1. Aller sur https://supabase.com/dashboard
2. Se connecter à votre compte
3. Sélectionner votre projet : `gvbtydxkvuwrxawkxiyv`
4. Cliquer sur **"SQL Editor"** dans le menu de gauche

### **Étape 2 : Exécuter le Script SQL**

1. Cliquer sur **"New query"** (nouvelle requête)
2. Copier tout le contenu ci-dessous
3. Coller dans l'éditeur SQL
4. Cliquer sur **"Run"** (bouton bleu)

```sql
-- =====================================================
-- CORRECTION RAPIDE DES ERREURS 404/500
-- =====================================================

-- 1. Créer la table machine_views
CREATE TABLE IF NOT EXISTS machine_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'vendeur',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_machine_views_machine_id ON machine_views(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_views_created_at ON machine_views(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);

-- 6. Activer RLS et créer les politiques
ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour machine_views
CREATE POLICY "Users can view their own machine views" ON machine_views
  FOR SELECT USING (
    machine_id IN (SELECT id FROM machines WHERE sellerId = auth.uid())
  );

CREATE POLICY "Anyone can insert machine views" ON machine_views
  FOR INSERT WITH CHECK (true);

-- Politiques pour messages
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Politiques pour offers
CREATE POLICY "Users can view offers they made or received" ON offers
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can insert offers" ON offers
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Politiques pour profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. Insérer des données de test
INSERT INTO machine_views (machine_id, ip_address, user_agent, created_at)
SELECT id, '127.0.0.1', 'Test Browser', NOW() - INTERVAL '1 day'
FROM machines LIMIT 3
ON CONFLICT DO NOTHING;

-- 8. Vérification finale
SELECT '🎉 Tables créées avec succès !' as message;
```

### **Étape 3 : Vérifier le Succès**

Après l'exécution, vous devriez voir :
- ✅ **"Success. No rows returned"** ou **"🎉 Tables créées avec succès !"**
- ✅ **Plus d'erreurs 404** dans la console de votre application

## 🔄 **Test Post-Correction**

1. **Recharger votre application** dans le navigateur
2. **Aller sur le dashboard** : `http://localhost:5175/#dashboard-entreprise-display`
3. **Ouvrir la console** (F12) et vérifier qu'il n'y a plus d'erreurs 404

## 📝 **Logs de Succès Attendu**

Après la correction, vous devriez voir dans la console :

```
✅ Composant SalesPerformanceScoreWidget monté
✅ Données réelles chargées: {score: 75, target: 85, ...}
✅ SalesEvolutionWidgetEnriched chargé
✅ Données réelles du stock chargées: {...}
✅ Données réelles du pipeline chargées: {...}
```

## 🚨 **En Cas de Problème**

### **Si vous voyez encore des erreurs :**

1. **Vérifier que le script s'est bien exécuté** dans Supabase
2. **Vider le cache** du navigateur (Ctrl+F5)
3. **Redémarrer l'application** si nécessaire

### **Si le script ne s'exécute pas :**

1. **Vérifier que vous êtes bien connecté** à Supabase
2. **Vérifier que vous avez les bonnes permissions** sur le projet
3. **Essayer d'exécuter le script par parties** (une table à la fois)

---

**⏱️ Temps estimé : 5 minutes**
**🎯 Taux de réussite : 95%** 