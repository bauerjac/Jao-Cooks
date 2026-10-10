import React from 'react';
import { Order, OrderStatus } from '../types';
import { OrderCard } from './OrderCard';
import { Inbox, Flame, CheckCircle, PackageOpen } from 'lucide-react';

interface KdsColumnProps {
  status: OrderStatus;
  title: string;
  subtitle: string;
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onToggleItem: (orderId: string, itemId: string) => void;
  filterStation?: string;
}

export const KdsColumn: React.FC<KdsColumnProps> = ({
  status,
  title,
  subtitle,
  orders,
  onUpdateStatus,
  onToggleItem,
  filterStation,
}) => {
  const getHeaderConfig = () => {
    switch (status) {
      case 'recebido':
        return {
          icon: <Inbox className="w-5 h-5 text-amber-400" />,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          borderTop: 'border-t-4 border-t-amber-500',
        };
      case 'preparando':
        return {
          icon: <Flame className="w-5 h-5 text-orange-400" />,
          badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          borderTop: 'border-t-4 border-t-orange-500',
        };
      case 'pronto':
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          borderTop: 'border-t-4 border-t-emerald-500',
        };
      default:
        return {
          icon: <PackageOpen className="w-5 h-5 text-blue-400" />,
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          borderTop: 'border-t-4 border-t-blue-500',
        };
    }
  };

  const config = getHeaderConfig();

  return (
    <div
      className={`flex flex-col bg-slate-900/40 rounded-xl border border-slate-800 ${config.borderTop} h-full min-w-[310px] md:min-w-[340px] flex-1 overflow-hidden shadow-lg`}
    >
      {/* Column Header */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shadow-sm">
            {config.icon}
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider font-mono">
              {title}
            </h2>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Counter Badge */}
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold border ${config.badgeBg}`}
        >
          {orders.length}
        </span>
      </div>

      {/* Cards List container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
        {orders.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-800 text-slate-500">
            <p className="text-xs font-semibold">Nenhum pedido nesta etapa</p>
            <p className="text-[11px] text-slate-600 mt-1">
              {status === 'recebido'
                ? 'Novos pedidos do totem aparecerão aqui'
                : status === 'preparando'
                ? 'Inicie o preparo de um pedido recebido'
                : 'Pedidos prontos aguardarão retirada aqui'}
            </p>
          </div>
        ) : (
          orders.map((ord) => (
            <OrderCard
              key={ord.id}
              order={ord}
              onUpdateStatus={onUpdateStatus}
              onToggleItem={onToggleItem}
              filterStation={filterStation}
            />
          ))
        )}
      </div>
    </div>
  );
};
