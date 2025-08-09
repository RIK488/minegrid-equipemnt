import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Move } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Position {
  x: number;
  y: number;
}

interface DragOffset {
  x: number;
  y: number;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 100 }); // Position plus haute par défaut
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! Je suis l'assistant virtuel de Minegrid Équipement. Comment puis-je vous aider ?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas quand de nouveaux messages sont ajoutés
  const scrollToBottom = (): void => {
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
  const handleMouseDown = (e: React.MouseEvent): void => {
    if (e.target && (e.target as Element).closest('button, input, textarea')) return; // Ne pas activer le drag sur les éléments interactifs
    
    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging) return;

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

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  // Ajouter les event listeners pour le drag global
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
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

  const sendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
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
      
      // Gestion du format tableau de n8n
      if (Array.isArray(data) && data.length > 0) {
        botResponseText = data[0]?.response ?? String(data[0] ?? 'Je n\'ai pas pu traiter votre demande. Veuillez réessayer.');
      } else {
        botResponseText = data?.response ?? String(data ?? 'Je n\'ai pas pu traiter votre demande. Veuillez réessayer.');
      }
      
      // Vérification finale pour éviter les messages d'erreur techniques
      if (botResponseText.includes('Erreur de parsing') || 
          botResponseText.includes('Format de réponse') || 
          botResponseText.includes('JSON') ||
          botResponseText.includes('[object Object]')) {
        console.log('⚠️ Message d\'erreur technique détecté, remplacement par message générique');
        botResponseText = "Bonjour ! Je suis l'assistant virtuel de Minegrid Équipement. Comment puis-je vous aider ?";
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponseText,
        isUser: false,
        timestamp: new Date()
      };

      console.log('💬 Message du bot:', botMessage.text);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Erreur détaillée:', error);
      console.error('❌ Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ Message d\'erreur:', error instanceof Error ? error.message : String(error));
      
      let errorText = "Désolé, une erreur s'est produite. Veuillez réessayer.";
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorText = "Le serveur a mis trop de temps à répondre. Veuillez réessayer.";
        } else if (error.message.includes('Failed to fetch')) {
          errorText = "Erreur de connexion. Vérifiez votre connexion internet ou que le serveur est bien en ligne.";
        }
      }
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: errorText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = (): void => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false); // Reset l'état minimisé quand on ferme
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const minimizeChat = (): void => {
    setIsMinimized(true);
  };

  const closeChat = (): void => {
    setIsOpen(false);
    setIsMinimized(false); // Reset l'état minimisé quand on ferme
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      ref={widgetRef}
      className="fixed z-50"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Bulle de chat flottante */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <div 
          className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
            isMinimized ? 'w-80 h-12' : 'w-96 h-96'
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Header avec zone de drag */}
          <div className="bg-orange-600 text-white p-4 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing">
            <div className="flex items-center space-x-2">
              <Move className="w-4 h-4 opacity-70" />
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Assistant Virtuel</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  console.log('🧪 Test de connexion à l\'API...');
                  try {
                    const response = await fetch('https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message: 'test' })
                    });
                    console.log('✅ Test réussi - Status:', response.status);
                    alert(`Test de connexion réussi ! Status: ${response.status}`);
                  } catch (error) {
                    console.error('❌ Test échoué:', error);
                    alert(`Test de connexion échoué: ${error instanceof Error ? error.message : String(error)}`);
                  }
                }}
                className="hover:bg-orange-700 p-1 rounded transition-colors text-xs"
                title="Tester la connexion"
              >
                🧪
              </button>
              <button
                onClick={minimizeChat}
                className="hover:bg-orange-700 p-1 rounded transition-colors"
                aria-label="Réduire"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={closeChat}
                className="hover:bg-orange-700 p-1 rounded transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenu du chat */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isUser
                          ? 'bg-orange-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.isUser ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Indicateur de chargement */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget; 