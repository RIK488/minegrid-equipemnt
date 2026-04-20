# Configuration n8n pour l'import Excel avec sellerId

## Étape 1 : Récupérer le sellerId depuis la requête

Dans ton webhook n8n, ajoute un nœud "Set" pour extraire le sellerId :

```json
{
  "sellerId": "{{ $json.sellerId }}",
  "excelFile": "{{ $json.excel }}"
}
```

## Étape 2 : Traiter le fichier Excel

Utilise un nœud "Read Binary Files" pour lire le fichier Excel, puis un nœud "Spreadsheet File" pour le parser.

## Étape 3 : Insérer dans Supabase avec sellerId

Dans ton nœud Supabase "Insert", pour chaque ligne du fichier Excel, ajoute le sellerId :

```json
{
  "name": "{{ $json.name }}",
  "brand": "{{ $json.brand }}",
  "model": "{{ $json.model }}",
  "category": "{{ $json.category }}",
  "year": "{{ $json.year }}",
  "price": "{{ $json.price }}",
  "condition": "{{ $json.condition }}",
  "description": "{{ $json.description }}",
  "sellerId": "{{ $('sellerId') }}",  // ← ICI : utiliser le sellerId récupéré
  "specifications": {
    "weight": "{{ $json.weight }}",
    "dimensions": {
      "length": "{{ $json.length }}",
      "width": "{{ $json.width }}",
      "height": "{{ $json.height }}"
    },
    "power": {
      "value": "{{ $json.power_value }}",
      "unit": "{{ $json.power_unit }}"
    },
    "operatingCapacity": {
      "value": "{{ $json.operating_capacity_value }}",
      "unit": "{{ $json.operating_capacity_unit }}"
    }
  }
}
```

## Étape 4 : Boucle pour traiter chaque ligne

Utilise un nœud "Split In Batches" ou "Loop Over Items" pour traiter chaque ligne du fichier Excel et insérer chaque machine avec le bon sellerId.

## Exemple de workflow complet :

1. **Webhook** → Reçoit le fichier Excel + sellerId
2. **Set** → Extrait sellerId et stocke-le
3. **Read Binary Files** → Lit le fichier Excel
4. **Spreadsheet File** → Parse le contenu
5. **Loop Over Items** → Pour chaque ligne :
   - **Supabase Insert** → Insère la machine avec le sellerId

## Test de la configuration

Pour tester, tu peux utiliser cette requête curl :

```bash
curl -X POST https://n8n.srv786179.hstgr.cloud/webhook/import_parc_excel \
  -H "x-auth-token: minegrid-secret-token-2025" \
  -F "excel=@ton_fichier.xlsx" \
  -F "sellerId=USER_ID_ICI"
```

Remplace `USER_ID_ICI` par l'ID d'un utilisateur de test dans ta base Supabase. 