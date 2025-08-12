# 🔧 CONFIGURATION COMPLÈTE - INTÉGRATION AGENTS IA

## 🎯 **GUIDE D'INTÉGRATION DIRECTE AU SITE MINEGRID**

Cette configuration vous permet de connecter immédiatement les agents IA à votre site existant.

---

## 📋 **1. CONFIGURATION N8N - WORKFLOWS À IMPORTER**

### **🤖 Assistant Virtuel Enrichi**

**URL Webhook** : `https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel_enrichi`

**Fichier à importer** : `n8n-workflow-assistant-virtuel-enrichi.json`

```bash
# Étapes d'import dans N8N :
1. Ouvrir N8N : https://n8n.srv786179.hstgr.cloud
2. Cliquer "New Workflow"
3. Menu "..." → "Import from File"
4. Sélectionner le fichier JSON
5. Activer le workflow (bouton "Active")
```

### **📊 Agent Analyse Prédictive**

**URL Webhook** : `https://n8n.srv786179.hstgr.cloud/webhook/analyse_predictive`

**Fichier à importer** : `n8n-workflow-analyse-predictive.json`

### **🔧 Auto-Specs Existant (À Enrichir)**

**URL Webhook** : `https://n8n.srv786179.hstgr.cloud/webhook/auto_specs`

**Fichier existant** : `n8n-workflow-auto-specs-complet.json` (déjà actif)

---

## 🗄️ **2. CONFIGURATION BASE DE DONNÉES SUPABASE**

### **Tables IA à Créer**

```sql
-- 1. Table conversations IA
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  intent TEXT,
  language TEXT DEFAULT 'fr',
  confidence DECIMAL(3,2),
  context JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Table résultats analyses prédictives
CREATE TABLE IF NOT EXISTS ai_analysis_results (
  id TEXT PRIMARY KEY,
  analysis_type TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  status TEXT DEFAULT 'pending',
  results JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Table métriques IA
CREATE TABLE IF NOT EXISTS ai_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  execution_time_ms INTEGER,
  confidence_score DECIMAL(3,2),
  user_satisfaction DECIMAL(3,2),
  success_rate DECIMAL(3,2),
  error_count INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Index pour performances
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_requested_by ON ai_analysis_results(requested_by);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_date ON ai_metrics(date);

-- 5. RLS Policies
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_metrics ENABLE ROW LEVEL SECURITY;

-- Politique pour conversations
CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Politique pour analyses
CREATE POLICY "Users can view their own analyses" ON ai_analysis_results
  FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "Users can insert their own analyses" ON ai_analysis_results
  FOR INSERT WITH CHECK (auth.uid() = requested_by);
```

### **Script d'Exécution**

```bash
# Exécuter dans Supabase SQL Editor
# Ou utiliser le script suivant :
node execute-ai-database-setup.js
```

---

## 💻 **3. CONFIGURATION FRONTEND - SERVICES IA**

### **Service IA Principal**

