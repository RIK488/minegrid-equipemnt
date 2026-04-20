# 🔧 Configuration n8n pour Import Excel JSON

## 📋 Vue d'ensemble

Le frontend envoie maintenant les données en JSON avec le `sellerId` dans plusieurs endroits pour s'assurer qu'il soit accessible.

## 📦 Structure des données reçues

```json
{
  "excelFile": {
    "name": "machines.xlsx",
    "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "size": 12345,
    "data": "UEsDBBQAAAAIAA..." // Base64 du fichier Excel
  },
  "sellerId": "uuid-de-l-utilisateur",
  "imageLinks": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "metadata": {
    "sellerId": "uuid-de-l-utilisateur",
    "userId": "uuid-de-l-utilisateur", 
    "userEmail": "user@example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "totalMachines": 5
  }
}
```

## 🔧 Configuration n8n

### 1. Webhook Node (Déclencheur)

**Configuration :**
- **HTTP Method**: POST
- **Path**: `/import_parc_excel`
- **Authentication**: Header
- **Header Name**: `x-auth-token`
- **Header Value**: `minegrid-secret-token-2025`

**Sortie attendue :**
```json
{
  "excelFile": {
    "name": "machines.xlsx",
    "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
    "size": 12345,
    "data": "UEsDBBQAAAAIAA..."
  },
  "sellerId": "uuid-de-l-utilisateur",
  "imageLinks": ["url1", "url2"],
  "metadata": {
    "sellerId": "uuid-de-l-utilisateur",
    "userId": "uuid-de-l-utilisateur",
    "userEmail": "user@example.com",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "totalMachines": 5
  }
}
```

### 2. Code Node - Décodage Base64

**Code JavaScript :**
```javascript
// Décoder le fichier Excel depuis base64
const excelData = $input.first().json.excelFile.data;
const sellerId = $input.first().json.sellerId;
const metadata = $input.first().json.metadata;
const imageLinks = $input.first().json.imageLinks || [];

// Convertir base64 en buffer
const buffer = Buffer.from(excelData, 'base64');

// Lire le fichier Excel
const workbook = XLSX.read(buffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log("📊 Données Excel lues:", jsonData.length, "lignes");
console.log("🆔 SellerId principal:", sellerId);
console.log("🆔 SellerId dans metadata:", metadata.sellerId);
console.log("🆔 UserEmail:", metadata.userEmail);
console.log("🖼️ Liens d'images:", imageLinks.length);

return {
  json: {
    machines: jsonData,
    sellerId: sellerId,
    metadata: metadata,
    imageLinks: imageLinks
  }
};
```

### 3. Code Node - Traitement des machines

**Code JavaScript :**
```javascript
const machines = $input.first().json.machines;
const sellerId = $input.first().json.sellerId;
const metadata = $input.first().json.metadata;
const imageLinks = $input.first().json.imageLinks;

console.log("🔄 Traitement de", machines.length, "machines");
console.log("🆔 SellerId à utiliser:", sellerId);
console.log("📧 Email utilisateur:", metadata.userEmail);

const processedMachines = machines.map((machine, index) => {
  // Mapper les colonnes Excel vers les champs Supabase
  return {
    name: `${machine.marque || ''} ${machine.modele || ''}`.trim(),
    brand: machine.marque || '',
    model: machine.modele || '',
    category: machine.type || '',
    year: parseInt(machine.annee) || new Date().getFullYear(),
    price: parseInt(machine['prix_euros']) || 0,
    condition: 'used',
    description: machine.description || 'Machine importée automatiquement',
    specifications: {
      weight: machine.poids ? machine.poids.toString() : '',
      dimensions: machine.dimensions || '',
      power: {
        value: machine.puissance ? machine.puissance.toString() : '',
        unit: 'kW'
      },
      operatingCapacity: machine.capacite ? machine.capacite.toString() : '',
      workingWeight: machine['poids_de_travail'] ? machine['poids_de_travail'].toString() : '',
      heures: machine['heures_estimees'] ? machine['heures_estimees'].toString() : ''
    },
    sellerId: sellerId, // ⭐ IMPORTANT : Utiliser le sellerId reçu
    images: imageLinks.length > 0 ? imageLinks : [],
    // Métadonnées supplémentaires
    importMetadata: {
      importedAt: metadata.timestamp,
      importedBy: metadata.userEmail,
      originalFile: metadata.totalMachines + " machines"
    }
  };
});

console.log("🔄 Machines traitées:", processedMachines.length);
console.log("🆔 SellerId utilisé pour toutes les machines:", sellerId);

// Vérifier que toutes les machines ont le bon sellerId
const allHaveSellerId = processedMachines.every(m => m.sellerId === sellerId);
console.log("✅ Toutes les machines ont le bon sellerId:", allHaveSellerId);

return {
  json: {
    machines: processedMachines,
    sellerId: sellerId,
    metadata: metadata
  }
};
```

### 4. HTTP Request Node - Insertion Supabase

