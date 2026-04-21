import { INVENTORY_LIST_COLUMNS } from '../../constants/enterpriseApiQueryFields';
import type { InventoryItem } from './types';
import supabase from '../supabaseClient';
import { supabaseCall } from '../supabaseCall';

// WIDGET "STOCK PIECES DETACHEES"
export const getInventoryStatus = async () => {
  const data = await supabaseCall<InventoryItem[]>(
    () =>
      supabase.from('inventory').select(INVENTORY_LIST_COLUMNS).order('category', { ascending: true }),
    { label: 'getInventoryStatus', fallback: [] },
  );

  return data.map((item) => ({
    category: item.category,
    stock: item.current_stock,
    min: item.minimum_stock,
    unit_price: item.unit_price,
    supplier: item.supplier,
    needs_restock: item.current_stock < item.minimum_stock,
  }));
};

export const updateInventoryStock = async (id: string, newStock: number) => {
  return supabaseCall(
    () =>
      supabase
        .from('inventory')
        .update({ current_stock: newStock, last_restock_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single(),
    { label: 'updateInventoryStock', toastOnError: true },
  );
};

export const createStockOrder = async (order: {
  inventory_id: string;
  quantity: number;
  unit_price: number;
  supplier: string;
  expected_delivery_date: string;
}) => {
  const total_price = order.quantity * order.unit_price;
  return supabaseCall(
    () => supabase.from('stock_orders').insert([{ ...order, total_price }]).select().single(),
    { label: 'createStockOrder', toastOnError: true, toastMessage: 'Impossible de créer la commande de stock' },
  );
};

// NOTIFICATIONS ET ALERTES
export const getStockAlerts = async () => {
  return supabaseCall(
    () => supabase.from('inventory').select(INVENTORY_LIST_COLUMNS).lt('current_stock', 'minimum_stock'),
    { label: 'getStockAlerts', fallback: [] },
  );
};
