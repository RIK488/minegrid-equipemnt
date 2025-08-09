import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Move } from 'lucide-react';
const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 100 }); // Position plus haute par défaut
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Bonjour ! Je suis l'assistant virtuel de Minegrid Équipement. Comment puis-je vous aider ?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const widgetRef = useRef(null);
    // Auto-scroll vers le bas quand de nouveaux messages sont ajoutés
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    // Focus sur l'input quand la fenêtre s'ouvre
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen, isMinimized]);
    // Gestion du glisser-déposer
    const handleMouseDown = (e) => {
        if (e.target && e.target.closest('button, input, textarea'))
            return; // Ne pas activer le drag sur les éléments interactifs
        setIsDragging(true);
        const rect = widgetRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };
    const handleMouseMove = (e) => {
        if (!isDragging)
            return;
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        // Limiter la position aux bords de l'écran
        const maxX = window.innerWidth - (isOpen ? 384 : 56); // Largeur du widget
        const maxY = window.innerHeight - (isOpen ? 384 : 56); // Hauteur du widget
        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    };
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    // Ajouter les event listeners pour le drag global
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }
        else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, dragOffset]);
    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading)
            return;
        const userMessage = {
            id: Date.now(),
            text: inputMessage.trim(),
            isUser: true,
            timestamp: new Date()
        };
        console.log('🚀 Envoi du message:', userMessage.text);
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        try {
            console.log('📡 Tentative de connexion à l\'API...');
            console.log('🔗 URL:', 'https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes de timeout
            const requestBody = {
                message: userMessage.text
            };
            console.log('📦 Body envoyé:', requestBody);
            const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log('📊 Status de la réponse:', response.status);
            console.log('📊 Headers de la réponse:', Object.fromEntries(response.headers.entries()));
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erreur HTTP:', response.status, errorText);
                throw new Error(`Erreur HTTP ${response.status}: La réponse du serveur est vide ou erronée.`);
            }
            // Lire le body une seule fois
            const raw = await response.text();
            console.log('📄 Réponse brute:', raw);
            
            let data;
            try {
                data = JSON.parse(raw); // ← si n8n renvoie du JSON (recommandé)
                console.log('📦 Données JSON reçues:', data);
            } catch (e) {
                console.log('⚠️ Réponse non-JSON, tentative de parsing manuel...');
                
                // nettoie et tente de parser quand même
                let cleaned = raw.trim().replace(/^=\s*/, '');
                
                // Nettoyage supplémentaire pour les réponses avec double préfixe
                if (cleaned.includes('"response":"=')) {
                    cleaned = cleaned.replace('"response":"=', '"response":"');
                }
                
                // Nettoyage des retours à la ligne dans la réponse
                cleaned = cleaned.replace(/\\n/g, ' ');
                try { 
                    data = JSON.parse(cleaned); 
                    console.log('✅ Parsing manuel réussi:', data);
                } catch (parseError) { 
                    console.log('❌ Parsing manuel échoué, utilisation du texte brut');
                    data = { response: cleaned }; 
                }
            }

            // Extraction simple de la réponse
            let botResponseText;
            
            console.log('🔍 Données reçues pour extraction:', data);
            console.log('🔍 Type de données:', typeof data);
            console.log('🔍 Est un tableau?', Array.isArray(data));
            
            // Gestion du format tableau de n8n
            if (Array.isArray(data) && data.length > 0) {
                console.log('📦 Traitement tableau - Premier élément:', data[0]);
                botResponseText = data[0]?.response ?? String(data[0] ?? 'Je n\'ai pas pu traiter votre demande. Veuillez réessayer.');
            } else {
                console.log('📦 Traitement objet simple:', data);
                botResponseText = data?.response ?? String(data ?? 'Je n\'ai pas pu traiter votre demande. Veuillez réessayer.');
            }
            
            console.log('💬 Texte extrait:', botResponseText);
            
            // Vérification finale pour éviter les messages d'erreur techniques
            console.log('🔍 Vérification finale - Texte avant filtrage:', botResponseText);
            
            if (botResponseText.includes('Erreur de parsing') || 
                botResponseText.includes('Format de réponse') || 
                botResponseText.includes('JSON') ||
                botResponseText.includes('[object Object]')) {
                console.log('⚠️ Message d\'erreur technique détecté, remplacement par message générique');
                botResponseText = "Bonjour ! Je suis l'assistant virtuel de Minegrid Équipement. Comment puis-je vous aider ?";
            }
            
            console.log('✅ Texte final à afficher:', botResponseText);
            const botMessage = {
                id: Date.now() + 1,
                text: botResponseText,
                isUser: false,
                timestamp: new Date()
            };
            console.log('💬 Message du bot:', botMessage.text);
            setMessages(prev => [...prev, botMessage]);
        }
        catch (error) {
            console.error('❌ Erreur détaillée:', error);
            console.error('❌ Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('❌ Message d\'erreur:', error instanceof Error ? error.message : String(error));
            let errorText = "Désolé, une erreur s'est produite. Veuillez réessayer.";
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorText = "Le serveur a mis trop de temps à répondre. Veuillez réessayer.";
                }
                else if (error.message.includes('Failed to fetch')) {
                    errorText = "Erreur de connexion. Vérifiez votre connexion internet ou que le serveur est bien en ligne.";
                }
            }
            const errorMessage = {
                id: Date.now() + 1,
                text: errorText,
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    const toggleChat = () => {
        if (isOpen && isMinimized) {
            setIsMinimized(false);
        }
        else if (isOpen) {
            setIsOpen(false);
            setIsMinimized(false); // Reset l'état minimisé quand on ferme
        }
        else {
            setIsOpen(true);
            setIsMinimized(false);
        }
    };
    const minimizeChat = () => {
        setIsMinimized(true);
    };
    const closeChat = () => {
        setIsOpen(false);
        setIsMinimized(false); // Reset l'état minimisé quand on ferme
    };
    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (_jsxs("div", { ref: widgetRef, className: "fixed z-50", style: {
            left: `${position.x}px`,
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'default'
        }, children: [!isOpen && (_jsxs("button", { onClick: toggleChat, className: "w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group", "aria-label": "Ouvrir le chat", children: [_jsx(MessageCircle, { className: "w-6 h-6" }), _jsx("div", { className: "absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" })] })), isOpen && (_jsxs("div", { className: `bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${isMinimized ? 'w-80 h-12' : 'w-96 h-96'}`, onMouseDown: handleMouseDown, children: [_jsxs("div", { className: "bg-orange-600 text-white p-4 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Move, { className: "w-4 h-4 opacity-70" }), _jsx(MessageCircle, { className: "w-5 h-5" }), _jsx("span", { className: "font-semibold", children: "Assistant Virtuel" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: async () => {
                                            console.log('🧪 Test de connexion à l\'API...');
                                            try {
                                                const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ message: 'test' })
                                                });
                                                console.log('✅ Test réussi - Status:', response.status);
                                                alert(`Test de connexion réussi ! Status: ${response.status}`);
                                            }
                                            catch (error) {
                                                console.error('❌ Test échoué:', error);
                                                alert(`Test de connexion échoué: ${error instanceof Error ? error.message : String(error)}`);
                                            }
                                        }, className: "hover:bg-orange-700 p-1 rounded transition-colors text-xs", title: "Tester la connexion", children: "\uD83E\uDDEA" }), _jsx("button", { onClick: minimizeChat, className: "hover:bg-orange-700 p-1 rounded transition-colors", "aria-label": "R\u00E9duire", children: isMinimized ? _jsx(Maximize2, { className: "w-4 h-4" }) : _jsx(Minimize2, { className: "w-4 h-4" }) }), _jsx("button", { onClick: closeChat, className: "hover:bg-orange-700 p-1 rounded transition-colors", "aria-label": "Fermer", children: _jsx(X, { className: "w-4 h-4" }) })] })] }), !isMinimized && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "h-80 overflow-y-auto p-4 space-y-4 bg-gray-50", children: [messages.map((message) => (_jsx("div", { className: `flex ${message.isUser ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isUser
                                                ? 'bg-orange-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`, children: [_jsx("p", { className: "text-sm", children: message.text }), _jsx("p", { className: `text-xs mt-1 ${message.isUser ? 'text-orange-100' : 'text-gray-500'}`, children: formatTime(message.timestamp) })] }) }, message.id))), isLoading && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2", children: _jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }) }) })), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "p-4 border-t border-gray-200 bg-white rounded-b-lg", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("input", { ref: inputRef, type: "text", value: inputMessage, onChange: (e) => setInputMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: "Tapez votre message...", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent", disabled: isLoading }), _jsx("button", { onClick: sendMessage, disabled: !inputMessage.trim() || isLoading, className: "px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center", children: _jsx(Send, { className: "w-4 h-4" }) })] }) })] }))] }))] }));
};
export default ChatWidget;
