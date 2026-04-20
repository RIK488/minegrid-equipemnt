import { INVENTORY_LIST_COLUMNS } from '../../constants/enterpriseApiQueryFields';
import type { InventoryItem } from './types';
import supabase from '../supabaseClient';

// 🔧 WIDGET "STOCK PIÈCES DÉTACHÉES"
export const getInventoryStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(INVENTORY_LIST_COLUMNS)
      .order('category', { ascending: true });

    if (error) throw error;

    return data.map((item: InventoryItem) => ({
      category: item.category,
      stock: item.current_stock,
      min: item.minimum_stock,
      unit_price: item.unit_price,
      supplier: item.supplier,
      needs_restock: item.current_stock < item.minimum_stock
    }));
  } catch (error) {
    console.error('Erreur lors du chargement du stock:', error);
    return [];
  }
};

export const updateInventoryStock = async (id: string, newStock: number) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        current_stock: newStock,
        last_restock_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    throw error;
  }
};

export const createStockOrder = async (order: {
  inventory_id: string;
  quantity: number;
  unit_price: number;
  supplier: string;
  expected_delivery_date: string;
}) => {
  try {
    const total_price = order.quantity * order.unit_price;
    
    const { data, error } = await supabase
      .from('stock_orders')
      .insert([{ ...order, total_price }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de commande:', error);
    throw error;
  }
};

// 🔧 NOTIFICATIONS ET ALERTES
export const getStockAlerts = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(INVENTORY_LIST_COLUMNS)
      .lt('current_stock', 'minimum_stock');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des alertes stock:', error);
    return [];
  }
};
