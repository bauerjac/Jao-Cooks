import React from 'react';
import { ChefHat, AlertTriangle, CheckCircle2, Clock3, UtensilsCrossed, PackageCheck } from 'lucide-react';
import { KitchenStats } from '../types';

interface StatsBarProps {
  stats: KitchenStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs">
      {/* Total Ativos */}
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
        <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Ativos no KDS</span>
          <span className="text-base font-extrabold text-white font-mono">{stats.totalActive}</span>
        </div>
      </div>

      {/* Recebidos */}
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
        <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Clock3 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Aguardando</span>
          <span className="text-base font-extrabold text-amber-300 font-mono">{stats.recebidoCount}</span>
        </div>
      </div>

      {/* Em Preparação */}
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
        <div className="w-8 h-8 rounded-md bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
          <ChefHat className="w-4 h-4" />
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Na Chapa</span>
          <span className="text-base font-extrabold text-orange-400 font-mono">{stats.preparandoCount}</span>
        </div>
      </div>

      {/* Prontos */}
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
        <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Prontos p/ Retirada</span>
          <span className="text-base font-extrabold text-emerald-400 font-mono">{stats.prontoCount}</span>
        </div>
      </div>

      {/* Tempo Médio */}
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
        <div className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
          <Clock3 className="w-4 h-4" />
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Tempo Médio Prep.</span>
          <span className="text-base font-extrabold text-indigo-300 font-mono">
            {stats.averagePrepMinutes} min
          </span>
        </div>
      </div>

      {/* Atrasados / Urgentes */}
      <div
        className={`flex items-center gap-2.5 p-2 rounded-lg border ${
          stats.delayedCount > 0
            ? 'bg-rose-950/40 border-rose-600/50 text-rose-300'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
            stats.delayedCount > 0
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold tracking-wider">Atrasos (&gt;15m)</span>
          <span
            className={`text-base font-extrabold font-mono ${
              stats.delayedCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'
            }`}
          >
            {stats.delayedCount}
          </span>
        </div>
      </div>
    </div>
  );
};
