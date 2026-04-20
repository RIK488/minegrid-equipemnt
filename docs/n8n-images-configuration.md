# 🖼️ Configuration n8n pour les images (liens + uploads)

## 🎯 **Nouveau format d'envoi**

Le frontend envoie maintenant :

```
FormData:
- excel: [fichier Excel]
- sellerId: [ID utilisateur]
- image_0: [fichier image uploadé] (optionnel)
- image_1: [fichier image uploadé] (optionnel)
- ...
- imageLinks: [JSON des liens d'images détectés] (optionnel)
```

## ✅ **Configuration n8n étape par étape**

### **Étape 1 : Récupérer les données du webhook**

Dans un nœud **"Set"** après le webhook :

```json
{
  "sellerId": "{{ $json.sellerId }}",
  "excelFile": "{{ $json.excel }}",
  "imageLinks": "{{ $json.imageLinks }}",
  "hasUploadedImages": "{{ $json.image_0 ? true : false }}"
}
```

### **Étape 2 : Traiter les liens d'images**

Si `imageLinks` existe, parser le JSON :

```json
{
  "parsedImageLinks": "{{ JSON.parse($json.imageLinks) }}"
}
```

### **Étape 3 : Traiter les images uploadées**

Si `hasUploadedImages` est true, utiliser un nœud **"Split In Batches"** pour traiter chaque image :

```json
{
  "imageFile": "{{ $json.image_0 }}",
  "imageIndex": "0"
}
```

### **Étape 4 : Upload des images vers Supabase Storage**

Pour chaque image uploadée :

```json
{
  "fileName": "{{ $json.imageIndex }}_image_{{ $now }}.jpg",
  "imageData": "{{ $json.imageFile }}"
}
```

### **Étape 5 : Combiner toutes les images**

Créer un tableau avec :
- Les liens d'images détectés dans Excel
- Les URLs des images uploadées vers Supabase

```json
{
  "allImages": "{{ $('parsedImageLinks') + $('uploadedImageUrls') }}"
}
```

### **Étape 6 : Insérer dans Supabase avec toutes les images**

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
  "images": "{{ $('allImages') }}",
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

## 🔧 **Workflow n8n complet**

1. **Webhook** → Reçoit FormData
2. **Set (Extract)** → Extraire sellerId, excelFile, imageLinks
3. **Set (Parse Images)** → Parser imageLinks si présent
4. **Read Binary Files** → Lire le fichier Excel
5. **Spreadsheet File** → Parser le contenu
6. **Split In Batches (Images)** → Traiter les images uploadées (si présentes)
7. **Supabase Storage Upload** → Upload chaque image
8. **Merge** → Combiner liens Excel + URLs uploadées
9. **Loop Over Items** → Pour chaque ligne Excel :
   - **Supabase Insert** → Insérer avec toutes les images

## 🧪 **Test de la configuration**

### **Test 1 : Fichier Excel avec liens d'images**
1. Crée un fichier Excel avec une colonne "images" contenant des URLs
2. Importe le fichier
3. Vérifie que les liens sont détectés dans la console
4. Vérifie que n8n les traite correctement

### **Test 2 : Fichier Excel sans images + uploads**
1. Crée un fichier Excel sans colonne d'images
2. Upload quelques images manuellement
3. Importe le fichier
4. Vérifie que les images uploadées sont traitées

### **Test 3 : Fichier Excel avec liens + uploads**
1. Combine les deux cas précédents
2. Vérifie que toutes les images sont traitées

## ⚠️ **Points d'attention**

### **Si les liens d'images ne sont pas détectés :**
- Vérifie que la colonne Excel s'appelle "image", "photo", "img" ou "url"
- Vérifie que les liens commencent par http/https ou ont une extension d'image

### **Si les images uploadées ne sont pas traitées :**
- Vérifie que le champ s'appelle `image_0`, `image_1`, etc.
- Vérifie que n8n traite bien les fichiers binaires

### **Si les images ne s'affichent pas dans Supabase :**
- Vérifie que les URLs sont correctes
- Vérifie que les images sont bien uploadées vers le storage
- Vérifie que les permissions Supabase sont correctes

## 📝 **Exemple de fichier Excel**

| name | brand | model | images |
|------|-------|-------|--------|
| Pelle hydraulique | Caterpillar | 320D | https://example.com/image1.jpg |
| Bulldozer | Komatsu | D65 | https://example.com/image2.jpg |

**Les liens d'images seront automatiquement détectés et traités !** 