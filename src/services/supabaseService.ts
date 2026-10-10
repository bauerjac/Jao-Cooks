import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderStatus } from '../types';
import { INITIAL_ORDERS } from '../data/initialOrders';

const LOCAL_STORAGE_KEY = 'jao_cooks_orders_v1';
const SUPABASE_URL_KEY = 'jao_cooks_supabase_url';
const SUPABASE_KEY_KEY = 'jao_cooks_supabase_anon_key';

let supabaseClient: SupabaseClient | null = null;
let realtimeSubscription: any = null;

export const SQL_SCHEMA_SNIPPET = `-- Execute no SQL Editor do seu projeto Supabase:
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'local',
  table_number TEXT,
  status TEXT NOT NULL DEFAULT 'recebido',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  general_notes TEXT,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_prep_at TIMESTAMPTZ,
  finished_prep_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  kitchen_operator TEXT
);

-- Habilitar Row Level Security e permitir leitura/escrita anônima (ou configure suas policies)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir tudo para anon" ON orders;
CREATE POLICY "Permitir tudo para anon" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Habilitar Realtime para a tabela orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
`;

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(SUPABASE_URL_KEY) || envUrl;
  const storedKey = localStorage.getItem(SUPABASE_KEY_KEY) || envKey;

  return {
    url: storedUrl.trim(),
    anonKey: storedKey.trim(),
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const { url, anonKey } = getSupabaseCredentials();
  if (url && anonKey) {
    try {
      supabaseClient = createClient(url, anonKey, {
        auth: { persistSession: false },
      });
      return supabaseClient;
    } catch (e) {
      console.warn('Erro ao inicializar cliente Supabase:', e);
      return null;
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey);
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false },
    });
    const { data, error } = await client.from('orders').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Conectado ao Supabase, mas a tabela "orders" ainda não foi criada. Copie o script SQL abaixo e execute no painel!',
        };
      }
      return { success: false, message: `Erro do Supabase: ${error.message} (${error.code || ''})` };
    }

    return {
      success: true,
      message: 'Conexão com o Supabase estabelecida com sucesso! Tabela "orders" verificada.',
    };
  } catch (err: any) {
    return { success: false, message: `Falha de rede ou URL inválida: ${err.message || 'Erro desconhecido'}` };
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  supabaseClient = null;
  if (url.trim() && anonKey.trim()) {
    getSupabaseClient();
  }
}

export function clearSupabaseCredentials() {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
  supabaseClient = null;
}

// Local storage fallback handlers
export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Erro ao salvar localmente:', err);
  }
}

// Core Operations
export async function fetchOrdersFromStorage(): Promise<{ orders: Order[]; source: 'supabase' | 'local'; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erro ao buscar pedidos no Supabase, usando local:', error);
        return {
          orders: getLocalOrders(),
          source: 'local',
          error: `Supabase: ${error.message}`,
        };
      }

      if (data && data.length > 0) {
        // Map Supabase rows to typed orders
        const mappedOrders: Order[] = data.map((row: any) => ({
          ...row,
          order_number: Number(row.order_number),
          total_price: Number(row.total_price),
          items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
        }));
        saveLocalOrders(mappedOrders);
        return { orders: mappedOrders, source: 'supabase' };
      } else {
        // Table exists but is empty, seed it with initial orders
        const local = getLocalOrders();
        try {
          await client.from('orders').insert(local);
        } catch {
          // ignore seeding error
        }
        return { orders: local, source: 'supabase' };
      }
    } catch (err: any) {
      console.warn('Exceção ao buscar do Supabase:', err);
      return { orders: getLocalOrders(), source: 'local', error: err.message };
    }
  }

  return { orders: getLocalOrders(), source: 'local' };
}

