# Configuration Stripe pour Minegrid Équipement

## 🔑 Variables d'environnement requises

### Frontend (.env)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Backend (Supabase Edge Functions)
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

## 🚀 Étapes de configuration

### 1. Créer un compte Stripe
- Aller sur https://stripe.com
- Créer un compte
- Récupérer les clés API dans le Dashboard

### 2. Configurer les variables d'environnement
- Créer un fichier `.env` à la racine du projet
- Ajouter `VITE_STRIPE_PUBLISHABLE_KEY=your_key_here`

### 3. Configurer Supabase Edge Functions
- Dans le Dashboard Supabase
- Aller dans Settings > Edge Functions
- Ajouter `STRIPE_SECRET_KEY=your_secret_key_here`

### 4. Déployer la fonction Edge
```bash
supabase functions deploy create-payment-intent
```

## 💳 Test des paiements

### Cartes de test Stripe
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **CVC** : `123`
- **Date** : `12/25`

## 🔒 Sécurité
- Les clés secrètes ne sont jamais exposées côté client
- Tous les paiements passent par Supabase Edge Functions
- Conformité PCI DSS via Stripe 