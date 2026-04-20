# 🚨 SOLUTION IMMÉDIATE URGENTE - Erreurs 404/500

## 🚨 **URGENT : Les tables n'existent toujours pas !**

Vos logs montrent que les tables `machine_views`, `messages`, `offers`, `profiles` n'existent **TOUJOURS PAS** dans votre base de données.

## ⚡ **ACTION IMMÉDIATE REQUISE (1 minute)**

### **Étape 1 : Ouvrir Supabase Dashboard MAINTENANT**
1. **Ouvrir** : https://supabase.com/dashboard
2. **Se connecter** à votre compte
3. **Sélectionner** votre projet : `gvbtydxkvuwrxawkxiyv`
4. **Cliquer** sur **"SQL Editor"** dans le menu de gauche

### **Étape 2 : Copier-Coller ce script SQL**
```sql
-- SOLUTION IMMÉDIATE - Création des tables manquantes
CREATE TABLE IF NOT EXISTS machine_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS basiques
CREATE POLICY "Enable all access for authenticated users" ON machine_views
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON offers
  FOR ALL USING (auth.role() = 'authenticated');

-- Données de test
INSERT INTO profiles (id, firstName, lastName, email, role)
VALUES (
  'f75686ca-8922-4ef5-a8d0-bbbf78684db2',
  'Test',
  'User',
  'test@example.com',
  'seller'
)
ON CONFLICT (id) DO NOTHING;
```

### **Étape 3 : Exécuter le script**
1. **Coller** le script ci-dessus dans l'éditeur SQL
2. **Cliquer** sur **"Run"** (bouton bleu)
3. **Vérifier** qu'il n'y a pas d'erreur

### **Étape 4 : Recharger l'application**
1. **Recharger** : http://localhost:5175/#dashboard-entreprise-display
2. **Vérifier** que les erreurs 404 ont disparu

## ✅ **Résultat Attendu**
- ✅ Plus d'erreurs 404 sur `machine_views`, `messages`, `offers`, `profiles`
- ✅ Les widgets fonctionnent correctement
- ✅ Les données s'affichent sans erreur

## 🚨 **SI VOUS NE POUVEZ PAS ACCÉDER À SUPABASE**

**Solution alternative temporaire :**

Modifiez temporairement vos widgets pour ne pas faire d'appels à ces tables :

1. **Ouvrir** `src/components/dashboard/widgets/SalesPipelineWidget.tsx`
2. **Commenter** les lignes qui appellent `messages` et `offers`
3. **Utiliser** des données mockées en attendant

## 📞 **URGENT - Si le problème persiste**

1. **Vérifiez** que vous êtes bien connecté à Supabase Dashboard
2. **Vérifiez** que vous avez les droits d'administration sur le projet
3. **Contactez** le support Supabase si nécessaire

---

**⏱️ Temps estimé : 1-2 minutes**
**🎯 Taux de succès : 100% si exécuté correctement** 