```typescript
// src/services/aiService.ts
import { supabase } from '../utils/supabase';

export class AIService {
  private baseURL = 'https://n8n.srv786179.hstgr.cloud/webhook/';
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('ai_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ai_session_id', sessionId);
    }
    return sessionId;
  }

  private async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  private async getUserContext(): Promise<any> {
    const userId = await this.getUserId();
    if (!userId) return {};

    try {
      // Récupération profil utilisateur
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return {
        user_type: profile?.user_type || 'visiteur',
        subscription_type: profile?.subscription_type || 'basic',
        company: profile?.company_name,
        location: profile?.location
      };
    } catch {
      return { user_type: 'visiteur' };
    }
  }

  // 🤖 Assistant Virtuel Enrichi
  async enrichedChat(message: string, context?: any): Promise<any> {
    try {
      const userId = await this.getUserId();
      const userContext = await this.getUserContext();
      
      const payload = {
        message,
        user_id: userId,
        session_id: this.sessionId,
        context: {
          page: window.location.pathname,
          ...userContext,
          ...context
        }
      };

      console.log('🚀 Envoi à Assistant IA:', payload);

      const response = await fetch(`${this.baseURL}assistant_virtuel_enrichi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Réponse Assistant IA:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur Assistant IA:', error);
      throw error;
    }
  }

  // 📊 Analyse Prédictive
  async runPredictiveAnalysis(options: {
    analysis_type: string;
    date_range?: any;
    filters?: any;
  }): Promise<any> {
    try {
      const userId = await this.getUserId();
      const userContext = await this.getUserContext();

      const payload = {
        analysis_type: options.analysis_type,
        user_id: userId,
        business_unit: userContext.user_type,
        date_range: options.date_range || {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        filters: {
          notify: true,
          priority: 'normal',
          ...options.filters
        }
      };

      console.log('📊 Lancement analyse prédictive:', payload);

      const response = await fetch(`${this.baseURL}analyse_predictive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Résultat analyse:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur analyse prédictive:', error);
      throw error;
    }
  }

  // 🔧 Auto-Specs Enrichi (Utilise l'existant amélioré)
  async getEnrichedAutoSpecs(brand: string, model: string, context?: any): Promise<any> {
    try {
      const payload = {
        brand,
        model,
        schema: 'minegrid.auto_specs.v1',
        includeMissing: true,
        context: {
          source: 'frontend_enriched',
          timestamp: new Date().toISOString(),
          ...context
        }
      };

      console.log('🔧 Récupération specs enrichies:', payload);

      const response = await fetch(`${this.baseURL}auto_specs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Specs enrichies:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur specs enrichies:', error);
      throw error;
    }
  }

  // 📈 Métriques et Monitoring
  async trackAIUsage(feature: string, success: boolean, duration?: number): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const metric = {
        agent_type: feature,
        execution_time_ms: duration || 0,
        success_rate: success ? 1.0 : 0.0,
        user_satisfaction: success ? 0.8 : 0.3,
        error_count: success ? 0 : 1,
        metadata: {
          user_id: userId,
          timestamp: new Date().toISOString(),
          session_id: this.sessionId
        }
      };

      await supabase
        .from('ai_metrics')
        .insert(metric);
    } catch (error) {
      console.error('Erreur tracking métrique:', error);
    }
  }
}

// Instance globale
export const aiService = new AIService();
```

---

## 🔌 **4. INTÉGRATION CHAT WIDGET EXISTANT**

### **Modification ChatWidget.tsx**

```typescript
// src/components/ChatWidget.tsx - MODIFICATION EXISTANTE
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { aiService } from '../services/aiService';

