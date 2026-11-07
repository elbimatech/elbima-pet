import React, { useState } from 'react';
import { X, Scissors, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { createAtendimento, Atendimento } from '../services/petService';

interface NovoAtendimentoModalProps {
  petId: string;
  petNome?: string;
  isOpen: boolean;
  onClose: () => void;
  onAtendimentoSaved: (atendimento: Atendimento) => void;
}

const SERVICOS_SUGERIDOS = [
  'Banho',
  'Banho + Tosa Higiênica',
  'Banho + Hidratação Profunda',
  'Tosa Completa na Máquina',
  'Tosa na Tesoura / Tosa Bebê',
  'Tosa da Raça + Hidratação',
  'Banho Terapêutico',
  'Desembolamento + Banho',
];

const NIVEIS_NOS = ['Sem nós', 'Poucos nós', 'Muitos nós'] as const;

export const NovoAtendimentoModal: React.FC<NovoAtendimentoModalProps> = ({
  petId,
  petNome,
  isOpen,
  onClose,
  onAtendimentoSaved,
}) => {
  // Data de hoje no formato YYYY-MM-DD (local)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [dataAtendimento, setDataAtendimento] = useState(getTodayDate());
  const [servicoRealizado, setServicoRealizado] = useState('Banho + Tosa Higiênica');
  const [nivelNosPelagem, setNivelNosPelagem] = useState<string>('Sem nós');
  const [valorCobrado, setValorCobrado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [proximoRetorno, setProximoRetorno] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId) return;

    if (!dataAtendimento) {
      setErrorMessage('Por favor, informe a data do atendimento.');
      return;
    }

    if (!servicoRealizado.trim()) {
      setErrorMessage('Por favor, informe o serviço estético realizado.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const created = await createAtendimento(petId, {
        data_atendimento: dataAtendimento,
        peso: null,
        servico_realizado: servicoRealizado ? servicoRealizado.trim() : 'Banho e Tosa',
        nivel_nos_pelagem: nivelNosPelagem || 'Sem nós',
        valor_cobrado: valorCobrado ? parseFloat(valorCobrado) : null,
        observacoes: observacoes ? observacoes.trim() : null,
        proximo_retorno: proximoRetorno || null,
      });

      if (created) {
        setDataAtendimento(getTodayDate());
        setServicoRealizado('Banho + Tosa Higiênica');
        setNivelNosPelagem('Sem nós');
        setValorCobrado('');
        setObservacoes('');
        setProximoRetorno('');

        onAtendimentoSaved(created);
        onClose();
      }
    } catch (err) {
      console.error('Erro ao salvar atendimento:', err);
      setErrorMessage('Ocorreu um erro ao salvar o atendimento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="novo-atendimento-modal-title"
      >
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h2 id="novo-atendimento-modal-title" className="text-xl font-extrabold text-white tracking-tight">
                Novo Atendimento (Banho e Tosa)
              </h2>
              <p className="text-xs text-blue-100">
                {petNome ? `Registro de atendimento estético para ${petNome}` : 'Registro de banho, tosa e avaliação estética do pet'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            aria-label="Fechar modal de novo atendimento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Data do Atendimento e Próximo Retorno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="novo-atendimento-data"
              label="Data do Atendimento"
              type="date"
              value={dataAtendimento}
              onChange={(e) => setDataAtendimento(e.target.value)}
              required
            />

            <Input
              id="novo-atendimento-proximo-retorno"
              label="Próximo Retorno Sugerido"
              type="date"
              value={proximoRetorno}
              onChange={(e) => setProximoRetorno(e.target.value)}
            />
          </div>

          {/* Serviço realizado */}
          <div className="space-y-2">
            <Input
              id="novo-atendimento-servico"
              label="Serviço Estético Realizado"
              placeholder="Ex: Banho + Tosa Higiênica"
              value={servicoRealizado}
              onChange={(e) => setServicoRealizado(e.target.value)}
              required
            />
            <div className="flex flex-wrap gap-1.5">
              {SERVICOS_SUGERIDOS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setServicoRealizado(sug)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${servicoRealizado === sug
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Nível de nós na pelagem & Valor cobrado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Condição / Nível de nós na pelagem
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {NIVEIS_NOS.map((nivel) => (
                  <button
                    key={nivel}
                    type="button"
                    onClick={() => setNivelNosPelagem(nivel)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${nivelNosPelagem === nivel
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
            </div>

            <Input
              id="novo-atendimento-valor"
              label="Valor cobrado em R$ (opcional)"
              type="number"
              step="0.01"
              placeholder="Ex: 95.00"
              value={valorCobrado}
              onChange={(e) => setValorCobrado(e.target.value)}
            />
          </div>

          {/* Observações do Banho/Tosa */}
          <div>
            <label
              htmlFor="novo-atendimento-observacoes"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Observações do banho/tosa (texto livre)
            </label>
            <textarea
              id="novo-atendimento-observacoes"
              rows={3}
              placeholder="Descreva comportamento na mesa, condição da pelagem/pele/ouvidos, shampoos e hidratantes utilizados..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium resize-none"
            />
          </div>

          {/* Footer com botões */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="shadow-md shadow-blue-600/25"
            >
              <Check className="w-4 h-4" />
              <span>Salvar atendimento</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