export async function createOrder(order: Order): Promise<{ success: boolean; error?: string }> {
  // Always update local cache first
  const currentOrders = getLocalOrders();
  const updatedOrders = [order, ...currentOrders.filter((o) => o.id !== order.id)];
  saveLocalOrders(updatedOrders);

  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('orders').insert({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        order_type: order.order_type,
        table_number: order.table_number || null,
        status: order.status,
        items: order.items,
        general_notes: order.general_notes || null,
        total_price: order.total_price,
        created_at: order.created_at,
        updated_at: order.updated_at,
        started_prep_at: order.started_prep_at || null,
        finished_prep_at: order.finished_prep_at || null,
        delivered_at: order.delivered_at || null,
        kitchen_operator: order.kitchen_operator || null,
      });

      if (error) {
        console.error('Erro ao inserir pedido no Supabase:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Falha de rede ao criar pedido no Supabase:', err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  operator?: string
): Promise<{ success: boolean; updatedOrder?: Order; error?: string }> {
  const currentOrders = getLocalOrders();
  const nowIso = new Date().toISOString();

  let targetOrder: Order | undefined;
  const updatedOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      const updated: Order = {
        ...ord,
        status: newStatus,
        updated_at: nowIso,
        ...(operator ? { kitchen_operator: operator } : {}),
      };

      if (newStatus === 'preparando' && !updated.started_prep_at) {
        updated.started_prep_at = nowIso;
      }
      if (newStatus === 'pronto' && !updated.finished_prep_at) {
        updated.finished_prep_at = nowIso;
      }
      if (newStatus === 'entregue' && !updated.delivered_at) {
        updated.delivered_at = nowIso;
      }

      targetOrder = updated;
      return updated;
    }
    return ord;
  });

  if (!targetOrder) {
    return { success: false, error: 'Pedido não encontrado' };
  }

  saveLocalOrders(updatedOrders);

  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: any = {
        status: targetOrder.status,
        updated_at: targetOrder.updated_at,
        started_prep_at: targetOrder.started_prep_at || null,
        finished_prep_at: targetOrder.finished_prep_at || null,
        delivered_at: targetOrder.delivered_at || null,
      };
      if (operator) payload.kitchen_operator = operator;

      const { error } = await client
        .from('orders')
        .update(payload)
        .eq('id', orderId);

      if (error) {
        console.error('Erro ao atualizar status no Supabase:', error);
        return { success: true, updatedOrder: targetOrder, error: error.message };
      }
    } catch (err: any) {
      console.error('Exceção ao atualizar status no Supabase:', err);
    }
  }

  return { success: true, updatedOrder: targetOrder };
}

export async function toggleOrderItemCompleted(
  orderId: string,
  itemId: string
): Promise<{ success: boolean; order?: Order }> {
  const currentOrders = getLocalOrders();
  let updatedOrder: Order | undefined;

  const newOrders = currentOrders.map((ord) => {
    if (ord.id === orderId) {
      const newItems = ord.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      updatedOrder = { ...ord, items: newItems, updated_at: new Date().toISOString() };
      return updatedOrder;
    }
    return ord;
  });

  if (!updatedOrder) return { success: false };

  saveLocalOrders(newOrders);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('orders')
        .update({ items: updatedOrder.items, updated_at: updatedOrder.updated_at })
        .eq('id', orderId);
    } catch (err) {
      console.warn('Erro ao sincronizar item checado com Supabase:', err);
    }
  }

  return { success: true, order: updatedOrder };
}

export function subscribeToSupabaseOrders(
  onInsert: (order: Order) => void,
  onUpdate: (order: Order) => void,
  onDelete: (id: string) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    if (realtimeSubscription) {
      supabaseClient?.removeChannel(realtimeSubscription);
    }

    realtimeSubscription = client
      .channel('kds-orders-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow && newRow.id) {
            const mapped: Order = {
              ...newRow,
              order_number: Number(newRow.order_number),
              total_price: Number(newRow.total_price),
              items: typeof newRow.items === 'string' ? JSON.parse(newRow.items) : newRow.items || [],
            };
            onInsert(mapped);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updatedRow = payload.new as any;
          if (updatedRow && updatedRow.id) {
            const mapped: Order = {
              ...updatedRow,
              order_number: Number(updatedRow.order_number),
              total_price: Number(updatedRow.total_price),
              items: typeof updatedRow.items === 'string' ? JSON.parse(updatedRow.items) : updatedRow.items || [],
            };
            onUpdate(mapped);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.old && payload.old.id) {
            onDelete(payload.old.id);
          }
        }
      )
      .subscribe();

    return () => {
      if (realtimeSubscription && supabaseClient) {
        supabaseClient.removeChannel(realtimeSubscription);
        realtimeSubscription = null;
      }
    };
  } catch (err) {
    console.error('Erro ao subscrever ao Realtime do Supabase:', err);
    return () => {};
  }
}
