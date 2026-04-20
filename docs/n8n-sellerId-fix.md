# 🔧 CORRECTION du problème sellerId dans n8n

## 🎯 **Problème identifié**
- L'utilisateur se connecte avec un ID (ex: `2d310f18-cc53-4bf3-864c-26c400549e32`)
- Mais les machines importées via n8n ont un sellerId différent ou en dur
- Résultat : les annonces n'apparaissent pas sur le dashboard

## ✅ **Solution étape par étape**

### **Étape 1 : Vérifier ce qui est envoyé depuis le frontend**

Dans `SellEquipment.tsx`, nous avons ajouté des logs. Quand tu importes un fichier Excel, tu devrais voir dans la console :

```
🔍 DEBUG FormData complet:
  excel: [File object]
  sellerId: 2d310f18-cc53-4bf3-864c-26c400549e32
```

### **Étape 2 : Configurer n8n pour récupérer le sellerId**

Dans ton workflow n8n, ajoute un nœud **"Set"** juste après le webhook :

```json
{
  "sellerId": "{{ $json.sellerId }}",
  "excelFile": "{{ $json.excel }}"
}
```

### **Étape 3 : Utiliser le sellerId dans l'insertion Supabase**

Dans ton nœud **"Supabase Insert"**, pour chaque ligne du fichier Excel, utilise :

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

### **Étape 4 : Workflow n8n complet**

1. **Webhook** → Reçoit le FormData
2. **Set** → Extrait sellerId et excelFile
3. **Read Binary Files** → Lit le fichier Excel
4. **Spreadsheet File** → Parse le contenu
5. **Loop Over Items** → Pour chaque ligne :
   - **Supabase Insert** → Insère avec le sellerId récupéré

## 🧪 **Test de la correction**

### **Test 1 : Vérifier l'envoi**
1. Importe un fichier Excel
2. Regarde la console pour voir :
   ```
   🔍 DEBUG FormData complet:
     excel: [File]
     sellerId: 2d310f18-cc53-4bf3-864c-26c400549e32
   ```

### **Test 2 : Vérifier dans Supabase**
1. Va dans ton dashboard Supabase
2. Table `machines`
3. Vérifie que les nouvelles machines ont le bon sellerId

### **Test 3 : Vérifier le dashboard**
1. Va sur ton dashboard utilisateur
2. Les machines devraient maintenant apparaître

## ⚠️ **Points d'attention**

### **Si le sellerId n'est pas dans le FormData :**
- Vérifie que `user.id` n'est pas `undefined`
- Vérifie que l'utilisateur est bien connecté

### **Si n8n ne reçoit pas le sellerId :**
- Vérifie que le champ s'appelle bien `sellerId` dans le FormData
- Vérifie que n8n lit bien `{{ $json.sellerId }}`

### **Si les machines n'ont toujours pas le bon sellerId :**
- Vérifie que n8n utilise bien `{{ $('sellerId') }}` et non une valeur en dur
- Vérifie que la boucle traite bien chaque ligne

## 🔍 **Script de diagnostic**

Exécute le script `debug-sellerId-problem.js` dans la console pour voir :
- Quels sellerId sont utilisés actuellement
- Si la création manuelle fonctionne
- Si le problème vient du frontend ou de n8n 