import React from 'react';
import { Scissors, Sparkles, Calendar, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Atendimento } from '../services/petService';
import { Button } from './ui/Button';

interface AestheticEvolutionPanelProps {
  atendimentos: Atendimento[];
  tipoPelagem?: string | null;
  frequenciaIdealDias?: number | null;
  onOpenNovoAtendimento?: () => void;
}

export const AestheticEvolutionPanel: React.FC<AestheticEvolutionPanelProps> = ({
  atendimentos,
  tipoPelagem,
  frequenciaIdealDias,
  onOpenNovoAtendimento,
}) => {
  // Ordenar do mais recente para o mais antigo
  const sortedDesc = [...atendimentos].sort(
    (a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()
  );

  // Ordenar cronologicamente (mais antigo -> mais recente) para a linha do tempo estética
  const chronological = [...sortedDesc].reverse();

  const ultimoAtendimento = sortedDesc[0] || null;

  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        timeZone: 'UTC',
      });
    } catch {
      return dateStr;
    }
  };

  const getCoatConditionBadge = (nivel?: string | null) => {
    const label = nivel || 'Sem nós';
    if (label === 'Muitos nós') {
      return {
        label,
        badgeClass:
          'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        dotClass: 'bg-amber-500',
      };
    }
    if (label === 'Poucos nós') {
      return {
        label,
        badgeClass:
          'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
        dotClass: 'bg-sky-500',
      };
    }
    return {
      label: 'Sem nós',
      badgeClass:
        'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      dotClass: 'bg-blue-600',
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
      {/* Cabeçalho do Painel Estético */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Acompanhamento Estético e Condição da Pelagem
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resumo dos serviços de banho, tosa, hidratação e qualidade da pelagem ao longo das visitas
            </p>
          </div>
        </div>

        {tipoPelagem && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 text-xs font-bold text-blue-700 dark:text-blue-300">
              Pelagem: {tipoPelagem}
            </span>
            {frequenciaIdealDias && (
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                Ciclo ideal: a cada {frequenciaIdealDias} dias
              </span>
            )}
          </div>
        )}
      </div>

      {/* Estado Vazio: "Nenhum atendimento registrado ainda" */}
      {atendimentos.length === 0 ? (
        <div className="h-56 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100/70 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-2xs">
            <Scissors className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Nenhum atendimento registrado ainda
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Registre o primeiro banho ou tosa para acompanhar os serviços realizados e a evolução da pelagem deste pet.
          </p>
          {onOpenNovoAtendimento && (
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={onOpenNovoAtendimento}>
                <Plus className="w-4 h-4" />
                <span>Registrar Primeiro Atendimento</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Cards de Indicadores Estéticos */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Total de Visitas
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                {atendimentos.length} {atendimentos.length === 1 ? 'atendimento' : 'atendimentos'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Último Serviço Realizado
              </span>
              <span className="text-sm font-extrabold text-blue-700 dark:text-blue-300 mt-1 block line-clamp-1">
                {ultimoAtendimento?.servico_realizado || 'Banho e Tosa'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Em {ultimoAtendimento ? formatShortDate(ultimoAtendimento.data_atendimento) : '-'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Última Condição da Pelagem
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                {ultimoAtendimento?.nivel_nos_pelagem === 'Muitos nós' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {ultimoAtendimento?.nivel_nos_pelagem || 'Sem nós'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Próximo Retorno Agendado
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-sm font-extrabold text-blue-900 dark:text-blue-200">
                  {ultimoAtendimento?.proximo_retorno
                    ? formatShortDate(ultimoAtendimento.proximo_retorno)
                    : 'Não agendado'}
                </span>
              </div>
            </div>
          </div>

          {/* Linha do Tempo Visual da Pelagem e Serviços */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Linha do Tempo de Banhos, Tosas e Nível de Nós na Pelagem
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Últimos {Math.min(chronological.length, 6)} registros
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {chronological.slice(-6).map((item) => {
                const badge = getCoatConditionBadge(item.nivel_nos_pelagem);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-2xs"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">
                        {formatShortDate(item.data_atendimento)}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1 mt-0.5">
                        {item.servico_realizado || 'Banho e Tosa'}
                      </span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border w-fit ${badge.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
