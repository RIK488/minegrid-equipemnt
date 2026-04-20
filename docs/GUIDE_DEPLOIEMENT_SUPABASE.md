# 🚀 Guide de Déploiement Supabase

## Problème Actuel
```
Access token not provided. Supply an access token by running supabase login or setting the SUPABASE_ACCESS_TOKEN environment variable.
```

## Solution 1: Connexion via CLI (Recommandée)

### Étape 1: Installer Supabase CLI
```bash
npm install -g supabase
```

### Étape 2: Se connecter à Supabase
```bash
supabase login
```

Cela ouvrira votre navigateur pour vous connecter à votre compte Supabase.

### Étape 3: Initialiser le projet (si pas déjà fait)
```bash
supabase init
```

### Étape 4: Lier le projet
```bash
supabase link --project-ref gvbtydxkvuwrxawkxiyv
```

### Étape 5: Déployer la fonction
```bash
supabase functions deploy exchange-rates
```

## Solution 2: Token d'Accès Manuel

### Étape 1: Obtenir le token d'accès
1. Allez sur [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Cliquez sur "Generate new token"
3. Copiez le token généré

### Étape 2: Définir la variable d'environnement
```bash
# Windows PowerShell
$env:SUPABASE_ACCESS_TOKEN="votre_token_ici"

# Windows CMD
set SUPABASE_ACCESS_TOKEN=votre_token_ici

# Linux/Mac
export SUPABASE_ACCESS_TOKEN="votre_token_ici"
```

### Étape 3: Déployer
```bash
npx supabase functions deploy exchange-rates
```

## Solution 3: Utilisation du Service Local (Alternative)

Si vous ne pouvez pas déployer immédiatement, l'application utilisera automatiquement le service local que nous avons créé.

### Vérification
Après le redémarrage de l'application, vous devriez voir :
```
⚠️ API Supabase échoue, utilisation du service local
```

## Vérification du Déploiement

### Test de la fonction déployée
```bash
curl -X GET "https://gvbtydxkvuwrxawkxiyv.supabase.co/functions/v1/exchange-rates" \
  -H "Authorization: Bearer votre_anon_key"
```

### Réponse attendue
```json
{
  "EUR": 1,
  "USD": 1.1,
  "MAD": 11,
  "XOF": 655,
  "XAF": 655,
  "NGN": 1650,
  "ZAR": 20,
  "EGP": 33,
  "KES": 150,
  "GHS": 15
}
```

## Dépannage

### Erreur de connexion
```bash
# Vérifier la connexion
supabase status

# Se reconnecter si nécessaire
supabase logout
supabase login
```

### Erreur de projet
```bash
# Vérifier le projet lié
supabase projects list

# Relier le projet
supabase link --project-ref gvbtydxkvuwrxawkxiyv
```

### Erreur de déploiement
```bash
# Déployer avec debug
supabase functions deploy exchange-rates --debug

# Vérifier les logs
supabase functions logs exchange-rates
```

## Variables d'Environnement Requises

Assurez-vous d'avoir ces variables dans votre `.env` :
```env
VITE_SUPABASE_URL=https://gvbtydxkvuwrxawkxiyv.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_ACCESS_TOKEN=votre_access_token
```

## Prochaines Étapes

1. **Choisir une solution** (CLI recommandée)
2. **Se connecter** à Supabase
3. **Déployer** la fonction
4. **Tester** l'application
5. **Vérifier** que les erreurs 500 ont disparu

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que vous avez un compte Supabase actif
2. Vérifiez que vous avez les permissions sur le projet
3. Utilisez le service local en attendant
4. Consultez la [documentation Supabase](https://supabase.com/docs) 