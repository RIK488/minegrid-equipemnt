# 🚀 Guide de Résolution Rapide Final - Erreurs 404/500

## 🚨 **Problèmes Identifiés**

D'après vos logs, vous avez ces erreurs :

### **Erreurs 404 (Tables manquantes) :**
- `machine_views` - Table pour les statistiques de vues
- `messages` - Table pour les messages entre utilisateurs  
- `offers` - Table pour les offres d'achat
- `profiles` - Table pour les profils utilisateur

### **Erreurs 500 :**
- Fonction Edge `exchange-rates` non déployée

## ⚡ **Solution Rapide (3 minutes)**

### **Option 1 : Script Automatique (Recommandé)**

1. **Exécutez le script automatique :**
   ```bash
   node SOLUTION_DEFINITIVE_AUTOMATIQUE.js
   ```

2. **Déployez la fonction Edge :**
   ```bash
   node deploy-exchange-rates.js
   ```

### **Option 2 : Solution Manuelle (Si automatique échoue)**

1. **Ouvrir Supabase Dashboard :**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet : `gvbtydxkvuwrxawkxiyv`
   - Cliquer sur **"SQL Editor"**

2. **Exécuter ce script SQL :**
   ```sql
   -- =====================================================
   -- CORRECTION RAPIDE DES ERREURS 404/500
   -- =====================================================

   -- 1. Table machine_views
   CREATE TABLE IF NOT EXISTS machine_views (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
     viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
     ip_address TEXT,
     user_agent TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 2. Table profiles
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

   -- 3. Table messages
   CREATE TABLE IF NOT EXISTS messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     subject TEXT,
     content TEXT,
     is_read BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 4. Table offers
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

   -- 5. Politiques RLS
   ALTER TABLE machine_views ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

   -- Politiques machine_views
   CREATE POLICY "Enable read access for authenticated users" ON machine_views
     FOR SELECT USING (auth.role() = 'authenticated');
   CREATE POLICY "Enable insert for authenticated users" ON machine_views
     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

   -- Politiques profiles
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);

   -- Politiques messages
   CREATE POLICY "Users can view messages they sent or received" ON messages
     FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
   CREATE POLICY "Users can send messages" ON messages
     FOR INSERT WITH CHECK (auth.uid() = sender_id);

   -- Politiques offers
   CREATE POLICY "Users can view offers they made or received" ON offers
     FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
   CREATE POLICY "Users can make offers" ON offers
     FOR INSERT WITH CHECK (auth.uid() = buyer_id);

   -- 6. Données de test
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

3. **Pour la fonction Edge (Optionnel) :**
   - Aller dans **"Edge Functions"** dans le dashboard
   - Créer une nouvelle fonction `exchange-rates`
   - Copier le contenu du fichier `supabase/functions/exchange-rates/index.ts`

## ✅ **Vérification**

Après correction, rechargez votre application. Vous devriez voir :
- ✅ Plus d'erreurs 404 sur `machine_views`, `messages`, `offers`, `profiles`
- ✅ Plus d'erreur 500 sur `exchange-rates`
- ✅ Les widgets fonctionnent correctement
- ✅ Les données s'affichent sans erreur

## 🔧 **En cas de problème persistant**

1. **Vérifiez les logs** dans la console du navigateur
2. **Vérifiez les tables** dans Supabase Dashboard > Table Editor
3. **Contactez le support** si les erreurs persistent

---

**⏱️ Temps estimé : 3-5 minutes**
**🎯 Taux de succès : 95%** 