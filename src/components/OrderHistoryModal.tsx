import React, { useState } from 'react';
import {
  X,
  History,
  Search,
  RotateCcw,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatTime, formatDateTime, getElapsedMinutes } from '../utils/time';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveredOrders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  deliveredOrders,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredOrders = deliveredOrders.filter((ord) => {
    const matchesNum = ord.order_number.toString().includes(searchTerm);
    const matchesName = ord.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesNum || matchesName;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Histórico de Pedidos Entregues
              </h3>
              <p className="text-xs text-slate-400">
                Auditoria de pedidos finalizados, tempos de atendimento e opção de reabertura
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número do pedido (#104) ou cliente..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Total entregues: <span className="font-bold text-white">{deliveredOrders.length}</span>
          </div>
        </div>

        {/* List of delivered orders */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Nenhum pedido entregue encontrado.
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const totalPrepMins = getElapsedMinutes(
                ord.created_at,
                ord.delivered_at || ord.finished_prep_at
              );

              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-sm font-mono text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        #{ord.order_number}
                      </span>
                      <span className="font-bold text-slate-200">{ord.customer_name}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                        {ord.table_number || ord.order_type}
                      </span>
                    </div>

                    {/* Items preview */}
                    <div className="text-slate-300">
                      {ord.items.map((it) => (
                        <span key={it.id} className="inline-block mr-2 font-medium">
                          {it.quantity}x {it.name}
                          {it.notes ? ` (Obs: ${it.notes})` : ''}
                        </span>
                      ))}
                    </div>

                    {/* Timestamps audit */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDateTime(ord.created_at)}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Clock className="w-3 h-3" />
                        Tempo total: {totalPrepMins} min
                      </span>
                    </div>
                  </div>

                  {/* Actions: Reopen */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onUpdateStatus(ord.id, 'pronto');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                      title="Devolver para a lista de Prontos no KDS"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reabrir Pedido</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
