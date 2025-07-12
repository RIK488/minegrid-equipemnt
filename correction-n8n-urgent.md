# 🚨 CORRECTION URGENTE - Problème sellerId dans n8n

## 🎯 **Problème identifié**
- Les machines importées via Excel ont un `sellerId` différent de l'utilisateur connecté
- Résultat : les annonces n'apparaissent pas sur le dashboard

## ✅ **Solution immédiate dans n8n**

### **Étape 1 : Vérifier ce qui est reçu**
Dans ton webhook n8n, ajoute un nœud **"Set"** juste après le webhook pour voir ce qui arrive :

```json
{
  "debug_received": "{{ $json }}",
  "sellerId_received": "{{ $json.sellerId }}",
  "excel_received": "{{ $json.excel }}"
}
```

### **Étape 2 : Extraire le sellerId**
Si le sellerId arrive bien, ajoute un nœud **"Set"** pour l'extraire :

```json
{
  "sellerId": "{{ $json.sellerId }}",
  "excelFile": "{{ $json.excel }}"
}
```

### **Étape 3 : Utiliser le sellerId dans l'insertion**
Dans ton nœud **"Supabase Insert"**, remplace le sellerId en dur par :

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
  "sellerId": "{{ $('sellerId') }}",
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

## ⚠️ **Points critiques à vérifier**

### **1. Si le sellerId n'arrive pas dans n8n :**
- Vérifie que le frontend envoie bien `formData.append('sellerId', user.id)`
- Vérifie que le champ s'appelle exactement `sellerId`

### **2. Si n8n utilise un sellerId en dur :**
- Cherche dans ton workflow n8n une ligne comme : `"sellerId": "demo-id"`
- Remplace-la par : `"sellerId": "{{ $('sellerId') }}"`

### **3. Si la boucle ne fonctionne pas :**
- Vérifie que chaque ligne du fichier Excel est traitée
- Vérifie que le sellerId est bien transmis à chaque itération

## 🧪 **Test de la correction**

### **Test 1 : Vérifier l'envoi**
1. Importe un fichier Excel
2. Regarde les logs dans la console :
   ```
   🔍 DEBUG FormData complet:
     excel: [File]
     sellerId: 2d310f18-cc53-4bf3-864c-26c400549e32
   ```

### **Test 2 : Vérifier dans n8n**
1. Regarde les logs du nœud "Set" de debug
2. Tu devrais voir :
   ```
   sellerId_received: 2d310f18-cc53-4bf3-864c-26c400549e32
   ```

### **Test 3 : Vérifier dans Supabase**
1. Va dans ton dashboard Supabase
2. Table `machines`
3. Vérifie que les nouvelles machines ont le bon sellerId

## 🔧 **Workflow n8n corrigé**

1. **Webhook** → Reçoit FormData
2. **Set (Debug)** → Voir ce qui arrive
3. **Set (Extract)** → Extraire sellerId et excelFile
4. **Read Binary Files** → Lire le fichier Excel
5. **Spreadsheet File** → Parser le contenu
6. **Loop Over Items** → Pour chaque ligne :
   - **Supabase Insert** → Insérer avec `{{ $('sellerId') }}`

## 🚨 **Si ça ne marche toujours pas**

Exécute le script `test-simple.js` dans la console pour voir :
- Quel sellerId est utilisé actuellement
- Si ton ID est dans la liste
- Combien de machines tu as

**Dis-moi les résultats et je t'aide à corriger !** 