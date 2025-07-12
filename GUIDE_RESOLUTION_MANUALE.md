# 🔧 Guide de Résolution Manuelle - Erreurs 404/400

## 🚨 **Problèmes Identifiés**

D'après les logs de votre application, les erreurs suivantes sont présentes :

### **Erreurs 404 (Tables manquantes) :**
- `machine_views` - Table pour enregistrer les vues des machines
- `messages` - Table pour les messages entre utilisateurs  
- `offers` - Table pour les offres d'achat
- `profiles` - Table pour les profils utilisateur

### **Erreurs 400 (Relations incorrectes) :**
- Problèmes de relations entre les tables
- Politiques RLS (Row Level Security) manquantes

## 🛠️ **Solution Manuelle (Dashboard Supabase)**

### **Étape 1 : Accéder au Dashboard Supabase**

1. **Ouvrir le dashboard Supabase**
   - Aller sur https://supabase.com/dashboard
   - Se connecter à votre compte
   - Sélectionner votre projet : `gvbtydxkvuwrxawkxiyv`

2. **Aller dans l'éditeur SQL**
   - Cliquer sur "SQL Editor" dans le menu de gauche
   - Cliquer sur "New query" pour créer une nouvelle requête

### **Étape 2 : Créer les Tables Manquantes**

Copier et exécuter le script suivant dans l'éditeur SQL :

```sql
-- =====================================================
-- CRÉATION DES TABLES MANQUANTES
-- =====================================================

-- Table pour enregistrer les vues des machines
CREATE TABLE IF NOT EXISTS machine_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les messages entre utilisateurs
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

-- Table pour les offres d'achat
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

-- Table pour les profils utilisateur
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    role TEXT DEFAULT 'vendeur',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Étape 3 : Créer les Index**

```sql
-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour machine_views
CREATE INDEX IF NOT EXISTS idx_machine_views_machine_id ON machine_views(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_views_created_at ON machine_views(created_at);
CREATE INDEX IF NOT EXISTS idx_machine_views_viewer_id ON machine_views(viewer_id);

-- Index pour messages
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Index pour offers
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_machine_id ON offers(machine_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at);

-- Index pour profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
```

### **Étape 4 : Configurer les Politiques RLS**

```sql
-- =====================================================
-- POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Politiques pour machine_views
ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own machine views" ON machine_views
    FOR SELECT USING (
        machine_id IN (
            SELECT id FROM machines WHERE sellerId = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert machine views" ON machine_views
    FOR INSERT WITH CHECK (true);

-- Politiques pour messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (
        sender_id = auth.uid() OR receiver_id = auth.uid()
    );

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received" ON messages
    FOR UPDATE USING (receiver_id = auth.uid());

-- Politiques pour offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view offers they made or received" ON offers
    FOR SELECT USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
    );

CREATE POLICY "Users can insert offers" ON offers
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update their offers" ON offers
    FOR UPDATE USING (seller_id = auth.uid());

-- Politiques pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### **Étape 5 : Vérifier la Création**

```sql
-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que toutes les tables ont été créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('machine_views', 'messages', 'offers', 'profiles')
ORDER BY table_name;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('machine_views', 'messages', 'offers', 'profiles')
ORDER BY tablename, policyname;
```

## 🧪 **Test de Vérification**

Après avoir exécuté tous les scripts, testez votre application :

1. **Recharger l'application** dans votre navigateur
2. **Ouvrir la console développeur** (F12)
3. **Naviguer vers le dashboard** (`#dashboard`)
4. **Vérifier qu'il n'y a plus d'erreurs 404** dans la console

## 📊 **Résultat Attendu**

Après ces étapes, vous devriez voir :

- ✅ **Plus d'erreurs 404** sur `machine_views`, `messages`, `offers`, `profiles`
- ✅ **Plus d'erreurs 400** sur les relations
- ✅ **Dashboard fonctionnel** avec toutes les fonctionnalités
- ✅ **Widgets qui se chargent** correctement

## 🚨 **En Cas de Problème**

### **Si les erreurs persistent :**

1. **Vérifier les permissions** dans Supabase Dashboard
2. **Vérifier que vous êtes connecté** avec le bon compte
3. **Vérifier les logs SQL** dans Supabase pour voir les erreurs exactes

### **Si certaines tables existent déjà :**

Utilisez `CREATE TABLE IF NOT EXISTS` au lieu de `CREATE TABLE` pour éviter les erreurs.

### **Si les relations échouent :**

Vérifiez que la table `machines` existe et contient des données :

```sql
-- Vérifier la table machines
SELECT COUNT(*) FROM machines;

-- Vérifier la structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'machines';
```

## 📞 **Support**

Si vous rencontrez encore des problèmes après avoir suivi ce guide :

1. **Vérifiez les logs SQL** dans Supabase Dashboard
2. **Prenez une capture d'écran** des erreurs
3. **Consultez la documentation Supabase** : https://supabase.com/docs

---

**Note :** Ce guide corrige les erreurs 404 et 400 identifiées dans vos logs. Une fois ces tables créées, votre application devrait fonctionner correctement. 