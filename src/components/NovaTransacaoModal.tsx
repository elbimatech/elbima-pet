import React, { useEffect, useState } from 'react';
import { X, DollarSign, ArrowUpCircle, ArrowDownCircle, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import {
  createTransacaoFinanceira,
  Pet,
  TransacaoFinanceira,
} from '../services/petService';

interface NovaTransacaoModalProps {
  profissionalId: string;
  pets?: Pet[];
  defaultPetId?: string | null;
  defaultPetNome?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (transacao: TransacaoFinanceira) => void;
}

export const CATEGORIAS_RECEITA = [
  'Banho e Tosa',
  'Pacote Mensal / Quinzenal',
  'Hidratação e Spa',
  'Venda de Acessórios / Enfeites',
  'Outros',
];

export const CATEGORIAS_DESPESA = [
  'Cosméticos e Shampoos',
  'Enfeites e Finalização',
  'Manutenção e Afiação',
  'Energia / Água / Internet',
  'Aluguel e Taxas',
  'Outros',
];

export const FORMAS_PAGAMENTO = [
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
];

export const NovaTransacaoModal: React.FC<NovaTransacaoModalProps> = ({
  profissionalId,
  pets = [],
  defaultPetId = null,
  defaultPetNome = null,
  isOpen,
  onClose,
  onSaved,
}) => {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [categoria, setCategoria] = useState<string>(CATEGORIAS_RECEITA[0]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataTransacao, setDataTransacao] = useState(getTodayDate());
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pago');
  const [petId, setPetId] = useState<string>(defaultPetId || '');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPetId(defaultPetId || '');
      if (defaultPetId && defaultPetNome) {
        setTipo('receita');
        setCategoria('Pacote Mensal / Quinzenal');
        setDescricao(`Pacote Banho e Tosa — ${defaultPetNome}`);
      }
    }
  }, [isOpen, defaultPetId, defaultPetNome]);

  const handleTipoChange = (novoTipo: 'receita' | 'despesa') => {
    setTipo(novoTipo);
    if (novoTipo === 'receita') {
      setCategoria(CATEGORIAS_RECEITA[0]);
    } else {
      setCategoria(CATEGORIAS_DESPESA[0]);
      setPetId('');
    }
  };

  if (!isOpen) return null;

  const categoriasAtuais = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profissionalId) return;

    if (!descricao.trim()) {
      setErrorMessage('Por favor, informe uma descrição para o lançamento.');
      return;
    }

    const valorNum = parseFloat(valor);
    if (!valor || isNaN(valorNum) || valorNum <= 0) {
      setErrorMessage('Por favor, informe um valor válido em R$ maior que zero.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const created = await createTransacaoFinanceira(profissionalId, {
        tipo,
        categoria,
        descricao: descricao.trim(),
        valor: valorNum,
        forma_pagamento: formaPagamento,
        status,
        data_transacao: dataTransacao,
        pet_id: tipo === 'receita' && petId ? petId : null,
        observacoes: observacoes.trim() ? observacoes.trim() : null,
      });

      if (created) {
        setDescricao('');
        setValor('');
        setDataTransacao(getTodayDate());
        setObservacoes('');
        setStatus('Pago');
        onSaved(created);
        onClose();
      }
    } catch (err) {
      console.error('Erro ao salvar lançamento financeiro:', err);
      setErrorMessage('Ocorreu um erro ao salvar o lançamento no Neon. Tente novamente.');
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
        aria-labelledby="nova-transacao-modal-title"
      >
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 id="nova-transacao-modal-title" className="text-xl font-extrabold text-white tracking-tight">
                Novo Lançamento Financeiro
              </h2>
              <p className="text-xs text-blue-100">
                {defaultPetNome
                  ? `Registrar pacote ou serviço estético para ${defaultPetNome}`
                  : 'Registre receitas de pacotes/serviços ou despesas operacionais da clínica'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white cursor-pointer"
            aria-label="Fechar modal"
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

          {/* Seletor Tipo: Receita ou Despesa */}
          {!defaultPetId && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tipo de Movimentação
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTipoChange('receita')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tipo === 'receita'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Receita (Entrada)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTipoChange('despesa')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tipo === 'despesa'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Despesa (Saída)</span>
                </button>
              </div>
            </div>
          )}

          {/* Descrição */}
          <Input
            id="transacao-descricao"
            label="Descrição do Lançamento *"
            placeholder={
              tipo === 'receita'
                ? 'Ex: Pacote 4 Banhos + Tosa Higiênica, Hidratação de Argan...'
                : 'Ex: Compra de Shampoos Hipoalergênicos, Afiação de Lâminas...'
            }
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />

          {/* Categoria */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Categoria
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categoriasAtuais.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    categoria === cat
                      ? tipo === 'receita'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="transacao-valor"
              label="Valor em R$ *"
              type="number"
              step="0.01"
              placeholder="Ex: 180.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />

            <Input
              id="transacao-data"
              label="Data da Transação *"
              type="date"
              value={dataTransacao}
              onChange={(e) => setDataTransacao(e.target.value)}
              required
            />
          </div>

          {/* Forma de Pagamento e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Forma de Pagamento
              </label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FORMAS_PAGAMENTO.map((fp) => (
                  <option key={fp} value={fp}>
                    {fp}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status do Pagamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Pago', 'Pendente'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      status === st
                        ? st === 'Pago'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vincular a um Pet (se Receita) */}
          {tipo === 'receita' && pets.length > 0 && !defaultPetId && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Vincular a um Pet (opcional)
              </label>
              <select
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sem vínculo específico (Receita Geral)</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome_pet} ({p.especie} — Tutor: {p.nome_tutor})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Observações */}
          <div>
            <label
              htmlFor="transacao-obs"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Observações (opcional)
            </label>
            <textarea
              id="transacao-obs"
              rows={2}
              placeholder="Detalhes do pacote, número de banhos inclusos, fornecedor..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Rodapé */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={loading}>
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
              <span>Salvar Lançamento</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

