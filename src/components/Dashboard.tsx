import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar, NavigationTab } from './Sidebar';
import { PetsView } from './PetsView';
import { CadastroPetView } from './CadastroPetView';
import { PerfilPetView } from './PerfilPetView';
import { FinanceiroView } from './FinanceiroView';
import { ThemeToggle } from './ThemeToggle';
import { 
  getDashboardStats, 
  DashboardStats, 
  seedDemoData 
} from '../services/petService';
import { 
  PawPrint, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  ChevronRight, 
  Scissors, 
  Activity, 
  ShieldCheck, 
  Menu,
  Phone,
  Mail,
  Loader2,
  User
} from 'lucide-react';
import { Button } from './ui/Button';

export const Dashboard: React.FC = () => {
  const { user, profissional } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalPets: 0,
    atendimentosSemana: 0,
    petsSemRetorno: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const displayName = profissional?.nome || user?.name || 'Profissional Pet';
  const firstName = displayName.split(' ')[0];

  // Carregamento de dados em tempo real do Neon
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!user?.id) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getDashboardStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handler para popular dados de teste caso o banco esteja vazio
  const handleSeedDemo = async () => {
    if (!user?.id) return;
    setIsSeeding(true);
    try {
      const success = await seedDemoData(user.id);
      if (success) {
        await loadDashboardData();
      }
    } catch (e) {
      console.error('Erro ao inserir dados de teste:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleOpenPetProfile = (petId: string) => {
    setSelectedPetId(petId);
    setActiveTab('perfil-pet');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Menu Lateral Fixo */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        petsCount={stats.totalPets}
        isOpenMobile={isMobileSidebarOpen}
        onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Conteúdo Principal com compensação da Sidebar fixa (lg:ml-72) */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all">
        {/* Top Header Barra Superior */}
        <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-2xs backdrop-blur-md transition-colors">
          <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Botão de Menu Mobile */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {activeTab === 'dashboard'
                    ? 'Painel da Clínica Estética Pet'
                    : activeTab === 'novo-pet'
                    ? 'Cadastro de Novo Pet'
                    : activeTab === 'perfil-pet'
                    ? 'Perfil do Pet'
                    : activeTab === 'financeiro'
                    ? 'Gestão Financeira da Clínica'
                    : 'Gerenciamento de Pets'}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <ThemeToggle variant="icon" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Sincronizar em tempo real"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline text-xs font-semibold">Atualizar</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('novo-pet')}
                className="shadow-sm shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Pet</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Corpo da Página */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === 'novo-pet' ? (
            <CadastroPetView
              onBack={() => setActiveTab('pets')}
              onPetSaved={(savedPet) => {
                loadDashboardData(true);
                setSelectedPetId(savedPet.id);
                setActiveTab('perfil-pet');
              }}
            />
          ) : activeTab === 'perfil-pet' && selectedPetId ? (
            <PerfilPetView
              petId={selectedPetId}
              onBack={() => {
                setSelectedPetId(null);
                setActiveTab('pets');
              }}
              onPetUpdated={() => loadDashboardData(true)}
            />
          ) : activeTab === 'pets' ? (
            <PetsView
              onSelectPet={handleOpenPetProfile}
              onOpenNewPetPage={() => setActiveTab('novo-pet')}
            />
          ) : activeTab === 'financeiro' ? (
            <FinanceiroView onSelectPet={handleOpenPetProfile} />
          ) : (
            <>
              {/* Banner de Boas-Vindas */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-indigo-950 dark:to-slate-900 border border-transparent dark:border-blue-800/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 dark:shadow-black/40 relative overflow-hidden transition-colors">
                <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-center">
                  <PawPrint className="w-72 h-72 text-white" />
                </div>

                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3 border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                    <span>Dados Sincronizados em Tempo Real com o Neon</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                    Olá, {firstName}! 🐾
                  </h1>

                  <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                    Acompanhe aqui o resumo dos banhos e tosas da semana, total de cães e gatos ativos e os pets que precisam agendar retorno.
                  </p>
                </div>
              </div>

              {/* Botão de Ajuda para Popular Dados de Teste (quando 0 pets) */}
              {stats.totalPets === 0 && !loading && (
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100">
                        Sua clínica está pronta para receber os primeiros pets!
                      </h3>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                        Deseja preencher com cães e gatos de exemplo (Thor, Mel e Luna) para visualizar os 3 cards e a listagem funcionando?
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSeedDemo}
                    loading={isSeeding}
                    className="shrink-0"
                  >
                    <span>Inserir Pets de Exemplo</span>
                  </Button>
                </div>
              )}

              {/* Seção dos 3 Cards Principais */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Visão Geral da Clínica</span>
                  </h2>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Indicadores em tempo real
                  </span>
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-blue-700 dark:text-blue-400 font-medium bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600 dark:text-blue-500" />
                    <span>Carregando indicadores em tempo real...</span>
                  </div>
                ) : (
                  <>
                    {/* Linha com os Cards 1 e 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* CARD 1 — Total de pets ativos */}
                      <div 
                        onClick={() => setActiveTab('pets')}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                            <PawPrint className="w-7 h-7" />
                          </div>

                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Cães &amp; Gatos</span>
                          </span>
                        </div>

                        <div className="mt-5">
                          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                            Total de Pets Ativos
                          </h3>
                          <div className="flex items-baseline gap-3 mt-2">
                            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                              {stats.totalPets}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              cadastrados por você
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700">
                          <span>Ver lista de pets</span>
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>

                      {/* CARD 2 — Banho e Tosa da semana */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500/50 transition-all relative overflow-hidden">
                        <div className="flex items-start justify-between">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
                            <Scissors className="w-7 h-7" />
                          </div>

                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Semana Atual</span>
                          </span>
                        </div>

                        <div className="mt-5">
                          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                            Banho e Tosa da Semana
                          </h3>
                          <div className="flex items-baseline gap-3 mt-2">
                            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                              {stats.atendimentosSemana}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              atendimentos registrados nesta semana
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Período: Segunda a Domingo</span>
                          <span className="text-blue-700 dark:text-blue-400 font-semibold">Em tempo real</span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 3 — Pets sem retorno */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                                &gt; 30 dias sem banho/tosa
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              Pets Sem Retorno
                            </h3>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {stats.petsSemRetorno.length > 0 ? (
                            <span className="font-semibold text-amber-700 dark:text-amber-400">
                              {stats.petsSemRetorno.length} pet(s) precisam de agendamento
                            </span>
                          ) : (
                            <span className="text-blue-700 dark:text-blue-400 font-medium">
                              Tudo em dia
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Conteúdo da Lista do Card 3 */}
                      <div className="mt-6">
                        {stats.petsSemRetorno.length === 0 ? (
                          /* Regra: "Se não houver pets sem retorno, exibir a mensagem 'Nenhum pet sem retorno no momento'" */
                          <div className="py-12 px-4 text-center rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-3 shadow-2xs">
                              <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                              Nenhum pet sem retorno no momento
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                              Todos os pets atendidos estão com retorno agendado ou realizaram banho/tosa há menos de 30 dias.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                              Clique em um pet da lista para abrir seu perfil completo:
                            </p>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {stats.petsSemRetorno.map((item) => {
                                const dataFormatada = item.ultimo_atendimento_data 
                                  ? new Date(item.ultimo_atendimento_data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                                  : 'Não informada';

                                return (
                                  <div
                                    key={item.pet_id}
                                    onClick={() => handleOpenPetProfile(item.pet_id)}
                                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                  >
                                    <div className="flex items-center gap-3.5">
                                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                        {item.nome_pet.charAt(0).toUpperCase()}
                                      </div>

                                      <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                          <span>{item.nome_pet}</span>
                                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                                            {item.especie}{item.porte ? ` • ${item.porte}` : ''}
                                          </span>
                                          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Ver Perfil
                                          </span>
                                        </h4>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                            <User className="w-3 h-3 text-slate-400" />
                                            Tutor(a): {item.nome_tutor}
                                          </span>
                                          {item.whatsapp_tutor && (
                                            <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium">
                                              <Phone className="w-3 h-3" />
                                              {item.whatsapp_tutor}
                                            </span>
                                          )}
                                          {item.email_tutor && (
                                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                              <Mail className="w-3 h-3" />
                                              {item.email_tutor}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60">
                                      <div className="text-left sm:text-right">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 block">
                                          Último banho/tosa: <strong className="text-slate-800 dark:text-slate-200">{dataFormatada}</strong>
                                        </span>
                                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                                          {item.dias_sem_atendimento} dias sem retorno
                                        </span>
                                      </div>

                                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/70 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white text-slate-400 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0">
                                        <ChevronRight className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