**Configuration :**
- **Method**: POST
- **URL**: `https://your-project.supabase.co/rest/v1/machines`
- **Headers**:
  ```
  apikey: your-supabase-anon-key
  Authorization: Bearer your-supabase-service-role-key
  Content-Type: application/json
  Prefer: return=minimal
  ```

**Body (JSON) - VERSION CORRIGÉE :**
```json
{
  "name": "{{$json['marque'] + ' ' + $json['modele']}}",
  "brand": "{{$json['marque']}}",
  "model": "{{$json['modele']}}",
  "category": "{{$json['type']}}",
  "year": {{$json['annee']}},
  "price": {{$json['prix_euros']}},
  "condition": "used",
  "description": "Machine importée automatiquement",
  "specifications": {
    "heures": "{{$json['heures_estimees']}}"
  },
  "images": {{$json['images'] || []}},
  "sellerId": "{{$('Code').item.json.sellerId}}"
}
```

## 🎯 Points clés

### ✅ SellerId accessible de plusieurs façons
- `$input.first().json.sellerId` - SellerId principal
- `$input.first().json.metadata.sellerId` - SellerId dans metadata
- `$('Code').item.json.sellerId` - SellerId depuis le node Code

### ✅ Vérifications multiples
- Le sellerId est dans plusieurs endroits pour s'assurer qu'il soit accessible
- Logs détaillés pour vérifier que le sellerId est bien utilisé
- Vérification que toutes les machines ont le bon sellerId

### ✅ Traitement des images
- Les liens d'images détectés dans Excel sont inclus
- Les images uploadées peuvent être traitées séparément si nécessaire

## 🔍 Test de la configuration

### 1. Test avec curl
```bash
curl -X POST https://n8n.srv786179.hstgr.cloud/webhook/import_parc_excel \
  -H "Content-Type: application/json" \
  -H "x-auth-token: minegrid-secret-token-2025" \
  -d '{
    "excelFile": {
      "name": "test.xlsx",
      "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "size": 100,
      "data": "UEsDBBQAAAAIAA..."
    },
    "sellerId": "test-user-id",
    "imageLinks": [],
    "metadata": {
      "sellerId": "test-user-id",
      "userId": "test-user-id",
      "userEmail": "test@example.com",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "totalMachines": 1
    }
  }'
```

### 2. Vérification dans Supabase
```sql
-- Vérifier les machines créées
SELECT id, name, sellerId, created_at 
FROM machines 
WHERE sellerId = 'test-user-id' 
ORDER BY created_at DESC;

-- Vérifier le nombre de machines par utilisateur
SELECT sellerId, COUNT(*) as machine_count
FROM machines 
GROUP BY sellerId;
```

## 🚀 Résultat attendu

Après cette configuration :
1. ✅ Le `sellerId` est correctement reçu par n8n
2. ✅ Le `sellerId` est accessible dans tous les nodes
3. ✅ Toutes les machines sont créées avec le bon `sellerId`
4. ✅ Les machines apparaissent dans le dashboard utilisateur
5. ✅ Les images sont traitées correctement

## 📝 Notes importantes

- **Double sellerId** : Le sellerId est dans plusieurs endroits pour s'assurer qu'il soit accessible
- **Base64** : Les fichiers Excel sont convertis en base64 pour transmission JSON
- **Taille limite** : Surveillez la taille des fichiers (limite n8n)
- **Performance** : Le décodage base64 ajoute un peu de latence
- **Sécurité** : Le token d'authentification protège le webhook

## 🔧 Corrections importantes

### ❌ Ancien JSON (problématique)
```json
{
  "name": "{{$json['marque'] + ' ' + $json['modele']}}",
  "brand": "{{$json['marque']}}",
  "model": "{{$json['modèle']}}",  // ❌ Accent
  "category": "{{$json['type']}}",
  "year": {{$json['année']}},     // ❌ Accent
  "price": {{$json['prix (€)']}}, // ❌ Espaces et caractères spéciaux
  "condition": "used",
  "description": "Machine importée automatiquement",
  "specifications": {
    "heures": "{{$json['heures estimées']}}" // ❌ Espaces et accents
  },
  "images": {{$json['images'] || []}},
  "sellerId": {{ $('Fix Binary Name').item.json.body.sellerId }} // ❌ Syntaxe incorrecte
}
```

### ✅ Nouveau JSON (corrigé)
```json
{
  "name": "{{$json['marque'] + ' ' + $json['modele']}}",
  "brand": "{{$json['marque']}}",
  "model": "{{$json['modele']}}",  // ✅ Sans accent
  "category": "{{$json['type']}}",
  "year": {{$json['annee']}},     // ✅ Sans accent
  "price": {{$json['prix_euros']}}, // ✅ Sans espaces ni caractères spéciaux
  "condition": "used",
  "description": "Machine importée automatiquement",
  "specifications": {
    "heures": "{{$json['heures_estimees']}}" // ✅ Sans espaces ni accents
  },
  "images": {{$json['images'] || []}},
  "sellerId": "{{$('Code').item.json.sellerId}}" // ✅ Syntaxe correcte avec référence au node Code
}
``` 