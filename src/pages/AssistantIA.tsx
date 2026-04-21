import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  FileText, 
  MessageSquare, 
  DollarSign,
  Settings,
  Sparkles,
  Copy,
  Download,
  Loader2
} from 'lucide-react';
import supabase from '../utils/supabaseClient';
import { toast } from '../utils/toast';
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'chat' | 'fiche' | 'reponse' | 'devis';
}

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

export default function AssistantIA() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiTools: AITool[] = [
    {
      id: 'fiche-machine',
      name: 'Générateur de fiche machine',
      description: 'Créez des fiches techniques détaillées pour vos équipements',
      icon: <FileText className="h-5 w-5" />,
      prompt: 'Génère une fiche technique complète pour une machine avec les spécifications suivantes : '
    },
    {
      id: 'reponse-client',
      name: 'Assistant réponses client',
      description: 'Générez des réponses professionnelles aux demandes clients',
      icon: <MessageSquare className="h-5 w-5" />,
      prompt: 'Aide-moi à rédiger une réponse professionnelle à cette demande client : '
    },
    {
      id: 'devis-automatique',
      name: 'Générateur de devis',
      description: 'Créez des devis automatiques basés sur les spécifications',
      icon: <DollarSign className="h-5 w-5" />,
      prompt: 'Génère un devis détaillé pour cette demande : '
    },
    {
      id: 'analyse-technique',
      name: 'Analyse technique',
      description: 'Analysez les spécifications techniques et obtenez des recommandations',
      icon: <Settings className="h-5 w-5" />,
      prompt: 'Analyse ces spécifications techniques et donne-moi des recommandations : '
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (content: string, role: 'user' | 'assistant', type?: Message['type']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateAIResponse = async (userMessage: string, tool?: AITool) => {
    setIsLoading(true);
    
    // Simulation d'un délai d'IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    let response = '';
    if (tool) {
      switch (tool.id) {
        case 'fiche-machine':
          response = `📋 **FICHE TECHNIQUE GÉNÉRÉE**

**Spécifications principales :**
- Marque et modèle : [À compléter selon vos spécifications]
- Année de fabrication : [À compléter]
- Puissance moteur : [À compléter] HP
- Poids opérationnel : [À compléter] kg
- Capacité de travail : [À compléter]

**Caractéristiques techniques :**
- Type de transmission : [À compléter]
- Système hydraulique : [À compléter]
- Consommation : [À compléter] L/h
- Dimensions : [À compléter] m

**Maintenance recommandée :**
- Vidange huile moteur : Tous les 250h
- Filtres à air : Tous les 500h
- Graissage : Tous les 50h

**Points d'attention :**
- Vérifier régulièrement les niveaux d'huile
- Contrôler l'état des chenilles/roues
- Surveiller les fuites hydrauliques

*Cette fiche a été générée automatiquement. Veuillez vérifier et ajuster les informations selon vos spécifications exactes.*`;
          break;
        case 'reponse-client':
          response = `💼 **RÉPONSE CLIENT SUGGÉRÉE**

Bonjour,

Merci pour votre demande concernant [sujet de la demande].

Nous avons bien noté votre intérêt pour [produit/service] et nous sommes ravis de pouvoir vous accompagner dans votre projet.

**Notre proposition :**
[Proposition détaillée basée sur la demande]

**Prochaines étapes :**
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Contact :**
N'hésitez pas à nous contacter pour toute question supplémentaire :
- Téléphone : [Votre numéro]
- Email : [Votre email]

Nous restons à votre disposition pour toute information complémentaire.

Cordialement,
[Votre nom]
[Votre entreprise]`;
          break;
        case 'devis-automatique':
          response = `💰 **DEVIS AUTOMATIQUE GÉNÉRÉ**

**DEVIS N° [NUMÉRO]**
Date : ${new Date().toLocaleDateString('fr-FR')}

**Client :** [Nom du client]
**Projet :** [Description du projet]

**Détail des prestations :**

1. **Équipement principal :** [Description]
   - Quantité : [Nombre]
   - Prix unitaire : [Prix] €
   - Total : [Total] €

2. **Services associés :** [Description]
   - Quantité : [Nombre]
   - Prix unitaire : [Prix] €
   - Total : [Total] €

**Récapitulatif :**
- Sous-total : [Montant] €
- TVA (20%) : [Montant] €
- **Total TTC : [Montant] €**

**Conditions :**
- Validité : 30 jours
- Délai de livraison : [Délai]
- Modalités de paiement : [Conditions]

*Ce devis a été généré automatiquement. Veuillez le personnaliser selon vos besoins.*`;
          break;
        case 'analyse-technique':
          response = `🔧 **ANALYSE TECHNIQUE**

**Évaluation des spécifications :**

✅ **Points forts identifiés :**
- [Point fort 1]
- [Point fort 2]
- [Point fort 3]

⚠️ **Points d'attention :**
- [Point d'attention 1]
- [Point d'attention 2]

**Recommandations :**
1. **Optimisation :** [Recommandation 1]
2. **Maintenance :** [Recommandation 2]
3. **Sécurité :** [Recommandation 3]

**Estimation des coûts :**
- Coût d'exploitation estimé : [Montant] €/h
- Coût de maintenance annuel : [Montant] €
- ROI estimé : [Pourcentage]%

**Conclusion :**
[Conclusion basée sur l'analyse]

*Cette analyse est basée sur les informations fournies. Une inspection physique est recommandée.*`;
          break;
        default:
          response = `🤖 **RÉPONSE DE L'ASSISTANT IA**

Je comprends votre demande concernant "${userMessage}".

Voici ma réponse basée sur les meilleures pratiques du secteur :

[Contenu de la réponse générée automatiquement]

**Suggestions supplémentaires :**
- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]

N'hésitez pas à me poser des questions plus spécifiques pour obtenir des réponses plus précises !`;
      }
    } else {
      response = `🤖 **RÉPONSE DE L'ASSISTANT IA**

Bonjour ! Je suis votre assistant IA spécialisé dans le secteur des équipements industriels.

Je peux vous aider avec :
- 📋 Génération de fiches techniques
- 💼 Rédaction de réponses clients
- 💰 Création de devis automatiques
- 🔧 Analyse technique

Que puis-je faire pour vous aujourd'hui ?`;
    }

    setIsLoading(false);
    addMessage(response, 'assistant', tool?.id as Message['type']);
    setGeneratedContent(response);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage(userMessage, 'user');

    const tool = aiTools.find(t => activeTool === t.id);
    await simulateAIResponse(userMessage, tool);
  };

  const handleToolSelect = (tool: AITool) => {
    setActiveTool(tool.id);
    addMessage(`J'ai activé l'outil "${tool.name}". ${tool.prompt}`, 'assistant', tool.id as Message['type']);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Contenu copié dans le presse-papiers !');
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <a 
                href="#dashboard-entreprise-display"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                Assistant IA
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-gray-600">IA spécialisée équipements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Outils IA */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Outils IA</h2>
              <div className="space-y-3">
                {aiTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool)}
                    className={`w-full p-4 rounded-lg border transition-colors text-left ${
                      activeTool === tool.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activeTool === tool.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{tool.name}</h3>
                        <p className="text-sm text-gray-600">{tool.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat IA */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
              {/* Header du chat */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Bot className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Assistant IA</h3>
                    <p className="text-sm text-gray-600">
                      {activeTool ? `Outil actif : ${aiTools.find(t => t.id === activeTool)?.name}` : 'Prêt à vous aider'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Bienvenue ! Je suis votre assistant IA.</p>
                    <p className="text-sm">Sélectionnez un outil ou posez-moi une question.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot className="h-4 w-4 mt-1 text-orange-600 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            <div className="text-xs mt-2 opacity-70">
                              {message.timestamp.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                        <span>L'assistant réfléchit...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Posez votre question..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions sur le contenu généré */}
            {generatedContent && (
              <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">Contenu généré</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedContent)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center text-sm"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copier
                    </button>
                    <button
                      onClick={() => downloadContent(generatedContent, 'contenu-ia.txt')}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors flex items-center text-sm"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Télécharger
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 