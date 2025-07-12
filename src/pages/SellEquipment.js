import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Upload, X, Camera, Info, FileSpreadsheet } from 'lucide-react';
import { publishMachine, getCurrentUser } from '../utils/api';
import supabase from '../utils/supabaseClient';
import { brands } from '../data/brands';
import { categories } from '../data/categories';
import * as XLSX from 'xlsx';
function cleanImagePath(img) {
    const match = img.match(/(?:.*\/)?([^\/]+\.png|jpg|jpeg|webp)/i);
    return match ? match[1] : img;
}
const equipmentNames = categories.flatMap(cat => cat.subcategories?.map(sub => sub.name) || []);
export default function SellEquipment() {
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        model: '',
        category: '',
        type: '',
        year: new Date().getFullYear(),
        price: '',
        condition: 'used',
        description: '',
        specifications: {
            weight: '',
            dimensions: {
                length: '',
                width: '',
                height: ''
            },
            power: {
                value: '',
                unit: 'kW'
            },
            operatingCapacity: {
                value: '',
                unit: 'kg'
            },
            workingWeight: ''
        }
    });
    // 🔁 Import Excel vers n8n
    const [excelFile, setExcelFile] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [imagesExcelUpload, setImagesExcelUpload] = useState([]);
    const [detectedImageLinks, setDetectedImageLinks] = useState([]);
    const [showImportSection, setShowImportSection] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const handleExcelFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            alert('Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV');
            return;
        }
        setExcelFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                setExcelData(jsonData);
                // Détecter automatiquement les liens d'images
                const imageLinks = [];
                if (jsonData && jsonData.length > 0) {
                    const firstRow = jsonData[0];
                    const imageColumns = Object.keys(firstRow).filter(key => key.toLowerCase().includes('image') ||
                        key.toLowerCase().includes('photo') ||
                        key.toLowerCase().includes('img') ||
                        key.toLowerCase().includes('url'));
                    console.log("🖼️ Colonnes d'images détectées:", imageColumns);
                    jsonData.forEach((row, index) => {
                        const typedRow = row;
                        imageColumns.forEach(col => {
                            const value = typedRow[col];
                            if (value && typeof value === 'string') {
                                // Vérifier si c'est un lien d'image valide
                                if (value.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
                                    value.startsWith('http') ||
                                    value.startsWith('https')) {
                                    imageLinks.push(value);
                                    console.log(`🖼️ Lien d'image trouvé dans ligne ${index + 1}, colonne ${col}:`, value);
                                }
                            }
                        });
                    });
                }
                setDetectedImageLinks(imageLinks);
                console.log(`🔗 ${imageLinks.length} lien(s) d'image(s) détecté(s) dans le fichier Excel`);
            }
            catch (error) {
                console.error('Erreur lors de la lecture du fichier Excel:', error);
                alert('Erreur lors de la lecture du fichier Excel');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    const handleExcelImagesUpload = (e) => {
        if (!e.target.files)
            return;
        const files = Array.from(e.target.files);
        const newImages = files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setImagesExcelUpload(prev => [...prev, ...newImages]);
    };
    const removeExcelImage = (index) => {
        setImagesExcelUpload(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview || '');
            newImages.splice(index, 1);
            return newImages;
        });
    };
    const handleExcelSubmit = async () => {
        if (!excelFile) {
            alert("Veuillez sélectionner un fichier Excel");
            return;
        }
        setIsImporting(true);
        try {
            // Récupérer l'utilisateur connecté
            console.log("🔍 Tentative de récupération de l'utilisateur...");
            const user = await getCurrentUser();
            console.log("👤 Utilisateur récupéré:", user);
            console.log("🆔 ID de l'utilisateur:", user?.id);
            console.log("🆔 Type de l'ID:", typeof user?.id);
            console.log("🆔 ID est truthy:", !!user?.id);
            if (!user) {
                alert("Vous devez être connecté pour importer des machines.");
                setIsImporting(false);
                return;
            }
            if (!user.id) {
                console.error("❌ L'utilisateur n'a pas d'ID !");
                console.error("❌ Détails de l'utilisateur:", JSON.stringify(user, null, 2));
                alert("Erreur : Impossible de récupérer votre identifiant. Veuillez vous reconnecter.");
                setIsImporting(false);
                return;
            }
            // Analyser les données Excel pour détecter les liens d'images
            console.log("📊 Analyse des données Excel...");
            console.log("🖼️ Liens d'images déjà détectés:", detectedImageLinks);
            // 🔄 CONVERTIR LE FICHIER EXCEL EN BASE64
            console.log("🔄 Conversion du fichier Excel en base64...");
            const arrayBuffer = await excelFile.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            console.log("✅ Fichier converti en base64, taille:", base64.length);
            // Préparer les données JSON
            const jsonData = {
                excelFile: {
                    name: excelFile.name,
                    type: excelFile.type,
                    size: excelFile.size,
                    data: base64
                },
                sellerId: user.id,
                imageLinks: detectedImageLinks.length > 0 ? detectedImageLinks : [],
                // Les images uploadées seront traitées séparément si nécessaire
                metadata: {
                    sellerId: user.id,
                    userId: user.id,
                    userEmail: user.email,
                    timestamp: new Date().toISOString(),
                    totalMachines: excelData.length
                }
            };
            console.log("📦 Données JSON préparées:");
            console.log("  - Nom du fichier:", jsonData.excelFile.name);
            console.log("  - Taille:", jsonData.excelFile.size);
            console.log("  - SellerId:", jsonData.sellerId);
            console.log("  - SellerId dans metadata:", jsonData.metadata.sellerId);
            console.log("  - Liens d'images:", jsonData.imageLinks.length);
            console.log("  - Nombre de machines:", jsonData.metadata.totalMachines);
            // 🔍 DEBUG : Vérifier que le sellerId est bien dans les données JSON
            console.log("🔍 DEBUG - Vérification des données JSON:");
            console.log("🆔 SellerId dans JSON:", jsonData.sellerId);
            console.log("🆔 Type du sellerId:", typeof jsonData.sellerId);
            console.log("🆔 Égalité avec user.id:", jsonData.sellerId === user.id);
            console.log("🆔 JSON.stringify complet:", JSON.stringify(jsonData, null, 2));
            if (!jsonData.sellerId) {
                console.error("❌ CRITIQUE : Le sellerId n'est pas dans les données JSON !");
                console.error("❌ user.id original:", user.id);
                console.error("❌ Type user.id:", typeof user.id);
                alert("Erreur : Le sellerId n'a pas été ajouté aux données. Veuillez réessayer.");
                return;
            }
            console.log("🚀 Envoi vers n8n en JSON...");
            console.log("🚀 URL:", 'https://n8n.srv786179.hstgr.cloud/webhook/import_parc_excel');
            console.log("🚀 Headers:", {
                'Content-Type': 'application/json',
                'x-auth-token': 'minegrid-secret-token-2025'
            });
            // 🔍 DEBUG : Vérifier le body avant envoi
            const requestBody = JSON.stringify(jsonData);
            console.log("🚀 Body à envoyer (premiers 500 caractères):", requestBody.substring(0, 500));
            console.log("🚀 Body contient sellerId:", requestBody.includes('"sellerId"'));
            console.log("🚀 Body contient l'ID:", requestBody.includes(user.id));
            console.log("🚀 Nombre d'occurrences de sellerId:", (requestBody.match(/"sellerId"/g) || []).length);
            const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/import_parc_excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': 'minegrid-secret-token-2025'
                },
                body: requestBody,
            });
            // Lire le body une seule fois
            let rawText = await response.text();
            let data;
            try {
                data = JSON.parse(rawText);
            }
            catch {
                data = rawText;
            }
            console.log("📨 Réponse n8n :", data);
            console.log("📊 Status HTTP:", response.status);
            console.log("📊 Headers de réponse:", Object.fromEntries(response.headers.entries()));
            if (!response.ok) {
                let errorMsg = `Erreur lors de l'envoi des données (code HTTP ${response.status})`;
                errorMsg += `\nRéponse brute : ${rawText}`;
                alert(errorMsg);
                return;
            }
            alert('✅ Données envoyées avec succès ! Les annonces apparaîtront bientôt dans votre dashboard.');
            setExcelData([]);
            setImagesExcelUpload([]);
            setExcelFile(null);
            setShowImportSection(false);
        }
        catch (error) {
            console.error('❌ Erreur:', error);
            console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
            alert('Erreur lors de l\'envoi des données : ' + (error instanceof Error ? error.message : String(error)));
        }
        finally {
            setIsImporting(false);
        }
    };
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };
    // 🔄 Fonctionnalité de glisser-déposer pour les images
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    };
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            const remainingSlots = 8 - images.length;
            const filesToAdd = imageFiles.slice(0, remainingSlots);
            const newImages = filesToAdd.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...newImages]);
            if (imageFiles.length > remainingSlots) {
                alert(`Seules ${remainingSlots} image(s) ont été ajoutées. Maximum 8 images autorisées.`);
            }
        }
    };
    // 🔄 Fonctionnalité de glisser-déposer pour les images Excel
    const handleExcelDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    };
    const handleExcelDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    };
    const handleExcelDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    };
    const handleExcelDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            const remainingSlots = 10 - imagesExcelUpload.length;
            const filesToAdd = imageFiles.slice(0, remainingSlots);
            const newImages = filesToAdd.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }));
            setImagesExcelUpload(prev => [...prev, ...newImages]);
            if (imageFiles.length > remainingSlots) {
                alert(`Seules ${remainingSlots} image(s) ont été ajoutées. Maximum 10 images autorisées.`);
            }
        }
    };
    const removeImage = (index) => {
        setImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview || '');
            newImages.splice(index, 1);
            return newImages;
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await getCurrentUser();
            if (!user)
                throw new Error('Vous devez être connecté');
            const imagePaths = [];
            for (const image of images) {
                const rawName = image.name.split('/').pop() || image.name;
                const sanitized = rawName
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-zA-Z0-9._-]/g, '_');
                const fileName = `${Date.now()}_${sanitized}`;
                const { error } = await supabase.storage
                    .from('machine-image')
                    .upload(fileName, image, {
                    cacheControl: '3600',
                    upsert: false,
                });
                if (error) {
                    throw new Error('Échec du téléversement de l\'image : ' + error.message);
                }
                imagePaths.push(fileName);
            }
            const payload = {
                ...formData,
                sellerId: user.id,
                condition: formData.condition,
                images: imagePaths.map(cleanImagePath),
            };
            await publishMachine(payload, images);
            alert('Équipement publié avec succès !');
            window.location.hash = '#dashboard/annonces';
        }
        catch (err) {
            console.error(err);
            alert('Erreur lors de la publication : ' + err.message);
        }
    };
    return (_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: _jsxs("div", { className: "max-w-3xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "Mettre en vente un \u00E9quipement" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "text-xl font-semibold flex items-center", children: [_jsx(FileSpreadsheet, { className: "h-6 w-6 mr-2 text-blue-600" }), "PUBLICATION AUTOMATISEE DE VOTRE PARC DE MACHINES"] }), _jsxs("button", { type: "button", onClick: () => setShowImportSection(!showImportSection), className: "px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors", children: [showImportSection ? 'Masquer' : 'Afficher', " l'import Excel"] })] }), showImportSection && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Fichier Excel (.xlsx, .xls, .csv)" }), _jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center", children: [_jsx("input", { type: "file", accept: ".xlsx,.xls,.csv", onChange: handleExcelFileUpload, className: "hidden", id: "excel-upload" }), _jsxs("label", { htmlFor: "excel-upload", className: "cursor-pointer", children: [_jsx(Upload, { className: "h-8 w-8 text-gray-400 mx-auto mb-2" }), _jsx("span", { className: "text-sm text-gray-500", children: excelFile ? excelFile.name : 'Cliquez pour sélectionner un fichier Excel' })] }), excelFile && excelData.length > 0 && (_jsxs("div", { className: "mt-2 text-green-700 text-sm font-medium", children: ["Fichier charg\u00E9 avec succ\u00E8s", _jsx("br", {}), excelData.length, " machine", excelData.length > 1 ? 's' : '', " d\u00E9tect\u00E9e", excelData.length > 1 ? 's' : '', " dans le fichier"] }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Images pour l'import Excel" }), detectedImageLinks.length > 0 && (_jsxs("div", { className: "mb-4 p-4 bg-blue-50 rounded-lg", children: [_jsxs("h4", { className: "text-sm font-medium text-blue-800 mb-2", children: ["\uD83D\uDD17 Liens d'images d\u00E9tect\u00E9s dans le fichier Excel (", detectedImageLinks.length, ")"] }), _jsxs("div", { className: "space-y-1", children: [detectedImageLinks.slice(0, 5).map((link, index) => (_jsx("div", { className: "text-xs text-blue-600 truncate", children: link }, index))), detectedImageLinks.length > 5 && (_jsxs("div", { className: "text-xs text-blue-500", children: ["... et ", detectedImageLinks.length - 5, " autre(s)"] }))] })] })), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [imagesExcelUpload.map((image, index) => (_jsxs("div", { className: "relative aspect-square", children: [_jsx("img", { src: image.preview, alt: `Excel Image ${index + 1}`, className: "w-full h-full object-cover rounded-lg" }), _jsx("button", { type: "button", onClick: () => removeExcelImage(index), className: "absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600", children: _jsx(X, { className: "h-4 w-4" }) })] }, index))), imagesExcelUpload.length < 10 && (_jsxs("label", { className: "aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all relative group", onDragOver: handleExcelDragOver, onDragEnter: handleExcelDragEnter, onDragLeave: handleExcelDragLeave, onDrop: handleExcelDrop, children: [_jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handleExcelImagesUpload, className: "hidden" }), _jsx("div", { className: "absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" }), _jsx(Camera, { className: "h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" }), _jsxs("span", { className: "mt-2 text-sm text-gray-500 text-center px-4", children: [_jsx("span", { className: "font-medium", children: "Glissez-d\u00E9posez vos images ici" }), _jsx("br", {}), _jsx("span", { className: "text-xs", children: "ou cliquez pour s\u00E9lectionner" })] }), _jsxs("span", { className: "mt-1 text-xs text-gray-400", children: [10 - imagesExcelUpload.length, " emplacements restants"] })] }))] }), _jsxs("p", { className: "mt-2 text-sm text-gray-500 flex items-center", children: [_jsx(Info, { className: "h-4 w-4 mr-1" }), detectedImageLinks.length > 0
                                                            ? `Images détectées dans le fichier Excel + images uploadées optionnelles`
                                                            : `Ajoutez des images optionnelles ou incluez des liens d'images dans votre fichier Excel`] })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "button", onClick: handleExcelSubmit, disabled: isImporting || !excelData.length, className: "px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed", children: isImporting ? 'Envoi en cours...' : 'Envoyer' }) })] }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Photos de l'\u00E9quipement" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [images.map((image, index) => (_jsxs("div", { className: "relative aspect-square", children: [_jsx("img", { src: image.preview, alt: `Preview ${index + 1}`, className: "w-full h-full object-cover rounded-lg" }), _jsx("button", { type: "button", onClick: () => removeImage(index), className: "absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600", children: _jsx(X, { className: "h-4 w-4" }) })] }, index))), images.length < 8 && (_jsxs("label", { className: "aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all relative group", onDragOver: handleDragOver, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDrop: handleDrop, children: [_jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handleImageUpload, className: "hidden" }), _jsx("div", { className: "absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" }), _jsx(Camera, { className: "h-8 w-8 text-gray-400 group-hover:text-primary-500 transition-colors" }), _jsxs("span", { className: "mt-2 text-sm text-gray-500 text-center px-4", children: [_jsx("span", { className: "font-medium", children: "Glissez-d\u00E9posez vos photos ici" }), _jsx("br", {}), _jsx("span", { className: "text-xs", children: "ou cliquez pour s\u00E9lectionner" })] }), _jsxs("span", { className: "mt-1 text-xs text-gray-400", children: [8 - images.length, " emplacements restants"] })] }))] }), _jsxs("p", { className: "mt-2 text-sm text-gray-500 flex items-center", children: [_jsx(Info, { className: "h-4 w-4 mr-1" }), "Ajoutez jusqu'\u00E0 8 photos de haute qualit\u00E9"] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Informations g\u00E9n\u00E9rales" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Cat\u00E9gorie de machine" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm", children: [_jsx("option", { value: "", children: "S\u00E9lectionner une cat\u00E9gorie" }), categories.map((cat) => (_jsx("option", { value: cat.name, children: cat.name }, cat.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Nom de l'\u00E9quipement" }), _jsxs("select", { value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500", required: true, children: [_jsx("option", { value: "", children: "S\u00E9lectionner un type" }), equipmentNames.map((name) => (_jsx("option", { value: name, children: name }, name)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Marque" }), _jsxs("select", { value: formData.brand, onChange: (e) => setFormData({ ...formData, brand: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500", required: true, children: [_jsx("option", { value: "", children: "S\u00E9lectionner une marque" }), brands.map((brand) => (_jsx("option", { value: brand, children: brand }, brand)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Mod\u00E8le" }), _jsx("input", { type: "text", value: formData.model, onChange: (e) => setFormData({ ...formData, model: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Cat\u00E9gorie" }), _jsxs("select", { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500", required: true, children: [_jsx("option", { value: "", children: "S\u00E9lectionner un secteur" }), _jsx("option", { value: "Transport", children: "Transport" }), _jsx("option", { value: "Terrassement", children: "Terrassement" }), _jsx("option", { value: "Forage", children: "Forage" }), _jsx("option", { value: "Voirie", children: "Voirie" }), _jsx("option", { value: "Maintenance & Levage", children: "Maintenance & Levage" }), _jsx("option", { value: "Construction", children: "Construction" }), _jsx("option", { value: "Mines", children: "Mines" }), _jsx("option", { value: "Outils & Accessoires", children: "Outils & Accessoires" }), _jsx("option", { value: "Pi\u00E8ces d\u00E9tach\u00E9es", children: "Pi\u00E8ces d\u00E9tach\u00E9es" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Ann\u00E9e" }), _jsx("input", { type: "number", value: formData.year, onChange: (e) => setFormData({ ...formData, year: parseInt(e.target.value) }), min: "1900", max: new Date().getFullYear(), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Prix (\u20AC)" }), _jsx("input", { type: "number", value: formData.price, onChange: (e) => setFormData({ ...formData, price: e.target.value }), min: "0", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u00C9tat" }), _jsxs("select", { value: formData.condition, onChange: (e) => setFormData({ ...formData, condition: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500", required: true, children: [_jsx("option", { value: "new", children: "Neuf" }), _jsx("option", { value: "used", children: "Occasion" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Sp\u00E9cifications techniques" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Poids (kg)" }), _jsx("input", { type: "number", value: formData.specifications.weight, onChange: (e) => setFormData({
                                                        ...formData,
                                                        specifications: {
                                                            ...formData.specifications,
                                                            weight: e.target.value
                                                        }
                                                    }), min: "0", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Dimensions (m)" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx("input", { type: "number", placeholder: "Longueur", value: formData.specifications.dimensions.length, onChange: (e) => setFormData({
                                                                ...formData,
                                                                specifications: {
                                                                    ...formData.specifications,
                                                                    dimensions: {
                                                                        ...formData.specifications.dimensions,
                                                                        length: e.target.value
                                                                    }
                                                                }
                                                            }), step: "0.01", min: "0", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" }), _jsx("input", { type: "number", placeholder: "Largeur", value: formData.specifications.dimensions.width, onChange: (e) => setFormData({
                                                                ...formData,
                                                                specifications: {
                                                                    ...formData.specifications,
                                                                    dimensions: {
                                                                        ...formData.specifications.dimensions,
                                                                        width: e.target.value
                                                                    }
                                                                }
                                                            }), step: "0.01", min: "0", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" }), _jsx("input", { type: "number", placeholder: "Hauteur", value: formData.specifications.dimensions.height, onChange: (e) => setFormData({
                                                                ...formData,
                                                                specifications: {
                                                                    ...formData.specifications,
                                                                    dimensions: {
                                                                        ...formData.specifications.dimensions,
                                                                        height: e.target.value
                                                                    }
                                                                }
                                                            }), step: "0.01", min: "0", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Puissance" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("input", { type: "number", value: formData.specifications.power.value, onChange: (e) => setFormData({
                                                                ...formData,
                                                                specifications: {
                                                                    ...formData.specifications,
                                                                    power: {
                                                                        ...formData.specifications.power,
                                                                        value: e.target.value
                                                                    }
                                                                }
                                                            }), min: "0", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", required: true }), _jsxs("select", { value: formData.specifications.power.unit, onChange: (e) => setFormData({
                                                                ...formData,
                                                                specifications: {
                                                                    ...formData.specifications,
                                                                    power: {
                                                                        ...formData.specifications.power,
                                                                        unit: e.target.value
                                                                    }
                                                                }
                                                            }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", children: [_jsx("option", { value: "kW", children: "kW" }), _jsx("option", { value: "CV", children: "CV" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Capacit\u00E9 op\u00E9rationnelle" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("input", { type: "number", value: formData.specifications.operatingCapacity.value, onChange: (e) => setFormData({
                                                                ...formData,
                                                                specifications: {
                                                                    ...formData.specifications,
                                                                    operatingCapacity: {
                                                                        ...formData.specifications.operatingCapacity,
                                                                        value: e.target.value
                                                                    }
                                                                }
                                                            }), min: "0", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" }), _jsxs("select", { value: formData.specifications.operatingCapacity.unit, onChange: (e) => setFormData({
                                                                ...formData,
                                                                specifications: {
                                                                    ...formData.specifications,
                                                                    operatingCapacity: {
                                                                        ...formData.specifications.operatingCapacity,
                                                                        unit: e.target.value
                                                                    }
                                                                }
                                                            }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", children: [_jsx("option", { value: "kg", children: "kg" }), _jsx("option", { value: "m3", children: "m\u00B3" })] })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Description d\u00E9taill\u00E9e" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), rows: 6, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500", placeholder: "D\u00E9crivez en d\u00E9tail l'\u00E9tat, l'historique et les caract\u00E9ristiques particuli\u00E8res de votre \u00E9quipement...", required: true })] }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx("button", { type: "button", className: "px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50", children: "Enregistrer en brouillon" }), _jsx("button", { type: "submit", className: "px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "Publier l'annonce" })] })] })] }) }));
}