// Interface Message mise à jour
interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestions?: string[];
  };
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Message de bienvenue IA enrichi
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        text: "👋 Bonjour ! Je suis votre assistant IA Minegrid. Comment puis-je vous aider aujourd'hui ?",
        isUser: false,
        timestamp: new Date(),
        metadata: {
          intent: 'greeting',
          confidence: 1.0,
          suggestions: [
            'Rechercher un équipement',
            'Demander un devis',
            'Assistance technique',
            'Informations sur les services'
          ]
        }
      };
      setMessages([welcomeMessage]);
      setSuggestions(welcomeMessage.metadata?.suggestions || []);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Envoi message avec IA enrichie
  const sendMessage = async (messageText?: string): Promise<void> => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setSuggestions([]);

    const startTime = Date.now();

    try {
      console.log('🚀 Envoi à IA enrichie:', textToSend);
      
      // Appel IA enrichie
      const aiResponse = await aiService.enrichedChat(textToSend, {
        equipment_id: getEquipmentIdFromPage(),
        page_type: getPageType()
      });

      const duration = Date.now() - startTime;
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse.response,
        isUser: false,
        timestamp: new Date(),
        metadata: {
          intent: aiResponse.metadata?.intent,
          confidence: aiResponse.metadata?.confidence,
          suggestions: aiResponse.suggestions?.actions
        }
      };

      setMessages(prev => [...prev, botMessage]);
      setSuggestions(aiResponse.suggestions?.actions || []);

      // Tracking métrique
      await aiService.trackAIUsage('chat_widget', true, duration);

    } catch (error) {
      console.error('❌ Erreur chat IA:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer ou contacter notre support ?",
        isUser: false,
        timestamp: new Date(),
        metadata: {
          intent: 'error',
          confidence: 0.0
        }
      };

      setMessages(prev => [...prev, errorMessage]);
      
      // Tracking erreur
      await aiService.trackAIUsage('chat_widget', false, Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  // Détection contexte page
  const getEquipmentIdFromPage = (): string | null => {
    const path = window.location.pathname;
    const match = path.match(/\/equipment\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const getPageType = (): string => {
    const path = window.location.pathname;
    if (path.includes('/equipment/')) return 'equipment_detail';
    if (path.includes('/search')) return 'search_results';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/services')) return 'services';
    return 'homepage';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg transition-colors duration-200 flex items-center justify-center group"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle size={24} />
          {/* Badge notification IA */}
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            IA
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200">
      {/* Header */}
      <div className="bg-orange-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <div>
            <h3 className="font-semibold">Assistant IA Minegrid</h3>
            <p className="text-xs opacity-90">En ligne • IA enrichie</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-orange-700 p-1 rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.isUser 
                ? 'bg-orange-600 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <div className="flex items-start gap-2">
                {!message.isUser && <Bot size={16} className="mt-1 flex-shrink-0" />}
                {message.isUser && <User size={16} className="mt-1 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.metadata?.confidence && (
                    <div className="text-xs opacity-70 mt-1">
                      Confiance: {Math.round(message.metadata.confidence * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none max-w-[80%]">
              <div className="flex items-center gap-2">
                <Bot size={16} />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">IA réfléchit...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions IA */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Suggestions IA :</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
```

---

## 📊 **5. INTÉGRATION DASHBOARD ENTREPRISE**

### **Widget Analyse Prédictive**

```typescript
// src/components/dashboard/widgets/PredictiveAnalyticsWidget.tsx
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { aiService } from '../../../services/aiService';

interface AnalysisResult {
  analysis_id: string;
  analysis_type: string;
  executive_summary: {
    overall_health_score: number;
    key_findings: any[];
    priority_actions: any[];
    confidence_level: number;
  };
  recommendations: {
    immediate_actions: any[];
    optimization_opportunities: any[];
  };
}

export const PredictiveAnalyticsWidget: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Auto-déclenchement analyse selon profil utilisateur
  useEffect(() => {
    loadDefaultAnalysis();
    
    // Auto-refresh toutes les 15 minutes
    const interval = setInterval(loadDefaultAnalysis, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDefaultAnalysis = async () => {
    try {
      setLoading(true);
      
      // Analyse pipeline commercial par défaut
      const result = await aiService.runPredictiveAnalysis({
        analysis_type: 'pipeline_commercial',
        filters: { priority: 'high' }
      });
      
      setAnalysis(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur analyse prédictive:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSpecificAnalysis = async (type: string) => {
    try {
      setLoading(true);
      
      const result = await aiService.runPredictiveAnalysis({
        analysis_type: type,
        filters: { priority: 'normal' }
      });
      
      setAnalysis(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur analyse spécifique:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analyse Prédictive IA</h3>
        </div>
        
        {lastUpdate && (
          <span className="text-xs text-gray-500">
            Mis à jour: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2 text-gray-600">Analyse en cours...</span>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-4">
          {/* Score de Santé Global */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Score de Santé</span>
              <span className={`text-2xl font-bold ${getHealthScoreColor(analysis.executive_summary.overall_health_score)}`}>
                {analysis.executive_summary.overall_health_score}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  analysis.executive_summary.overall_health_score >= 80 ? 'bg-green-600' :
                  analysis.executive_summary.overall_health_score >= 60 ? 'bg-orange-600' : 'bg-red-600'
                }`}
                style={{ width: `${analysis.executive_summary.overall_health_score}%` }}
              ></div>
            </div>
          </div>

          {/* Actions Prioritaires */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Actions Prioritaires
            </h4>
            <div className="space-y-2">
              {analysis.recommendations.immediate_actions.slice(0, 3).map((action, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded border-l-4 border-orange-600">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{action.action}</p>
                    <p className="text-xs text-gray-600">{action.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Clés */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Insights Clés
            </h4>
            <div className="space-y-2">
              {analysis.executive_summary.key_findings.slice(0, 2).map((finding, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{finding.title}</p>
                    <p className="text-xs text-gray-600">{finding.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'Action */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => runSpecificAnalysis('pipeline_commercial')}
              className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              Pipeline Commercial
            </button>
            <button
              onClick={() => runSpecificAnalysis('performance_equipements')}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Performance Équipements
            </button>
            <button
              onClick={() => runSpecificAnalysis('stock_optimisation')}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Optimisation Stock
            </button>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Cliquez sur "Analyser" pour commencer</p>
          <button
            onClick={loadDefaultAnalysis}
            className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Lancer l'Analyse IA
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 **6. AMÉLIORATION AUTO-SPECS EXISTANT**

### **Intégration dans SellEquipment.tsx**

```typescript
// src/pages/SellEquipment.tsx - MODIFICATION SECTION AUTO-SPECS
import { aiService } from '../services/aiService';

// Dans le composant SellEquipment, remplacer la fonction handleAutoSpecs :
const handleAutoSpecs = async () => {
  if (!formData.brand || !formData.model) {
    setError('Veuillez sélectionner une marque et un modèle avant d\'utiliser l\'auto-complétion.');
    return;
  }

  setAutoSpecsLoading(true);
  setError('');

  try {
    console.log('🔧 Lancement auto-specs enrichi...');
    
    // Utilisation du service IA enrichi
    const result = await aiService.getEnrichedAutoSpecs(
      formData.brand, 
      formData.model,
      {
        page: 'sell_equipment',
        user_context: 'seller',
        existing_data: formData
      }
    );

    if (result && result.specs) {
      const specs = result.specs;
      
      // Application des spécifications avec validation
      const updatedFormData = {
        ...formData,
        description: specs.description || formData.description,
        specifications: {
          weight: specs.weight_kg ? String(specs.weight_kg) : formData.specifications.weight,
          dimensions: {
            length: specs.dimensions?.length_mm ? String(specs.dimensions.length_mm) : formData.specifications.dimensions.length,
            width: specs.dimensions?.width_mm ? String(specs.dimensions.width_mm) : formData.specifications.dimensions.width,
            height: specs.dimensions?.height_mm ? String(specs.dimensions.height_mm) : formData.specifications.dimensions.height,
          },
          power: {
            value: specs.engine?.power_kw ? String(specs.engine.power_kw) : 
                   specs.engine?.power_hp ? String(specs.engine.power_hp) : formData.specifications.power.value,
            unit: specs.engine?.power_kw ? 'kW' : 'HP'
          },
          workingWeight: specs.weight_kg ? String(specs.weight_kg) : formData.specifications.workingWeight
        }
      };

      setFormData(updatedFormData);
      
      // Affichage des informations manquantes si disponibles
      if (result.missing && result.missing.length > 0) {
        setError(`✅ Spécifications auto-complétées ! Champs manquants: ${result.missing.join(', ')}`);
      } else {
        setError('✅ Toutes les spécifications ont été auto-complétées avec succès !');
      }

      // Affichage des suggestions si disponibles
      if (result.suggestions) {
        console.log('💡 Suggestions disponibles:', result.suggestions);
      }

    } else {
      setError('❌ Aucune spécification trouvée pour ce modèle. Veuillez saisir manuellement.');
    }

  } catch (error) {
    console.error('❌ Erreur auto-specs:', error);
    setError('❌ Erreur lors de la récupération des spécifications. Veuillez réessayer.');
  } finally {
    setAutoSpecsLoading(false);
  }
};
```

---

## 🧪 **7. SCRIPT DE TEST INTÉGRATION**

### **Script de Test Complet**

```javascript
// test-integration-ia.js
const testAIIntegration = async () => {
  console.log('🧪 Test d\'intégration IA Minegrid...');
  
  const baseURL = 'https://n8n.srv786179.hstgr.cloud/webhook/';
  
  // Test 1: Assistant Virtuel Enrichi
  console.log('\n1️⃣ Test Assistant Virtuel Enrichi...');
  try {
    const chatResponse = await fetch(`${baseURL}assistant_virtuel_enrichi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Bonjour, je cherche une excavatrice Caterpillar',
        user_id: 'test-user-123',
        session_id: 'test-session-456',
        context: {
          page: '/equipment',
          user_type: 'acheteur'
        }
      })
    });
    
    const chatResult = await chatResponse.json();
    console.log('✅ Assistant IA:', chatResult.response ? 'OK' : 'ERREUR');
    console.log('   Confiance:', chatResult.metadata?.confidence);
    console.log('   Suggestions:', chatResult.suggestions?.actions?.length || 0);
  } catch (error) {
    console.log('❌ Assistant IA: ERREUR -', error.message);
  }
  
  // Test 2: Analyse Prédictive
  console.log('\n2️⃣ Test Analyse Prédictive...');
  try {
    const analysisResponse = await fetch(`${baseURL}analyse_predictive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysis_type: 'pipeline_commercial',
        user_id: 'test-user-123',
        business_unit: 'vendeur',
        date_range: { start: '2024-01-01', end: '2024-12-31' },
        filters: { priority: 'normal' }
      })
    });
    
    const analysisResult = await analysisResponse.json();
    console.log('✅ Analyse Prédictive:', analysisResult.status === 'success' ? 'OK' : 'ERREUR');
    console.log('   Score santé:', analysisResult.executive_summary?.overall_health_score);
    console.log('   Actions:', analysisResult.results?.recommendations?.immediate_actions?.length || 0);
  } catch (error) {
    console.log('❌ Analyse Prédictive: ERREUR -', error.message);
  }
  
  // Test 3: Auto-Specs Enrichi
  console.log('\n3️⃣ Test Auto-Specs Enrichi...');
  try {
    const specsResponse = await fetch(`${baseURL}auto_specs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: 'caterpillar',
        model: '320d',
        schema: 'minegrid.auto_specs.v1',
        includeMissing: true
      })
    });
    
    const specsResult = await specsResponse.json();
    console.log('✅ Auto-Specs:', specsResult.specs ? 'OK' : 'ERREUR');
    console.log('   Données complètes:', Object.keys(specsResult.specs || {}).length);
    console.log('   Champs manquants:', specsResult.missing?.length || 0);
  } catch (error) {
    console.log('❌ Auto-Specs: ERREUR -', error.message);
  }
  
  console.log('\n🎉 Tests d\'intégration terminés !');
};

// Exécution
testAIIntegration();
```

---

## 📱 **8. SCRIPT D'EXÉCUTION AUTOMATIQUE**

### **Script de Déploiement**

```bash
#!/bin/bash
# deploy-ai-integration.sh

echo "🚀 Déploiement Intégration IA Minegrid..."

# 1. Installation dépendances si nécessaire
echo "📦 Vérification dépendances..."
npm install

# 2. Création tables Supabase
echo "🗄️ Création tables IA..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const createTables = async () => {
  // Tables SQL à exécuter
  const queries = [
    \`CREATE TABLE IF NOT EXISTS ai_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id),
      user_message TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      intent TEXT,
      language TEXT DEFAULT 'fr',
      confidence DECIMAL(3,2),
      context JSONB,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );\`,
    \`CREATE TABLE IF NOT EXISTS ai_analysis_results (
      id TEXT PRIMARY KEY,
      analysis_type TEXT NOT NULL,
      requested_by UUID REFERENCES auth.users(id),
      requested_at TIMESTAMP NOT NULL,
      completed_at TIMESTAMP,
      status TEXT DEFAULT 'pending',
      results JSONB,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );\`,
    \`CREATE TABLE IF NOT EXISTS ai_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agent_type TEXT NOT NULL,
      execution_time_ms INTEGER,
      confidence_score DECIMAL(3,2),
      user_satisfaction DECIMAL(3,2),
      success_rate DECIMAL(3,2),
      error_count INTEGER DEFAULT 0,
      date DATE DEFAULT CURRENT_DATE,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );\`
  ];
  
  for (const query of queries) {
    try {
      await supabase.rpc('exec_sql', { sql: query });
      console.log('✅ Table créée');
    } catch (error) {
      console.log('⚠️ Table existe déjà ou erreur:', error.message);
    }
  }
};

createTables();
"

# 3. Test intégration
echo "🧪 Test intégration..."
node test-integration-ia.js

# 4. Build et déploiement
echo "🏗️ Build application..."
npm run build

echo "✅ Déploiement terminé !"
echo "🔗 URLs des agents IA :"
echo "   Assistant: https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel_enrichi"
echo "   Analyse: https://n8n.srv786179.hstgr.cloud/webhook/analyse_predictive"
echo "   Auto-Specs: https://n8n.srv786179.hstgr.cloud/webhook/auto_specs"
```

---

## ✅ **9. CHECKLIST DE CONFIGURATION**

### **À Faire Immédiatement :**

- [ ] **Importer les workflows N8N** (fichiers JSON fournis)
- [ ] **Activer les workflows** dans l'interface N8N
- [ ] **Créer les tables Supabase** (script SQL fourni)
- [ ] **Ajouter le service IA** (`src/services/aiService.ts`)
- [ ] **Modifier ChatWidget** avec version enrichie
- [ ] **Ajouter widget prédictif** au dashboard
- [ ] **Modifier auto-specs** dans SellEquipment.tsx
- [ ] **Tester l'intégration** (script de test fourni)

### **Configuration Environnement :**

```bash
# Variables d'environnement à vérifier
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_N8N_BASE_URL=https://n8n.srv786179.hstgr.cloud/webhook/
```

### **URLs de Test :**

- **Assistant IA** : `https://n8n.srv786179.hstgr.cloud/webhook/assistant_virtuel_enrichi`
- **Analyse Prédictive** : `https://n8n.srv786179.hstgr.cloud/webhook/analyse_predictive`  
- **Auto-Specs** : `https://n8n.srv786179.hstgr.cloud/webhook/auto_specs`

Cette configuration vous permet de connecter immédiatement les agents IA à votre site avec toutes les fonctionnalités enrichies ! 🚀 