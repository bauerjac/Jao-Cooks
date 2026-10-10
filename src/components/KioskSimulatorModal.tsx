import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  MapPin,
  Bike,
  Utensils,
  CheckCircle2,
} from 'lucide-react';
import { JAO_COOKS_MENU, MenuItemDef } from '../data/menuItems';
import { Order, OrderItem } from '../types';

interface KioskSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (order: Order) => Promise<void>;
  nextOrderNumber: number;
}

interface CartItemDraft {
  itemDef: MenuItemDef;
  quantity: number;
  selectedOptions: string[];
  notes: string;
}

export const KioskSimulatorModal: React.FC<KioskSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSubmitOrder,
  nextOrderNumber,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [cart, setCart] = useState<CartItemDraft[]>([]);
  const [customerName, setCustomerName] = useState<string>('Cliente Totem #02');
  const [orderType, setOrderType] = useState<'local' | 'viagem' | 'delivery'>('local');
  const [tableNumber, setTableNumber] = useState<string>('Mesa 08');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'burger', label: 'Hambúrgueres' },
    { id: 'combo', label: 'Combos' },
    { id: 'porcao', label: 'Porções' },
    { id: 'bebida', label: 'Bebidas' },
    { id: 'sobremesa', label: 'Sobremesas' },
  ];

  const filteredMenu =
    selectedCategory === 'todos'
      ? JAO_COOKS_MENU
      : JAO_COOKS_MENU.filter((m) => m.category === selectedCategory);

  const handleAddToCart = (item: MenuItemDef) => {
    setCart((prev) => {
      // Check if item already exists in cart with empty notes
      const existingIndex = prev.findIndex(
        (ci) => ci.itemDef.id === item.id && ci.notes === ''
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      }
      return [
        ...prev,
        {
          itemDef: item,
          quantity: 1,
          selectedOptions: [...item.defaultOptions],
          notes: '',
        },
      ];
    });
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index);
      }
      copy[index].quantity = newQty;
      return copy;
    });
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index].notes = notes;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.itemDef.price * item.quantity, 0);
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    const nowIso = new Date().toISOString();

    const orderItems: OrderItem[] = cart.map((ci, idx) => ({
      id: `it-${Date.now()}-${idx}`,
      name: ci.itemDef.name,
      quantity: ci.quantity,
      category: ci.itemDef.category,
      station: ci.itemDef.station,
      options: ci.selectedOptions,
      notes: ci.notes.trim() || undefined,
      completed: false,
    }));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: nextOrderNumber,
      customer_name: customerName.trim() || `Totem #${nextOrderNumber}`,
      order_type: orderType,
      table_number: orderType === 'local' ? tableNumber.trim() || undefined : undefined,
      status: 'recebido',
      items: orderItems,
      general_notes: generalNotes.trim() || undefined,
      total_price: calculateTotal(),
      created_at: nowIso,
      updated_at: nowIso,
    };

    try {
      await onSubmitOrder(newOrder);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setCart([]);
        setGeneralNotes('');
        setSubmittedSuccess(false);
        onClose();
      }, 900);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Simulador de Autoatendimento Jão Cooks
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Próximo: #{nextOrderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gere pedidos como se fossem enviados pelo totem do salão para a cozinha
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

        {/* Modal Body - 2 Columns (Menu vs Cart) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Column: Menu Catalog */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-slate-800/80 shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{item.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.station}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                    <span className="text-xs font-bold text-amber-400 font-mono mt-1 block">
                      R$ {item.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Details & Cart */}
          <div className="w-full md:w-96 flex flex-col bg-slate-950/40 p-4 overflow-y-auto space-y-4">
            {/* Customer Details */}
            <div className="space-y-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Identificação do Cliente
              </h4>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setOrderType('local')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                    orderType === 'local'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>No Local</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('viagem')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                    orderType === 'viagem'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Viagem</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                    orderType === 'delivery'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Delivery</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nome / Totem</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Ex: João M."
                  />
                </div>

                {orderType === 'local' && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Mesa / Balcão</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="Ex: Mesa 04"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Observação Geral do Pedido (Alergias, etc.)
                </label>
                <input
                  type="text"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Alergia grave a amendoim, separar itens"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                <span>Itens Selecionados ({cart.length})</span>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                  Nenhum item adicionado ainda. Escolha os lanches e porções ao lado.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {cart.map((cartItem, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white truncate">
                          {cartItem.itemDef.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleUpdateQuantity(idx, -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-amber-400">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(idx, 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="w-6 h-6 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 flex items-center justify-center cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Item Notes / Observation for the Cook */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Obs do item (cozinha):</span>
                        </div>
                        <input
                          type="text"
                          value={cartItem.notes}
                          onChange={(e) => handleUpdateNotes(idx, e.target.value)}
                          placeholder="Ex: Sem cebola, Ponto bem passado..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        />
                        {/* Quick pills for notes */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cartItem.itemDef.suggestedNotes.slice(0, 3).map((note, nIdx) => (
                            <button
                              key={nIdx}
                              type="button"
                              onClick={() => handleUpdateNotes(idx, note)}
                              className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
                            >
                              + {note}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Submit to Kitchen */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Total do Pedido:</span>
                <span className="font-extrabold text-white font-mono text-base">
                  R$ {calculateTotal().toFixed(2)}
                </span>
              </div>

              <button
                disabled={cart.length === 0 || isSubmitting}
                onClick={handleSendToKitchen}
                className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
                  submittedSuccess
                    ? 'bg-emerald-600 text-white'
                    : cart.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-950 active:scale-98'
                }`}
              >
                {submittedSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 animate-bounce" />
                    <span>Enviado para a Cozinha!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar para a Cozinha (#{nextOrderNumber})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
