import { supabaseClient } from '../utils/supabaseClient';

// Types pour le pipeline commercial réel
export interface RealLead {
  id: string;
  seller_id: string;
  title: string;
  stage: 'Prospection' | 'Qualification' | 'Proposition' | 'Négociation' | 'Conclu' | 'Perdu';
  priority: 'high' | 'medium' | 'low';
  value: number;
  probability: number;
  next_action?: string;
  assigned_to: string;
  last_contact: string;
  notes?: string;
  contact_name?: string;
  contact_company?: string;
  contact_phone?: string;
  contact_email?: string;
  source?: 'message' | 'offer' | 'manual' | 'website';
  source_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RealPipelineAction {
  id: string;
  lead_id: string;
  seller_id: string;
  title: string;
  description?: string;
  action_type: 'call' | 'email' | 'meeting' | 'follow-up' | 'quote' | 'proposal' | 'visit';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  completed_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  ai_recommendation?: string;
  created_at: string;
  updated_at: string;
}

export interface RealPipelineInsight {
  id: string;
  seller_id: string;
  insight_type: 'performance' | 'conversion' | 'optimization' | 'trend';
  title: string;
  description: string;
  data: any;
  priority?: 'high' | 'medium' | 'low';
  action_required: boolean;
  action_description?: string;
  is_read: boolean;
  created_at: string;
}

export interface RealPipelineReport {
  id: string;
  seller_id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  data: any;
  filters?: any;
  generated_at: string;
  created_at: string;
}

// Service principal pour le pipeline commercial réel
export class RealPipelineService {
  
  // ===== LEADS =====
  
  /**
   * Récupérer tous les leads du vendeur
   */
  static async getLeads(): Promise<RealLead[]> {
    try {
      const { data, error } = await supabaseClient
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération leads:', error);
      return [];
    }
  }

