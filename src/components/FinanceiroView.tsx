import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMovimentacoesFinanceirasClinica,
  getPets,
  updateStatusTransacaoFinanceira,
  deleteTransacaoFinanceira,
  MovimentacaoFinanceira,
  Pet,
} from '../services/petService';
import { NovaTransacaoModal } from './NovaTransacaoModal';
import { Button } from './ui/Button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Scissors,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  PawPrint,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

interface FinanceiroViewProps {
  onSelectPet?: (petId: string) => void;
}

const MESES_NOMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({ onSelectPet }) => {
  const { user } = useAuth();

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [periodoFiltro, setPeriodoFiltro] = useState<'todos' | 'mes'>('todos');
  const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'Pago' | 'Pendente'>('todos');
  const [busca, setBusca] = useState('');

  // Modal Novo Lançamento
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadFinanceiro = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [movs, listaPets] = await Promise.all([
        getMovimentacoesFinanceirasClinica(user.id),
        getPets(user.id),
      ]);
      setMovimentacoes(movs);
      setPets(listaPets);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceiro();
  }, [user?.id]);

  // Movimentações filtradas pelo período (Mês/Ano ou Todos)
  const movsPorPeriodo = useMemo(() => {
    if (periodoFiltro === 'todos') return movimentacoes;
    return movimentacoes.filter((m) => m.data.startsWith(mesSelecionado));
  }, [movimentacoes, periodoFiltro, mesSelecionado]);

  // Indicadores calculados em cima do período selecionado
  const resumo = useMemo(() => {
    const receitas = movsPorPeriodo.filter((m) => m.tipo === 'receita');
    const despesas = movsPorPeriodo.filter((m) => m.tipo === 'despesa');

    const totalReceitas = receitas.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const receitasPagas = receitas
      .filter((r) => r.status === 'Pago')
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const receitasPendentes = receitas
      .filter((r) => r.status === 'Pendente')
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const totalDespesas = despesas.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const saldoLiquido = totalReceitas - totalDespesas;

    // Ticket médio considerando atendimentos e pacotes de receita
    const qtdServicosReceita = receitas.length;
    const ticketMedio = qtdServicosReceita > 0 ? totalReceitas / qtdServicosReceita : 0;

    // Agrupamento de receitas por serviço/categoria
    const mapaServicos = new Map<string, { valor: number; qtd: number }>();
    receitas.forEach((r) => {
      const cat = r.categoria || 'Banho e Tosa';
      const atual = mapaServicos.get(cat) || { valor: 0, qtd: 0 };
      mapaServicos.set(cat, {
        valor: atual.valor + Number(r.valor || 0),
        qtd: atual.qtd + 1,
      });
    });

    const rankingServicos = Array.from(mapaServicos.entries())
      .map(([nome, info]) => ({
        nome,
        valor: info.valor,
        qtd: info.qtd,
        percentual: totalReceitas > 0 ? Math.round((info.valor / totalReceitas) * 100) : 0,
      }))
      .sort((a, b) => b.valor - a.valor);

    // Agrupamento de despesas por categoria
    const mapaDespesas = new Map<string, { valor: number; qtd: number }>();
    despesas.forEach((d) => {
      const cat = d.categoria || 'Outros';
      const atual = mapaDespesas.get(cat) || { valor: 0, qtd: 0 };
      mapaDespesas.set(cat, {
        valor: atual.valor + Number(d.valor || 0),
        qtd: atual.qtd + 1,
      });
    });

    const rankingDespesas = Array.from(mapaDespesas.entries())
      .map(([nome, info]) => ({
        nome,
        valor: info.valor,
        qtd: info.qtd,
        percentual: totalDespesas > 0 ? Math.round((info.valor / totalDespesas) * 100) : 0,
      }))
      .sort((a, b) => b.valor - a.valor);

    return {
      totalReceitas,
      receitasPagas,
      receitasPendentes,
      totalDespesas,
      saldoLiquido,
      ticketMedio,
      qtdServicosReceita,
      rankingServicos,
      rankingDespesas,
    };
  }, [movsPorPeriodo]);

  // Movimentações exibidas na tabela (aplicando filtros de tipo, status e busca)
  const movsFiltradas = useMemo(() => {
    return movsPorPeriodo.filter((m) => {
      if (tipoFiltro !== 'todos' && m.tipo !== tipoFiltro) return false;
      if (statusFiltro !== 'todos' && m.status !== statusFiltro) return false;

      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const matchDesc = m.descricao.toLowerCase().includes(termo);
        const matchCat = m.categoria.toLowerCase().includes(termo);
        const matchPet = (m.nome_pet || '').toLowerCase().includes(termo);
        const matchTutor = (m.nome_tutor || '').toLowerCase().includes(termo);
        return matchDesc || matchCat || matchPet || matchTutor;
      }

      return true;
    });
  }, [movsPorPeriodo, tipoFiltro, statusFiltro, busca]);

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch {
      return dateStr;
    }
  };

  const handleToggleStatus = async (mov: MovimentacaoFinanceira) => {
    if (mov.origem !== 'lancamento' || !user?.id) return;
    const novoStatus = mov.status === 'Pago' ? 'Pendente' : 'Pago';
    const ok = await updateStatusTransacaoFinanceira(mov.id, user.id, novoStatus);
    if (ok) {
      setMovimentacoes((prev) =>
        prev.map((item) => (item.id === mov.id ? { ...item, status: novoStatus } : item))
      );
    }
  };

  const handleDeleteLancamento = async (mov: MovimentacaoFinanceira) => {
    if (mov.origem !== 'lancamento' || !user?.id) return;
    if (!window.confirm(`Deseja realmente excluir o lançamento "${mov.descricao}"?`)) return;
    const ok = await deleteTransacaoFinanceira(mov.id, user.id);
    if (ok) {
      setMovimentacoes((prev) => prev.filter((item) => item.id !== mov.id));
    }
  };

  const getMesLabel = (yyyyMm: string) => {
    const [ano, mes] = yyyyMm.split('-');
    const idx = parseInt(mes, 10) - 1;
    return `${MESES_NOMES[idx] || mes} de ${ano}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho da Aba Financeira */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-colors">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 mb-1">
              Gestão Financeira Estética Pet
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Financeiro da Clínica
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Controle de faturamento de banhos, tosas, pacotes mensais e despesas operacionais
            </p>
          </div>
        </div>

        {/* Filtro de Período + Botão Novo Lançamento */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setPeriodoFiltro('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodoFiltro === 'todos'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Todo o Histórico
            </button>
            <button
              type="button"
              onClick={() => setPeriodoFiltro('mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodoFiltro === 'mes'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Filtrar por Mês
            </button>
          </div>

          {periodoFiltro === 'mes' && (
            <input
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            className="shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
          <Loader2 className="w-9 h-9 animate-spin mb-3" />
          <span className="text-sm font-medium">Calculando indicadores financeiros em tempo real...</span>
        </div>
      ) : (
        <>
          {/* 4 Cards Principais de Resumo Financeiro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Receita Total */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Receita Bruta
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/50">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(resumo.totalReceitas)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="text-blue-600 dark:text-blue-400">
                    Pago: {formatCurrency(resumo.receitasPagas)}
                  </span>
                  {resumo.receitasPendentes > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      &bull; Pendente: {formatCurrency(resumo.receitasPendentes)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Despesas da Clínica */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Despesas Operacionais
                </span>
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/50 dark:border-rose-800/50">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(resumo.totalDespesas)}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                  Cosméticos, insumos, manutenção e contas
                </p>
              </div>
            </div>

            {/* Card 3: Saldo / Lucro Líquido */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-5 sm:p-6 shadow-lg shadow-blue-900/15 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  Saldo / Lucro Líquido
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {formatCurrency(resumo.saldoLiquido)}
                </p>
                <p className="text-[11px] font-medium text-blue-100 mt-2">
                  {periodoFiltro === 'mes'
                    ? `Resultado em ${getMesLabel(mesSelecionado)}`
                    : 'Resultado acumulado total'}
                </p>
              </div>
            </div>

            {/* Card 4: Ticket Médio por Atendimento */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ticket Médio (Banho/Tosa)
                </span>
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/50 dark:border-sky-800/50">
                  <Scissors className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(resumo.ticketMedio)}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                  Baseado em {resumo.qtdServicosReceita}{' '}
                  {resumo.qtdServicosReceita === 1 ? 'serviço faturado' : 'serviços faturados'}
                </p>
              </div>
            </div>
          </div>

          {/* Painel de Análise por Serviço Estético & Despesas por Categoria */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receitas por Serviço */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Faturamento por Serviço Estético</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Participação dos serviços de banho, tosa e pacotes na receita
                  </p>
                </div>
              </div>

              {resumo.rankingServicos.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  Nenhuma receita registrada neste período.
                </div>
              ) : (
                <div className="space-y-3">
                  {resumo.rankingServicos.slice(0, 5).map((srv) => (
                    <div key={srv.nome} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[60%]">
                          {srv.nome}{' '}
                          <span className="text-slate-400 font-normal">({srv.qtd}x)</span>
                        </span>
                        <span className="font-extrabold text-blue-700 dark:text-blue-300">
                          {formatCurrency(srv.valor)} ({srv.percentual}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-300"
                          style={{ width: `${Math.max(srv.percentual, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Despesas por Categoria */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Despesas por Categoria</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Distribuição dos custos operacionais da clínica
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lançar Despesa</span>
                </Button>
              </div>

              {resumo.rankingDespesas.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  Nenhuma despesa registrada neste período.
                </div>
              ) : (
                <div className="space-y-3">
                  {resumo.rankingDespesas.slice(0, 5).map((desp) => (
                    <div key={desp.nome} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[60%]">
                          {desp.nome}{' '}
                          <span className="text-slate-400 font-normal">({desp.qtd}x)</span>
                        </span>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400">
                          {formatCurrency(desp.valor)} ({desp.percentual}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                          style={{ width: `${Math.max(desp.percentual, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lista Completa de Movimentações Financeiras */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Histórico de Movimentações ({movsFiltradas.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Integração automática dos valores cobrados em Banho e Tosa + Lançamentos manuais
                </p>
              </div>

              {/* Barra de Filtros */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Busca */}
                <div className="relative min-w-[210px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar serviço, pet, tutor..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtro Tipo */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700">
                  {(['todos', 'receita', 'despesa'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoFiltro(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        tipoFiltro === t
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
                    </button>
                  ))}
                </div>

                {/* Filtro Status */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700">
                  {(['todos', 'Pago', 'Pendente'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFiltro(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusFiltro === st
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {st === 'todos' ? 'Status: Todos' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {movsFiltradas.length === 0 ? (
              <div className="py-14 text-center bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
                <DollarSign className="w-10 h-10 text-blue-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nenhuma movimentação financeira encontrada
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-md mx-auto">
                  Registre o valor cobrado em um atendimento de banho/tosa ou adicione um novo lançamento financeiro.
                </p>
                <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Lançamento</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {movsFiltradas.map((mov) => {
                  const isReceita = mov.tipo === 'receita';
                  return (
                    <div
                      key={mov.id}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            isReceita
                              ? 'bg-blue-100/80 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                              : 'bg-rose-100/80 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isReceita ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {mov.descricao}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {mov.categoria}
                            </span>
                            {mov.origem === 'atendimento' && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                Atendimento Automático
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatDateBR(mov.data)}
                            </span>

                            <span>&bull; {mov.forma_pagamento}</span>

                            {mov.nome_pet && (
                              <button
                                type="button"
                                onClick={() => mov.pet_id && onSelectPet && onSelectPet(mov.pet_id)}
                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                              >
                                <PawPrint className="w-3 h-3" />
                                <span>
                                  {mov.nome_pet}
                                  {mov.nome_tutor ? ` (Tutor: ${mov.nome_tutor})` : ''}
                                </span>
                              </button>
                            )}
                          </div>

                          {mov.observacoes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1">
                              "{mov.observacoes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/60">
                        {/* Badge Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(mov)}
                          disabled={mov.origem === 'atendimento'}
                          title={
                            mov.origem === 'lancamento'
                              ? 'Clique para alternar entre Pago e Pendente'
                              : 'Atendimento concluído'
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                            mov.status === 'Pago'
                              ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
                              : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                          } ${mov.origem === 'lancamento' ? 'cursor-pointer hover:opacity-80' : ''}`}
                        >
                          {mov.status === 'Pago' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{mov.status}</span>
                        </button>

                        {/* Valor */}
                        <span
                          className={`text-base font-extrabold whitespace-nowrap ${
                            isReceita
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isReceita ? '+' : '-'} {formatCurrency(mov.valor)}
                        </span>

                        {/* Botão Excluir (apenas lançamentos manuais) */}
                        {mov.origem === 'lancamento' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteLancamento(mov)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Novo Lançamento */}
      {user?.id && (
        <NovaTransacaoModal
          profissionalId={user.id}
          pets={pets}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            loadFinanceiro();
          }}
        />
      )}
    </div>
  );
};

