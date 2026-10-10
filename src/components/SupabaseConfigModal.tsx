import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testSupabaseConnection,
  SQL_SCHEMA_SNIPPET,
} from '../services/supabaseService';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState<string>(currentCreds.url);
  const [anonKey, setAnonKey] = useState<string>(currentCreds.anonKey);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config');

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Por favor, informe a URL e a Anon Key do projeto "Jao Cooks" no Supabase.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      saveSupabaseCredentials(url, anonKey);
      onConfigUpdated();
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigUpdated();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Banco de Dados Supabase • Jao Cooks
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentCreds.url ? 'Configurado' : 'Aguardando Credenciais'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Conecte o seu banco de dados "Jao Cooks" para sincronizar todos os pedidos em tempo real
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

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-0 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'config'
                ? 'border-orange-500 text-orange-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Conectar Credenciais
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-orange-500 text-orange-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Passo a Passo: Criar "Jao Cooks"</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          {activeTab === 'guide' ? (
            /* Step-by-Step Guide for Creating Project "Jao Cooks" on Supabase */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-600/30 text-orange-200 space-y-1.5">
                <h4 className="font-bold flex items-center gap-2 text-sm text-white">
                  <span>Como criar o banco de dados "Jao Cooks" no Supabase:</span>
                </h4>
                <p className="text-slate-300 text-xs">
                  O Supabase é um serviço externo em nuvem que requer sua conta pessoal. Em menos de 2 minutos você cria o banco <strong>Jao Cooks</strong> gratuitamente seguindo os passos abaixo:
                </p>
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold font-mono shrink-0">
                    1
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <h5 className="font-bold text-white text-xs">Criar Novo Projeto no Supabase</h5>
                    <p className="text-slate-400 text-xs">
                      Acesse o Supabase e clique em <strong>"New Project"</strong>. No campo <strong>Name</strong>, digite: <code className="text-amber-300 font-bold bg-slate-900 px-1 py-0.5 rounded">Jao Cooks</code>.
                    </p>
                    <a
                      href="https://supabase.com/dashboard/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] transition shadow"
                    >
                      <span>Abrir Supabase Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold font-mono shrink-0">
                    2
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <h5 className="font-bold text-white text-xs">Criar a Tabela "orders" no SQL Editor</h5>
                    <p className="text-slate-400 text-xs">
                      No menu lateral esquerdo do projeto <strong>Jao Cooks</strong>, clique em <strong>SQL Editor</strong>, cole o código abaixo e clique em <strong>Run</strong>:
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySql}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition cursor-pointer"
                      >
                        {copiedSql ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">SQL Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar SQL de Criação</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold font-mono shrink-0">
                    3
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <h5 className="font-bold text-white text-xs">Copiar as Credenciais do "Jao Cooks"</h5>
                    <p className="text-slate-400 text-xs">
                      Vá em <strong>Project Settings &gt; API</strong> e copie a <strong>Project URL</strong> e a <strong>anon public key</strong>. Cole-as na aba <strong>"Conectar Credenciais"</strong> e clique em Salvar!
                    </p>
                    <button
                      onClick={() => setActiveTab('config')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] transition cursor-pointer"
                    >
                      <span>Ir para aba de Conexão</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Connection Inputs Form */
            <>
              {/* Status info */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-200">
                    Projeto Supabase: <span className="text-amber-400 font-mono">Jao Cooks</span>
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Insira as chaves do seu projeto para sincronizar pedidos entre o totem de autoatendimento, a tela da cozinha e o banco de dados em tempo real.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Project URL (URL do Projeto "Jao Cooks")
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzjaocooks.supabase.co"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Anon Public Key (Chave Anon pública do "Jao Cooks")
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Test results banner */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-600/60 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  )}
                  <span className="font-medium leading-relaxed">{testResult.message}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleTestAndSave}
                  disabled={isTesting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950 transition cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando Banco Jao Cooks...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Testar & Conectar Jao Cooks</span>
                    </>
                  )}
                </button>

                {currentCreds.url && (
                  <button
                    onClick={handleDisconnect}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition cursor-pointer flex items-center gap-1.5"
                    title="Desconectar do Supabase e voltar para banco local"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Desconectar</span>
                  </button>
                )}
              </div>

              {/* SQL Setup Snippet */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Script SQL de Criação da Tabela orders</span>
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-36 custom-scrollbar">
                  {SQL_SCHEMA_SNIPPET}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
