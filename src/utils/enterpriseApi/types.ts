// Interfaces internes utilisees par src/utils/enterpriseApi.ts.

export interface Intervention {
  id: string;
  name: string;
  equipment_name: string;
  technician_name: string;
  status: string;
  priority: string;
  description: string;
  estimated_duration: number;
  scheduled_date: string;
  completed_date?: string;
}

export interface Repair {
  id: string;
  equipment_name: string;
  technician_name: string;
  status: string;
  problem_description: string;
  estimated_duration: number;
  estimated_cost: number;
}

export interface InventoryItem {
  id: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  unit_price: number;
  supplier: string;
}

export interface Technician {
  id: string;
  name: string;
  specialization: string;
  max_workload_hours: number;
  current_workload_hours: number;
  efficiency_rating: number;
  availability_status: string;
}

export interface Task {
  id: string;
  technician_id: string;
  estimated_hours: number;
  status: string;
}
