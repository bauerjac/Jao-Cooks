export type OrderStatus = 'recebido' | 'preparando' | 'pronto' | 'entregue';

export type StationType = 'grelha' | 'montagem' | 'fritadeira' | 'bebidas' | 'sobremesas';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category: 'burger' | 'porcao' | 'bebida' | 'sobremesa' | 'combo';
  station: StationType;
  options?: string[];
  notes?: string;
  completed?: boolean;
}

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  order_type: 'local' | 'viagem' | 'delivery';
  table_number?: string;
  status: OrderStatus;
  items: OrderItem[];
  general_notes?: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  started_prep_at?: string;
  finished_prep_at?: string;
  delivered_at?: string;
  kitchen_operator?: string;
}

export interface KitchenStats {
  totalActive: number;
  recebidoCount: number;
  preparandoCount: number;
  prontoCount: number;
  entregueCount: number;
  averagePrepMinutes: number;
  delayedCount: number;
}
