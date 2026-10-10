import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, OrderStatus, StationType, KitchenStats } from './types';
import {
  fetchOrdersFromStorage,
  createOrder,
  updateOrderStatus,
  toggleOrderItemCompleted,
  subscribeToSupabaseOrders,
  isSupabaseConfigured,
} from './services/supabaseService';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { KdsColumn } from './components/KdsColumn';
import { OrderCard } from './components/OrderCard';
import { KioskSimulatorModal } from './components/KioskSimulatorModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { kitchenAudio } from './utils/audio';
import { JAO_COOKS_MENU } from './data/menuItems';
import { Bell, CheckCircle2, AlertTriangle, Sparkles, Filter, RefreshCw } from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStation, setActiveStation] = useState<StationType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'queue'>('kanban');
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(isSupabaseConfigured());
  const [isKioskModalOpen, setIsKioskModalOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string } | null>(null);

  // Load orders on startup
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchOrdersFromStorage();
    setOrders(result.orders);
    setIsSupabaseActive(isSupabaseConfigured());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Subscribe to Supabase Realtime changes if connected
  useEffect(() => {
    if (!isSupabaseActive) return;

    const unsubscribe = subscribeToSupabaseOrders(
      (newOrder) => {
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          kitchenAudio.playNewOrderAlert();
          showNotification(`Novo Pedido #${newOrder.order_number}`, `${newOrder.customer_name} acabou de pedir!`);
          return [newOrder, ...prev];
        });
      },
      (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );
      },
      (deletedId) => {
        setOrders((prev) => prev.filter((o) => o.id !== deletedId));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isSupabaseActive]);

  // Notification Toast Helper
  const showNotification = (title: string, subtitle?: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Next order number calculation
  const nextOrderNumber = useMemo(() => {
    if (orders.length === 0) return 105;
    const maxNumber = Math.max(...orders.map((o) => o.order_number || 100));
    return maxNumber + 1;
  }, [orders]);

  // Handle new order submission (from Kiosk Simulator or Quick Test)
  const handleCreateOrder = async (newOrder: Order) => {
    await createOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    kitchenAudio.playNewOrderAlert();
    showNotification(
      `Novo Pedido #${newOrder.order_number} Recebido!`,
      `${newOrder.items.length} itens do autoatendimento adicionados à fila.`
    );
  };

  // Handle status update
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success && result.updatedOrder) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? result.updatedOrder! : o))
      );

      const statusLabels: Record<OrderStatus, string> = {
        recebido: 'Aguardando',
        preparando: 'Em Produção',
        pronto: 'Pronto p/ Retirada',
        entregue: 'Entregue ao Cliente',
      };

      showNotification(
        `Pedido #${result.updatedOrder.order_number} Atualizado`,
        `Status alterado para: ${statusLabels[newStatus]}`
      );
    }
  };

  // Handle ticking item inside order
  const handleToggleItem = async (orderId: string, itemId: string) => {
    const res = await toggleOrderItemCompleted(orderId, itemId);
    if (res.success && res.order) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order! : o)));
    }
  };

  // Quick Random Order Generator for kitchen testing
  const handleGenerateQuickOrder = () => {
    const randomMenu1 = JAO_COOKS_MENU[Math.floor(Math.random() * 4)];
    const randomMenu2 = JAO_COOKS_MENU[4 + Math.floor(Math.random() * 5)];
    const names = ['Carlos E.', 'Fernanda B.', 'Lucas Totem', 'Beatriz M.', 'Pedro H.', 'Larissa T.'];
    const tables = ['Mesa 01', 'Mesa 05', 'Mesa 14', 'Balcão 02', 'Totem #04'];
    const types: ('local' | 'viagem' | 'delivery')[] = ['local', 'local', 'viagem', 'delivery'];

    const chosenName = names[Math.floor(Math.random() * names.length)];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const chosenTable = tables[Math.floor(Math.random() * tables.length)];

    const notesSample = [
      'SEM CEBOLA',
      'Ponto da carne: bem passada',
      'Carne ao ponto pra mal',
      'Molho da casa à parte',
      'Sem picles e sem tomate',
      '',
    ];
    const itemNote = notesSample[Math.floor(Math.random() * notesSample.length)];

    const nowIso = new Date().toISOString();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: nextOrderNumber,
      customer_name: chosenName,
      order_type: chosenType,
      table_number: chosenType === 'local' ? chosenTable : undefined,
      status: 'recebido',
      total_price: randomMenu1.price + randomMenu2.price,
      created_at: nowIso,
      updated_at: nowIso,
      items: [
        {
          id: `it-${Date.now()}-1`,
          name: randomMenu1.name,
          quantity: 1,
          category: randomMenu1.category,
          station: randomMenu1.station,
          options: randomMenu1.defaultOptions,
          notes: itemNote || undefined,
          completed: false,
        },
        {
          id: `it-${Date.now()}-2`,
          name: randomMenu2.name,
          quantity: 1,
          category: randomMenu2.category,
          station: randomMenu2.station,
          options: randomMenu2.defaultOptions,
          completed: false,
        },
      ],
    };

    handleCreateOrder(newOrder);
  };

  // Filter orders by station if selected
  const filteredOrders = useMemo(() => {
    if (activeStation === 'all') return orders;
    return orders.filter((ord) =>
      ord.items.some((it) => it.station === activeStation)
    );
  }, [orders, activeStation]);

  // Group by status
  const recebidos = useMemo(
    () => filteredOrders.filter((o) => o.status === 'recebido'),
    [filteredOrders]
  );
  const preparando = useMemo(
    () => filteredOrders.filter((o) => o.status === 'preparando'),
    [filteredOrders]
  );
  const prontos = useMemo(
    () => filteredOrders.filter((o) => o.status === 'pronto'),
    [filteredOrders]
  );
  const entregues = useMemo(
    () => orders.filter((o) => o.status === 'entregue'),
    [orders]
  );

  // Active orders (recebidos + preparando + prontos)
  const activeOrders = useMemo(
    () => filteredOrders.filter((o) => o.status !== 'entregue'),
    [filteredOrders]
  );

  // Kitchen Metrics
  const stats: KitchenStats = useMemo(() => {
    const totalActive = activeOrders.length;
    const recebidoCount = recebidos.length;
    const preparandoCount = preparando.length;
    const prontoCount = prontos.length;
    const entregueCount = entregues.length;

    // Delayed: active orders created > 15 minutes ago
    const now = Date.now();
    const delayedCount = activeOrders.filter((o) => {
      const start = new Date(o.created_at).getTime();
      return (now - start) / 60000 >= 15;
    }).length;

    // Average prep time of delivered or ready orders
    const finishedWithTimers = orders.filter(
      (o) => o.started_prep_at && (o.finished_prep_at || o.delivered_at)
    );
    let avgMins = 12; // default reasonable average
    if (finishedWithTimers.length > 0) {
      const totalMinutes = finishedWithTimers.reduce((acc, o) => {
        const start = new Date(o.started_prep_at!).getTime();
        const end = new Date(o.finished_prep_at || o.delivered_at!).getTime();
        return acc + Math.max(1, (end - start) / 60000);
      }, 0);
      avgMins = Math.round(totalMinutes / finishedWithTimers.length);
    }

    return {
      totalActive,
      recebidoCount,
      preparandoCount,
      prontoCount,
      entregueCount,
      averagePrepMinutes: avgMins,
      delayedCount,
    };
  }, [activeOrders, recebidos, preparando, prontos, entregues, orders]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-amber-500/50 shadow-2xl shadow-amber-950/40 animate-bounce duration-300">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Bell className="w-5 h-5 animate-wiggle" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{toastMessage.title}</h4>
            {toastMessage.subtitle && (
              <p className="text-xs text-slate-300 mt-0.5">{toastMessage.subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Main KDS Header */}
      <Header
        activeStation={activeStation}
        onSelectStation={setActiveStation}
        isSupabaseActive={isSupabaseActive}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenKioskModal={() => setIsKioskModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onGenerateQuickOrder={handleGenerateQuickOrder}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((m) => (m === 'kanban' ? 'queue' : 'kanban'))}
        totalActiveCount={stats.totalActive}
      />

      {/* Realtime Stats Bar */}
      <StatsBar stats={stats} />

      {/* Main Workspace Area */}
      <main className="flex-1 p-3 md:p-4 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm font-semibold">Carregando painel de pedidos da Jão Cooks...</p>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Columns View: 3 primary kitchen stages */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto min-h-0">
            {/* 1. Recebidos */}
            <KdsColumn
              status="recebido"
              title="1. Recebidos"
              subtitle="Aguardando preparo"
              orders={recebidos}
              onUpdateStatus={handleUpdateStatus}
              onToggleItem={handleToggleItem}
              filterStation={activeStation !== 'all' ? activeStation : undefined}
            />

            {/* 2. Em Preparação */}
            <KdsColumn
              status="preparando"
              title="2. Em Preparação"
              subtitle="Na chapa / produção"
              orders={preparando}
              onUpdateStatus={handleUpdateStatus}
              onToggleItem={handleToggleItem}
              filterStation={activeStation !== 'all' ? activeStation : undefined}
            />

            {/* 3. Prontos */}
            <KdsColumn
              status="pronto"
              title="3. Prontos"
              subtitle="Disponível p/ retirada"
              orders={prontos}
              onUpdateStatus={handleUpdateStatus}
              onToggleItem={handleToggleItem}
              filterStation={activeStation !== 'all' ? activeStation : undefined}
            />
          </div>
        ) : (
          /* Priority Queue View: Ordered by urgency/time */
          <div className="flex-1 flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 p-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Fila Prioritária por Tempo de Espera</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {activeOrders.length} tickets ativos
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Ordenado por tempo de entrada do pedido para priorizar os pedidos mais antigos
                </p>
              </div>
            </div>

            {activeOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
                <p className="text-sm font-semibold">Nenhum pedido em fila neste momento</p>
                <p className="text-xs text-slate-600 mt-1">
                  Use o botão "+ Totem Autoatendimento" para gerar novos pedidos
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {activeOrders.map((ord) => (
                  <OrderCard
                    key={ord.id}
                    order={ord}
                    onUpdateStatus={handleUpdateStatus}
                    onToggleItem={handleToggleItem}
                    filterStation={activeStation !== 'all' ? activeStation : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <KioskSimulatorModal
        isOpen={isKioskModalOpen}
        onClose={() => setIsKioskModalOpen(false)}
        onSubmitOrder={handleCreateOrder}
        nextOrderNumber={nextOrderNumber}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={loadOrders}
      />

      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        deliveredOrders={entregues}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
