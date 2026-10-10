import React, { useState, useEffect } from 'react';
import {
  Clock,
  Check,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  MapPin,
  ShoppingBag,
  Bike,
  CheckCircle2,
  ChefHat,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatTime, formatElapsedDuration, getUrgencyLevel } from '../utils/time';
import confetti from 'canvas-confetti';
import { kitchenAudio } from '../utils/audio';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onToggleItem: (orderId: string, itemId: string) => void;
  filterStation?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  onToggleItem,
  filterStation,
}) => {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'urgent'>('normal');

  // Update timer every second
  useEffect(() => {
    const update = () => {
      // If completed/delivered, measure until finished or delivered
      const endTimestamp =
        order.status === 'entregue'
          ? order.delivered_at
          : order.status === 'pronto'
          ? order.finished_prep_at
          : undefined;

      setElapsedTime(formatElapsedDuration(order.created_at, endTimestamp));
      setUrgency(getUrgencyLevel(order.created_at));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [order.created_at, order.status, order.delivered_at, order.finished_prep_at]);

  const handleNextStatus = () => {
    if (order.status === 'recebido') {
      onUpdateStatus(order.id, 'preparando');
    } else if (order.status === 'preparando') {
      kitchenAudio.playDing();
      onUpdateStatus(order.id, 'pronto');
    } else if (order.status === 'pronto') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      onUpdateStatus(order.id, 'entregue');
    }
  };

  const handlePrevStatus = () => {
    if (order.status === 'preparando') {
      onUpdateStatus(order.id, 'recebido');
    } else if (order.status === 'pronto') {
      onUpdateStatus(order.id, 'preparando');
    } else if (order.status === 'entregue') {
      onUpdateStatus(order.id, 'pronto');
    }
  };

  // Station badges
  const getStationBadge = (station: string) => {
    switch (station) {
      case 'grelha':
        return { label: 'Grelha', bg: 'bg-red-950/60 text-red-300 border-red-700/50' };
      case 'fritadeira':
        return { label: 'Fritura', bg: 'bg-amber-950/60 text-amber-300 border-amber-700/50' };
      case 'montagem':
        return { label: 'Montagem', bg: 'bg-orange-950/60 text-orange-300 border-orange-700/50' };
      case 'bebidas':
        return { label: 'Bebidas', bg: 'bg-blue-950/60 text-blue-300 border-blue-700/50' };
      default:
        return { label: 'Cozinha', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  // Order type badge
  const getTypeInfo = () => {
    switch (order.order_type) {
      case 'viagem':
        return {
          label: 'Para Viagem',
          icon: <ShoppingBag className="w-3.5 h-3.5" />,
          color: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
        };
      case 'delivery':
        return {
          label: 'Delivery',
          icon: <Bike className="w-3.5 h-3.5" />,
          color: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
        };
      default:
        return {
          label: order.table_number || 'Salão',
          icon: <MapPin className="w-3.5 h-3.5" />,
          color: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
        };
    }
  };

  const typeInfo = getTypeInfo();

  // Urgency styling
  const getUrgencyStyles = () => {
    if (order.status === 'pronto' || order.status === 'entregue') {
      return {
        badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
        borderAccent: 'border-slate-800',
      };
    }
    if (urgency === 'urgent') {
      return {
        badgeBg: 'bg-rose-600/20 text-rose-300 border-rose-500/50 animate-pulse',
        borderAccent: 'border-rose-600/80 shadow-rose-950/30 shadow-lg',
      };
    }
    if (urgency === 'warning') {
      return {
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        borderAccent: 'border-amber-600/60',
      };
    }
    return {
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      borderAccent: 'border-slate-800 hover:border-slate-700',
    };
  };

  const urgencyStyles = getUrgencyStyles();

  // Check if all items are ticked
  const totalItemsCount = order.items.reduce((acc, it) => acc + it.quantity, 0);
  const completedItemsCount = order.items.filter((it) => it.completed).length;

  return (
    <div
      className={`flex flex-col bg-slate-900/90 rounded-xl border ${urgencyStyles.borderAccent} overflow-hidden shadow-md transition-all duration-200 select-none`}
    >
      {/* Header bar of the ticket */}
      <div
        className={`px-3.5 py-2.5 flex items-center justify-between border-b ${
          order.status === 'recebido'
            ? 'bg-amber-950/30 border-amber-900/30'
            : order.status === 'preparando'
            ? 'bg-orange-950/40 border-orange-900/40'
            : order.status === 'pronto'
            ? 'bg-emerald-950/40 border-emerald-900/40'
            : 'bg-slate-950 border-slate-800'
        }`}
      >
        {/* Order Number & Client */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-black font-mono tracking-tight text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-800 shadow-inner">
            #{order.order_number}
          </span>
          <div className="leading-tight">
            <span className="font-bold text-sm text-slate-100 block truncate max-w-[140px] sm:max-w-[180px]">
              {order.customer_name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {formatTime(order.created_at)}
            </span>
          </div>
        </div>

        {/* Elapsed Timer & Badge */}
        <div className="flex items-center gap-2">
          {/* Order Type Tag */}
          <span
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${typeInfo.color}`}
          >
            {typeInfo.icon}
            <span>{typeInfo.label}</span>
          </span>

          {/* Time Elapsed Clock */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono font-bold text-xs ${urgencyStyles.badgeBg}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsedTime}</span>
          </div>
        </div>
      </div>

      {/* General Notes Banner if provided */}
      {order.general_notes && (
        <div className="px-3.5 py-1.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wide">
            Obs Geral: {order.general_notes}
          </span>
        </div>
      )}

      {/* Items Section */}
      <div className="p-3.5 flex-1 divide-y divide-slate-800/80 space-y-2.5">
        {order.items.map((item) => {
          const badge = getStationBadge(item.station);
          const isFaded = item.completed;
          const isHighlightStation = filterStation && filterStation === item.station;

          return (
            <div
              key={item.id}
              onClick={() => onToggleItem(order.id, item.id)}
              className={`pt-2.5 first:pt-0 cursor-pointer group transition-opacity ${
                isFaded ? 'opacity-40' : 'opacity-100'
              } ${isHighlightStation ? 'bg-amber-500/5 -mx-1 px-1 rounded' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1">
                  {/* Item completion toggle checkbox */}
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      item.completed
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-transparent group-hover:border-slate-500'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  {/* Quantity & Item Name */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-sm text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                        {item.quantity}x
                      </span>
                      <span
                        className={`text-sm font-bold text-slate-100 ${
                          item.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Options / Customizations */}
                    {item.options && item.options.length > 0 && (
                      <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-1">
                        {item.options.map((opt, i) => (
                          <span
                            key={i}
                            className="bg-slate-800/70 px-1.5 py-0.5 rounded text-slate-300 border border-slate-750"
                          >
                            + {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Prominent Kitchen Item Notes (Crucial for Kitchen Staff!) */}
                    {item.notes && (
                      <div className="mt-1.5 flex items-start gap-1.5 px-2 py-1 rounded bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs font-bold animate-fadeIn">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>⚠️ OBS: {item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Station Tag */}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${badge.bg}`}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions / Status Transition */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/90 flex items-center justify-between gap-2">
        {/* Undo / Back Button */}
        {order.status !== 'recebido' ? (
          <button
            onClick={handlePrevStatus}
            title="Voltar status anterior"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        ) : (
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Totem</span>
          </div>
        )}

        {/* Progress summary for items */}
        <div className="text-[11px] font-mono text-slate-400">
          <span className="text-emerald-400 font-bold">{completedItemsCount}</span>/
          {order.items.length} itens prontos
        </div>

        {/* Forward Primary Action Button */}
        {order.status === 'recebido' && (
          <button
            onClick={handleNextStatus}
            className="flex-1 max-w-[190px] py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>Iniciar Preparo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {order.status === 'preparando' && (
          <button
            onClick={handleNextStatus}
            className="flex-1 max-w-[190px] py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Marcar Pronto</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {order.status === 'pronto' && (
          <button
            onClick={handleNextStatus}
            className="flex-1 max-w-[190px] py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Entregar Pedido</span>
          </button>
        )}

        {order.status === 'entregue' && (
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <Check className="w-4 h-4" />
            Entregue
          </span>
        )}
      </div>
    </div>
  );
};
