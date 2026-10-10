import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Database,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  PlusCircle,
  Sparkles,
  History,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { StationType } from '../types';
import { kitchenAudio } from '../utils/audio';

interface HeaderProps {
  activeStation: StationType | 'all';
  onSelectStation: (station: StationType | 'all') => void;
  isSupabaseActive: boolean;
  onOpenSupabaseModal: () => void;
  onOpenKioskModal: () => void;
  onOpenHistoryModal: () => void;
  onGenerateQuickOrder: () => void;
  viewMode: 'kanban' | 'queue';
  onToggleViewMode: () => void;
  totalActiveCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeStation,
  onSelectStation,
  isSupabaseActive,
  onOpenSupabaseModal,
  onOpenKioskModal,
  onOpenHistoryModal,
  onGenerateQuickOrder,
  viewMode,
  onToggleViewMode,
  totalActiveCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(kitchenAudio.isEnabled());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const next = kitchenAudio.toggleSound();
    setSoundEnabled(next);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const stations: { id: StationType | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'Todas as Áreas', icon: '🍽️' },
    { id: 'grelha', label: 'Grelha & Chapa', icon: '🔥' },
    { id: 'montagem', label: 'Montagem', icon: '🍔' },
    { id: 'fritadeira', label: 'Fritadeiras', icon: '🍟' },
    { id: 'bebidas', label: 'Bebidas & Copos', icon: '🥤' },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        {/* Brand & KDS Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 font-mono">
                JÃO COOKS
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                KDS COZINHA
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Painel de Produção & Autoatendimento</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-slate-300 font-medium">
                {totalActiveCount} {totalActiveCount === 1 ? 'pedido em aberto' : 'pedidos em aberto'}
              </span>
            </p>
          </div>
        </div>

        {/* Live Clock & Date */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-lg font-bold text-amber-300 tracking-wider">{currentTime}</span>
          <span className="text-xs text-slate-400 uppercase hidden sm:inline pl-1 border-l border-slate-800">
            {currentDate}
          </span>
        </div>

        {/* Main Controls & Integrations */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            title="Gerenciar conexão Supabase"
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isSupabaseActive
                ? 'bg-emerald-950/50 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/40 border-amber-600/40 text-amber-300 hover:bg-amber-900/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {isSupabaseActive ? 'Supabase Conectado' : 'Configurar Supabase'}
            </span>
          </button>

          {/* Quick Order Generator */}
          <button
            onClick={onGenerateQuickOrder}
            title="Gera 1 pedido instantâneo de teste vindo do autoatendimento"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Pedido Rápido</span>
          </button>

          {/* Kiosk Simulator Button */}
          <button
            onClick={onOpenKioskModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-md shadow-orange-950 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Totem Autoatendimento</span>
          </button>

          {/* Audio Bell Switch */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Silenciar alertas de cozinha' : 'Ativar alertas sonoros'}
            className={`p-2 rounded-lg border text-xs transition cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750'
                : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* History Modal Button */}
          <button
            onClick={onOpenHistoryModal}
            title="Histórico de pedidos entregues"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={onToggleViewMode}
            title={viewMode === 'kanban' ? 'Mudar para Fila Única' : 'Mudar para Colunas KDS'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
          >
            {viewMode === 'kanban' ? <Layers className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            title="Alternar Tela Cheia da Cozinha"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer hidden md:flex"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Station Filters Bar */}
      <div className="px-4 py-2 bg-slate-950/80 flex items-center justify-between gap-2 overflow-x-auto border-t border-slate-800/40">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 pr-2 border-r border-slate-800">
          <span>Estação:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {stations.map((st) => {
            const isSelected = activeStation === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onSelectStation(st.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{st.icon}</span>
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 shrink-0 pl-3 border-l border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>&lt;8 min (Normal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>8-14 min (Atenção)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>&gt;15 min (Urgente)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