  /**
   * Créer un nouveau lead
   */
  static async createLead(leadData: Partial<RealLead>): Promise<RealLead | null> {
    try {
      const { data, error } = await supabaseClient
        .from('leads')
        .insert([leadData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création lead:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un lead
   */
  static async updateLead(leadId: string, updates: Partial<RealLead>): Promise<RealLead | null> {
    try {
      const { data, error } = await supabaseClient
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour lead:', error);
      return null;
    }
  }

  /**
   * Supprimer un lead
   */
  static async deleteLead(leadId: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('leads')
        .delete()
        .eq('id', leadId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression lead:', error);
      return false;
    }
  }

  /**
   * Créer automatiquement des leads à partir des messages
   */
  static async createLeadsFromMessages(): Promise<number> {
    try {
      // Récupérer les messages non traités
      const { data: messages } = await supabaseClient
        .from('messages')
        .select('*')
        .is('processed_for_lead', null);

      if (!messages || messages.length === 0) return 0;

      let createdCount = 0;

      for (const message of messages) {
        // Vérifier si un lead existe déjà pour ce message
        const existingLead = await supabaseClient
          .from('leads')
          .select('id')
          .eq('source', 'message')
          .eq('source_id', message.id)
          .single();

        if (existingLead.data) continue;

        // Créer le lead
        const leadData = {
          title: `Prospect ${message.sender_id || 'Inconnu'}`,
          stage: 'Prospection' as const,
          priority: 'medium' as const,
          value: 0,
          probability: 10,
          next_action: 'Contacter le prospect',
          assigned_to: 'Vendeur',
          last_contact: message.created_at,
          notes: message.content,
          contact_email: message.sender_email,
          source: 'message' as const,
          source_id: message.id
        };

        const newLead = await this.createLead(leadData);
        if (newLead) {
          createdCount++;
          
          // Marquer le message comme traité
          await supabaseClient
            .from('messages')
            .update({ processed_for_lead: true })
            .eq('id', message.id);
        }
      }

      return createdCount;
    } catch (error) {
      console.error('Erreur création leads depuis messages:', error);
      return 0;
    }
  }

  /**
   * Créer automatiquement des leads à partir des offres
   */
  static async createLeadsFromOffers(): Promise<number> {
    try {
      // Récupérer les offres non traitées
      const { data: offers } = await supabaseClient
        .from('offers')
        .select('*')
        .is('processed_for_lead', null);

      if (!offers || offers.length === 0) return 0;

      let createdCount = 0;

      for (const offer of offers) {
        // Vérifier si un lead existe déjà pour cette offre
        const existingLead = await supabaseClient
          .from('leads')
          .select('id')
          .eq('source', 'offer')
          .eq('source_id', offer.id)
          .single();

        if (existingLead.data) continue;

        // Créer le lead
        const leadData = {
          title: `Offre ${offer.buyer_id || 'Inconnu'}`,
          stage: 'Négociation' as const,
          priority: 'high' as const,
          value: offer.amount || 0,
          probability: 70,
          next_action: 'Finaliser la négociation',
          assigned_to: 'Vendeur',
          last_contact: offer.created_at,
          notes: `Offre de ${offer.amount} MAD`,
          source: 'offer' as const,
          source_id: offer.id
        };

        const newLead = await this.createLead(leadData);
        if (newLead) {
          createdCount++;
          
          // Marquer l'offre comme traitée
          await supabaseClient
            .from('offers')
            .update({ processed_for_lead: true })
            .eq('id', offer.id);
        }
      }

      return createdCount;
    } catch (error) {
      console.error('Erreur création leads depuis offres:', error);
      return 0;
    }
  }

  // ===== ACTIONS =====

  /**
   * Récupérer toutes les actions du pipeline
   */
  static async getPipelineActions(): Promise<RealPipelineAction[]> {
    try {
      const { data, error } = await supabaseClient
        .from('pipeline_actions')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération actions:', error);
      return [];
    }
  }

  /**
   * Créer une nouvelle action
   */
  static async createPipelineAction(actionData: Partial<RealPipelineAction>): Promise<RealPipelineAction | null> {
    try {
      const { data, error } = await supabaseClient
        .from('pipeline_actions')
        .insert([actionData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création action:', error);
      return null;
    }
  }

  /**
   * Mettre à jour une action
   */
  static async updatePipelineAction(actionId: string, updates: Partial<RealPipelineAction>): Promise<RealPipelineAction | null> {
    try {
      const { data, error } = await supabaseClient
        .from('pipeline_actions')
        .update(updates)
        .eq('id', actionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour action:', error);
      return null;
    }
  }

  /**
   * Créer automatiquement des actions pour les leads
   */
  static async createActionsForLeads(): Promise<number> {
    try {
      const leads = await this.getLeads();
      let createdCount = 0;

      for (const lead of leads) {
        // Vérifier s'il y a déjà des actions pour ce lead
        const existingActions = await supabaseClient
          .from('pipeline_actions')
          .select('id')
          .eq('lead_id', lead.id);

        if (existingActions.data && existingActions.data.length > 0) continue;

        // Créer une action par défaut
        const actionData = {
          lead_id: lead.id,
          title: `Suivre ${lead.title}`,
          description: lead.next_action || 'Suivi du prospect',
          action_type: 'follow-up' as const,
          status: 'pending' as const,
          priority: lead.priority,
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
          contact_name: lead.contact_name,
          contact_email: lead.contact_email,
          contact_phone: lead.contact_phone
        };

        const newAction = await this.createPipelineAction(actionData);
        if (newAction) createdCount++;
      }

      return createdCount;
    } catch (error) {
      console.error('Erreur création actions pour leads:', error);
      return 0;
    }
  }

  // ===== INSIGHTS =====

  /**
   * Récupérer les insights du pipeline
   */
  static async getPipelineInsights(): Promise<RealPipelineInsight[]> {
    try {
      const { data, error } = await supabaseClient
        .from('pipeline_insights')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération insights:', error);
      return [];
    }
  }

  /**
   * Créer un insight
   */
  static async createPipelineInsight(insightData: Partial<RealPipelineInsight>): Promise<RealPipelineInsight | null> {
    try {
      const { data, error } = await supabaseClient
        .from('pipeline_insights')
        .insert([insightData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création insight:', error);
      return null;
    }
  }

  /**
   * Générer des insights automatiques
   */
  static async generateAutomaticInsights(): Promise<number> {
    try {
      const leads = await this.getLeads();
      const actions = await this.getPipelineActions();
      
      let createdCount = 0;

      // Insight 1: Performance générale
      const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
      const avgProbability = leads.length > 0 ? leads.reduce((sum, lead) => sum + lead.probability, 0) / leads.length : 0;
      
      const performanceInsight = {
        insight_type: 'performance' as const,
        title: 'Performance du Pipeline',
        description: `Valeur totale: ${totalValue.toLocaleString()} MAD, Probabilité moyenne: ${avgProbability.toFixed(1)}%`,
        data: { totalValue, avgProbability, leadCount: leads.length },
        priority: 'medium' as const,
        action_required: false
      };

      const newInsight = await this.createPipelineInsight(performanceInsight);
      if (newInsight) createdCount++;

      // Insight 2: Actions en retard
      const overdueActions = actions.filter(action => 
        action.status === 'pending' && new Date(action.due_date) < new Date()
      );

      if (overdueActions.length > 0) {
        const overdueInsight = {
          insight_type: 'optimization' as const,
          title: 'Actions en Retard',
          description: `${overdueActions.length} action(s) en retard nécessitent votre attention`,
          data: { overdueCount: overdueActions.length, actions: overdueActions },
          priority: 'high' as const,
          action_required: true,
          action_description: 'Revoir et reprogrammer les actions en retard'
        };

        const newOverdueInsight = await this.createPipelineInsight(overdueInsight);
        if (newOverdueInsight) createdCount++;
      }

      return createdCount;
    } catch (error) {
      console.error('Erreur génération insights:', error);
      return 0;
    }
  }

  // ===== RAPPORTS =====

  /**
   * Récupérer les rapports
   */
  static async getPipelineReports(): Promise<RealPipelineReport[]> {
    try {
      const { data, error } = await supabaseClient
        .from('pipeline_reports')
        .select('*')
        .order('generated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération rapports:', error);
      return [];
    }
  }

  /**
   * Créer un rapport
   */
  static async createPipelineReport(reportData: Partial<RealPipelineReport>): Promise<RealPipelineReport | null> {
    try {
      const { data, error } = await supabaseClient
        .from('pipeline_reports')
        .insert([reportData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création rapport:', error);
      return null;
    }
  }

  /**
   * Générer un rapport quotidien
   */
  static async generateDailyReport(): Promise<RealPipelineReport | null> {
    try {
      const leads = await this.getLeads();
      const actions = await this.getPipelineActions();
      
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const newLeadsToday = leads.filter(lead => 
        new Date(lead.created_at) >= yesterday
      );
      
      const completedActionsToday = actions.filter(action => 
        action.status === 'completed' && 
        action.completed_date && 
        new Date(action.completed_date) >= yesterday
      );

      const reportData = {
        report_type: 'daily' as const,
        title: `Rapport Quotidien - ${today.toLocaleDateString()}`,
        data: {
          newLeads: newLeadsToday.length,
          completedActions: completedActionsToday.length,
          totalLeads: leads.length,
          totalActions: actions.length,
          totalValue: leads.reduce((sum, lead) => sum + (lead.value || 0), 0)
        },
        generated_at: today.toISOString()
      };

      return await this.createPipelineReport(reportData);
    } catch (error) {
      console.error('Erreur génération rapport quotidien:', error);
      return null;
    }
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Synchroniser automatiquement les données
   */
  static async syncData(): Promise<{
    leadsFromMessages: number;
    leadsFromOffers: number;
    actionsCreated: number;
    insightsGenerated: number;
  }> {
    try {
      const leadsFromMessages = await this.createLeadsFromMessages();
      const leadsFromOffers = await this.createLeadsFromOffers();
      const actionsCreated = await this.createActionsForLeads();
      const insightsGenerated = await this.generateAutomaticInsights();

      return {
        leadsFromMessages,
        leadsFromOffers,
        actionsCreated,
        insightsGenerated
      };
    } catch (error) {
      console.error('Erreur synchronisation données:', error);
      return {
        leadsFromMessages: 0,
        leadsFromOffers: 0,
        actionsCreated: 0,
        insightsGenerated: 0
      };
    }
  }

  /**
   * Obtenir les statistiques du pipeline
   */
  static async getPipelineStats(): Promise<{
    totalLeads: number;
    totalValue: number;
    avgProbability: number;
    leadsByStage: Record<string, number>;
    actionsByStatus: Record<string, number>;
  }> {
    try {
      const leads = await this.getLeads();
      const actions = await this.getPipelineActions();

      const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
      const avgProbability = leads.length > 0 ? leads.reduce((sum, lead) => sum + lead.probability, 0) / leads.length : 0;

      const leadsByStage = leads.reduce((acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const actionsByStatus = actions.reduce((acc, action) => {
        acc[action.status] = (acc[action.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalLeads: leads.length,
        totalValue,
        avgProbability,
        leadsByStage,
        actionsByStatus
      };
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      return {
        totalLeads: 0,
        totalValue: 0,
        avgProbability: 0,
        leadsByStage: {},
        actionsByStatus: {}
      };
    }
  }
} 