import { supabaseClient } from '../utils/supabaseClient';

// Types pour les données
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'call' | 'email' | 'meeting' | 'follow-up' | 'quote' | 'proposal';
  dueTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  contact?: {
    name: string;
    company: string;
    phone?: string;
    email?: string;
  };
  value?: number;
  aiRecommendation?: string;
  estimatedDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  title: string;
  stage: 'Prospection' | 'Qualification' | 'Proposition' | 'Négociation' | 'Conclu' | 'Perdu';
  priority: 'high' | 'medium' | 'low';
  value: number;
  probability: number;
  nextAction: string;
  assignedTo: string;
  lastContact: string;
  notes: string;
  contact: {
    name: string;
    company: string;
    phone?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  price: number;
  daysInStock: number;
  photos: string[];
  boosted: boolean;
  description: string;
  status: 'available' | 'sold' | 'reserved';
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  startDate: string;
  endDate: string;
  equipmentIds: string[];
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
}

// Service API unifié
class ApiService {
  // ===== ACTIONS =====
  async getActions(): Promise<ApiResponse<Action[]>> {
    try {
      const { data, error } = await supabaseClient
        .from('actions')
        .select('*')
        .order('dueTime', { ascending: true });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des actions',
        success: false
      };
    }
  }

  async createAction(action: Omit<Action, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Action>> {
    try {
      const { data, error } = await supabaseClient
        .from('actions')
        .insert([action])
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'action',
        success: false
      };
    }
  }

  async updateAction(id: string, updates: Partial<Action>): Promise<ApiResponse<Action>> {
    try {
      const { data, error } = await supabaseClient
        .from('actions')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'action',
        success: false
      };
    }
  }

  async deleteAction(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabaseClient
        .from('actions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'action',
        success: false
      };
    }
  }

  // ===== LEADS =====
  async getLeads(): Promise<ApiResponse<Lead[]>> {
    try {
      const { data, error } = await supabaseClient
        .from('leads')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des leads',
        success: false
      };
    }
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Lead>> {
    try {
      const { data, error } = await supabaseClient
        .from('leads')
        .insert([lead])
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la création du lead',
        success: false
      };
    }
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<ApiResponse<Lead>> {
    try {
      const { data, error } = await supabaseClient
        .from('leads')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du lead',
        success: false
      };
    }
  }

  // ===== EQUIPMENTS =====
  async getEquipments(): Promise<ApiResponse<Equipment[]>> {
    try {
      const { data, error } = await supabaseClient
        .from('equipments')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des équipements',
        success: false
      };
    }
  }

  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    try {
      const { data, error } = await supabaseClient
        .from('equipments')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'équipement',
        success: false
      };
    }
  }

  // ===== PROMOTIONS =====
  async createPromotion(promotion: Omit<Promotion, 'id' | 'createdAt'>): Promise<ApiResponse<Promotion>> {
    try {
      const { data, error } = await supabaseClient
        .from('promotions')
        .insert([promotion])
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la promotion',
        success: false
      };
    }
  }

  // ===== UTILITAIRES =====
  async uploadImage(file: File, path: string): Promise<ApiResponse<string>> {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabaseClient.storage
        .from('images')
        .upload(`${path}/${fileName}`, file);

      if (error) throw error;

      const { data: urlData } = supabaseClient.storage
        .from('images')
        .getPublicUrl(`${path}/${fileName}`);

      return {
        data: urlData.publicUrl,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image',
        success: false
      };
    }
  }
}

export const apiService = new ApiService(); 