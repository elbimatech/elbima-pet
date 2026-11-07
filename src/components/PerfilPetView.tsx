import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getPetDetalhes, 
  updatePet, 
  deleteAtendimento, 
  getMovimentacoesFinanceirasClinica,
  updateStatusTransacaoFinanceira,
  deleteTransacaoFinanceira,
  Pet, 
  Atendimento, 
  MovimentacaoFinanceira 
} from '../services/petService';
import { 
  calculatePetAgeLabel, 
  formatPhone, 
  formatTimeInput, 
  toISODateString 
} from '../lib/petHelpers';
import { 
  ESPECIES_OPCOES,
  PORTES_OPCOES,
  SEXOS_OPCOES,
  TIPOS_PELAGEM_OPCOES,
  SERVICOS_PREDEFINIDOS,
  CONDICOES_SAUDE_PREDEFINIDAS,
  RESTRICOES_PRODUTOS_PREDEFINIDAS,
  ALERGIAS_PREDEFINIDAS,
  TEMPERAMENTOS_OPCOES
} from './CadastroPetView';
import { AestheticEvolutionPanel } from './AestheticEvolutionPanel';
import { NovoAtendimentoModal } from './NovoAtendimentoModal';
import { NovaTransacaoModal } from './NovaTransacaoModal';
import { 
  ArrowLeft, 
  PawPrint, 
  User, 
  Phone, 
  Mail, 
  Scissors, 
  Heart, 
  Loader2,
  Save,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  DollarSign,
  ArrowUpRight,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';

interface PerfilPetViewProps {
  petId: string;
  onBack: () => void;
  onPetUpdated?: () => void;
}

export const PerfilPetView: React.FC<PerfilPetViewProps> = ({
  petId,
  onBack,
  onPetUpdated,
}) => {
  const { user } = useAuth();

  // Estados principais carregados do Neon
  const [pet, setPet] = useState<Pet | null>(null);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [movimentacoesPet, setMovimentacoesPet] = useState<MovimentacaoFinanceira[]>([]);
  const [loading, setLoading] = useState(true);

  // Navegação entre as 3 seções do perfil:
  // Dados do Pet, Atendimentos (Banho e Tosa) e Financeiro do Pet
  const [activeSection, setActiveSection] = useState<'dados' | 'atendimentos' | 'financeiro'>('dados');

  // Sub-abas da Seção 1 (Dados do Pet): Dados do Pet e Tutor, Pelagem e Saúde, Comportamento e Rotina
  const [activeDataTab, setActiveDataTab] = useState<'pet_tutor' | 'pelagem_saude' | 'comportamento'>('pet_tutor');

  // Modal de Novo Atendimento
  const [isNovoAtendimentoOpen, setIsNovoAtendimentoOpen] = useState(false);

  // Modal de Novo Lançamento Financeiro / Pacote para este Pet
  const [isNovaTransacaoOpen, setIsNovaTransacaoOpen] = useState(false);

  // Estados de salvamento e feedback da Seção 1
  const [savingPet, setSavingPet] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ==========================================
  // CAMPOS EDITÁVEIS — ABA 1 (PET E TUTOR)
  // ==========================================
  const [nomePet, setNomePet] = useState('');
  const [especie, setEspecie] = useState('Cão');
  const [raca, setRaca] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('Macho');
  const [porte, setPorte] = useState('Pequeno');
  const [nomeTutor, setNomeTutor] = useState('');
  const [whatsappTutor, setWhatsappTutor] = useState('');
  const [emailTutor, setEmailTutor] = useState('');

  // ==========================================
  // CAMPOS EDITÁVEIS — ABA 2 (PELAGEM E SAÚDE)
  // ==========================================
  const [pesoInicial, setPesoInicial] = useState('');
  const [tipoPelagem, setTipoPelagem] = useState('Curta');
  const [servicosPreferidos, setServicosPreferidos] = useState<string[]>([]);
  const [objetivoEstetico, setObjetivoEstetico] = useState('');
  const [condicoesSaude, setCondicoesSaude] = useState<string[]>([]);
  const [customCondicao, setCustomCondicao] = useState('');
  const [restricoesProdutos, setRestricoesProdutos] = useState<string[]>([]);
  const [customRestricao, setCustomRestricao] = useState('');
  const [alergias, setAlergias] = useState<string[]>([]);
  const [customAlergia, setCustomAlergia] = useState('');
  const [medicamentosUso, setMedicamentosUso] = useState('');
  const [antipulgasAtual, setAntipulgasAtual] = useState('');

  // ==========================================
  // CAMPOS EDITÁVEIS — ABA 3 (COMPORTAMENTO E ROTINA)
  // ==========================================
  const [temperamento, setTemperamento] = useState('Dócil');
  const [frequenciaBanhoDias, setFrequenciaBanhoDias] = useState('');
  const [horarioPreferencial, setHorarioPreferencial] = useState('');
  const [usaEnfeites, setUsaEnfeites] = useState<boolean>(true);
  const [cuidadosEspeciaisDescricao, setCuidadosEspeciaisDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const populateForm = (p: Pet) => {
    setNomePet(p.nome_pet || '');
    setEspecie(p.especie || 'Cão');
    setRaca(p.raca || '');
    setDataNascimento(toISODateString(p.data_nascimento));
    setSexo(p.sexo || 'Macho');
    setPorte(p.porte || 'Pequeno');
    setNomeTutor(p.nome_tutor || '');
    setWhatsappTutor(p.whatsapp_tutor ? formatPhone(p.whatsapp_tutor) : '');
    setEmailTutor(p.email_tutor || '');

    setPesoInicial(p.peso_inicial !== null && p.peso_inicial !== undefined ? String(p.peso_inicial) : '');
    setTipoPelagem(p.tipo_pelagem || 'Curta');
    setServicosPreferidos(p.servicos_preferidos || []);
    setObjetivoEstetico(p.objetivo_estetico || '');
    setCondicoesSaude(p.condicoes_saude || []);
    setRestricoesProdutos(p.restricoes_produtos || []);
    setAlergias(p.alergias || []);
    setMedicamentosUso(p.medicamentos_uso || '');
    setAntipulgasAtual(p.antipulgas_atual || '');

    setTemperamento(p.temperamento || 'Dócil');
    setFrequenciaBanhoDias(
      p.frequencia_banho_dias !== null && p.frequencia_banho_dias !== undefined
        ? String(p.frequencia_banho_dias)
        : ''
    );
    setHorarioPreferencial(p.horario_preferencial || '');
    setUsaEnfeites(p.usa_enfeites ?? true);
    setCuidadosEspeciaisDescricao(p.cuidados_especiais_descricao || '');
    setObservacoes(p.observacoes || '');
  };

  const loadData = async () => {
    if (!petId || !user?.id) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await getPetDetalhes(petId, user.id);
      if (res.pet) {
        setPet(res.pet);
        populateForm(res.pet);
      }
      setAtendimentos(res.atendimentos || []);

      const movs = await getMovimentacoesFinanceirasClinica(user.id, petId);
      setMovimentacoesPet(movs || []);
    } catch (err) {
      console.error('Erro ao carregar perfil do pet:', err);
      setErrorMessage('Erro ao carregar os dados do pet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [petId, user?.id]);

  // Idade calculada em tempo real
  const idadePetLabel = calculatePetAgeLabel(dataNascimento);

  // Helpers para listas de múltipla escolha com opção "Nenhuma"
  const toggleArrayItem = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (item === 'Nenhuma') {
      if (currentList.includes('Nenhuma')) {
        setList([]);
      } else {
        setList(['Nenhuma']);
      }
      return;
    }

    const withoutNenhuma = currentList.filter((x) => x !== 'Nenhuma');
    if (withoutNenhuma.includes(item)) {
      setList(withoutNenhuma.filter((x) => x !== item));
    } else {
      setList([...withoutNenhuma, item]);
    }
  };

  const addCustomItem = (
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const withoutNenhuma = list.filter((x) => x !== 'Nenhuma');
    if (!withoutNenhuma.includes(trimmed)) {
      setList([...withoutNenhuma, trimmed]);
    }
    setValue('');
  };

  // Salvar alterações nos dados do pet (Seção 1)
  const handleSavePet = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!petId || !user?.id) return;

    if (!nomePet.trim() || !nomeTutor.trim()) {
      setErrorMessage('O nome do pet e o nome do tutor são obrigatórios.');
      return;
    }

    setSavingPet(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await updatePet(petId, user.id, {
        nome_pet: nomePet.trim(),
        especie: especie || 'Cão',
        raca: raca ? raca.trim() : null,
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        porte: porte || null,
        peso_inicial: pesoInicial ? parseFloat(pesoInicial) : null,
        nome_tutor: nomeTutor.trim(),
        whatsapp_tutor: whatsappTutor ? whatsappTutor.trim() : null,
        email_tutor: emailTutor ? emailTutor.trim() : null,
        tipo_pelagem: tipoPelagem || null,
        servicos_preferidos: servicosPreferidos,
        objetivo_estetico: objetivoEstetico ? objetivoEstetico.trim() : null,
        temperamento: temperamento || null,
        condicoes_saude: condicoesSaude,
        restricoes_produtos: restricoesProdutos,
        alergias,
        medicamentos_uso: medicamentosUso ? medicamentosUso.trim() : null,
        antipulgas_atual: antipulgasAtual ? antipulgasAtual.trim() : null,
        frequencia_banho_dias: frequenciaBanhoDias ? parseInt(frequenciaBanhoDias, 10) : null,
        horario_preferencial: horarioPreferencial ? formatTimeInput(horarioPreferencial) : null,
        usa_enfeites: usaEnfeites,
        cuidados_especiais_descricao: usaEnfeites ? cuidadosEspeciaisDescricao.trim() : null,
        observacoes: observacoes ? observacoes.trim() : null,
      });

      if (updated) {
        setPet(updated);
        setSuccessMessage('Alterações salvas com sucesso no Neon!');
        if (onPetUpdated) {
          onPetUpdated();
        }
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao atualizar pet:', err);
      setErrorMessage('Ocorreu um erro ao salvar as alterações. Tente novamente.');
    } finally {
      setSavingPet(false);
    }
  };

  // Excluir atendimento
  const handleDeleteAtendimento = async (atendimentoId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este atendimento do histórico?')) return;
    try {
      await deleteAtendimento(atendimentoId);
      setAtendimentos((prev) => prev.filter((a) => a.id !== atendimentoId));
      if (onPetUpdated) onPetUpdated();
    } catch (err) {
      console.error('Erro ao excluir atendimento:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-blue-700 dark:text-blue-400 font-medium">
        <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-600 dark:text-blue-500" />
        <span className="text-sm">Carregando perfil e histórico do pet...</span>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xs">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pet não encontrado</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
          Este registro pode ter sido removido ou não pertence ao seu usuário.
        </p>
        <Button variant="secondary" size="md" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Pets</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Botão de Retorno e Ação Principal no Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors shadow-2xs">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span>Voltar para Lista de Pets</span>
        </button>

        <div className="flex items-center gap-2">
          {activeSection === 'dados' && (
            <Button
              variant="primary"
              size="md"
              loading={savingPet}
              onClick={() => handleSavePet()}
              className="shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Salvar alterações</span>
            </Button>
          )}

          {activeSection === 'atendimentos' && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsNovoAtendimentoOpen(true)}
              className="shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Atendimento</span>
            </Button>
          )}
        </div>
      </div>

      {/* Alertas de Sucesso ou Erro */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-blue-700 dark:text-blue-400 hover:text-blue-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-900 dark:text-red-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 dark:text-red-400 hover:text-red-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Card de Identidade do Pet */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-blue-900/10 dark:shadow-black/40 relative overflow-hidden transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-inner shrink-0">
              {nomePet ? nomePet.charAt(0).toUpperCase() : <PawPrint className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-blue-100 uppercase tracking-wide border border-white/20">
                  {especie === 'Gato' ? '🐱 Gato' : '🐶 Cão'} &bull; {porte || 'Porte não informado'}
                </span>
                {raca && (
                  <span className="text-xs text-blue-100 font-medium">
                    &bull; {raca}
                  </span>
                )}
                {sexo && (
                  <span className="text-xs text-blue-100 font-medium">
                    &bull; {sexo}
                  </span>
                )}
                {idadePetLabel && (
                  <span className="text-xs text-blue-100 font-medium">
                    &bull; {idadePetLabel}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {nomePet || pet.nome_pet}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100 mt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-300" />
                  Tutor(a): <strong className="text-white">{nomeTutor || pet.nome_tutor}</strong>
                </span>
                {whatsappTutor && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-300" />
                    {whatsappTutor}
                  </span>
                )}
                {emailTutor && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-300" />
                    {emailTutor}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resumo Rápido no Header */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-black/15 dark:bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Porte</span>
              <span className="text-sm font-extrabold text-white">{porte || '-'}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Pelagem</span>
              <span className="text-sm font-extrabold text-white">{tipoPelagem || '-'}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Temperamento</span>
              <span className="text-sm font-extrabold text-white">{temperamento || '-'}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Banho/Tosa</span>
              <span className="text-sm font-extrabold text-white">{atendimentos.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação entre as 3 Seções Principais (Prompt 5) */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-wrap items-center gap-2 transition-colors">
        <button
          onClick={() => setActiveSection('dados')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'dados'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PawPrint className="w-4 h-4" />
          <span>Dados do Pet</span>
        </button>

        <button
          onClick={() => setActiveSection('atendimentos')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative cursor-pointer ${
            activeSection === 'atendimentos'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Atendimentos (Banho e Tosa)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeSection === 'atendimentos'
                ? 'bg-white/20 text-white'
                : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
            }`}
          >
            {atendimentos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('financeiro')}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'financeiro'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Financeiro do Pet</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeSection === 'financeiro'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {movimentacoesPet.length}
          </span>
        </button>
      </div>

      {/* ========================================================
          SEÇÃO 1 — DADOS DO PET (EDITÁVEIS DIRETAMENTE NAS 3 ABAS)
         ======================================================== */}
      {activeSection === 'dados' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          {/* Sub-navegação nas mesmas 3 abas do cadastro */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-3 sm:gap-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveDataTab('pet_tutor')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeDataTab === 'pet_tutor'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PawPrint className="w-4 h-4" />
              <span>1. Dados do Pet e Tutor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDataTab('pelagem_saude')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeDataTab === 'pelagem_saude'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>2. Pelagem e Saúde</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDataTab('comportamento')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeDataTab === 'comportamento'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>3. Comportamento e Rotina</span>
            </button>
          </div>

          <form onSubmit={handleSavePet} className="space-y-6">
            {/* ABA 1 — DADOS DO PET E TUTOR */}
            {activeDataTab === 'pet_tutor' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      Nome do pet *
                    </label>
                    <input
                      type="text"
                      value={nomePet}
                      onChange={(e) => setNomePet(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      Espécie *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ESPECIES_OPCOES.map((esp) => (
                        <button
                          key={esp}
                          type="button"
                          onClick={() => setEspecie(esp)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            especie === esp
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {esp === 'Cão' ? '🐶 Cão' : '🐱 Gato'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Raça
                    </label>
                    <input
                      type="text"
                      value={raca}
                      onChange={(e) => setRaca(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Data de nascimento
                      </label>
                      {idadePetLabel && (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          🎂 {idadePetLabel}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Sexo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SEXOS_OPCOES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSexo(s)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            sexo === s
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-800 dark:text-blue-300'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Porte
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PORTES_OPCOES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPorte(p)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          porte === p
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      Nome completo do tutor *
                    </label>
                    <input
                      type="text"
                      value={nomeTutor}
                      onChange={(e) => setNomeTutor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      WhatsApp do tutor
                    </label>
                    <input
                      type="text"
                      value={whatsappTutor}
                      onChange={(e) => setWhatsappTutor(formatPhone(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      E-mail do tutor
                    </label>
                    <input
                      type="email"
                      value={emailTutor}
                      onChange={(e) => setEmailTutor(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2 — PELAGEM E SAÚDE */}
            {activeDataTab === 'pelagem_saude' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tipo de pelagem
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {TIPOS_PELAGEM_OPCOES.map((pel) => (
                        <button
                          key={pel}
                          type="button"
                          onClick={() => setTipoPelagem(pel)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            tipoPelagem === pel
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {pel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Serviços Preferidos */}
                <div className="space-y-2.5">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    Serviços preferidos / contratados
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICOS_PREDEFINIDOS.map((srv) => {
                      const isSelected = servicosPreferidos.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => toggleArrayItem(servicosPreferidos, setServicosPreferidos, srv)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{srv}</span>
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="Objetivo estético / estilo de tosa..."
                    value={objetivoEstetico}
                    onChange={(e) => setObjetivoEstetico(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>

                {/* Condições de saúde */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    Condições de saúde ou pele
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleArrayItem(condicoesSaude, setCondicoesSaude, 'Nenhuma')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        condicoesSaude.includes('Nenhuma')
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Nenhuma
                    </button>
                    {CONDICOES_SAUDE_PREDEFINIDAS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleArrayItem(condicoesSaude, setCondicoesSaude, c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                          condicoesSaude.includes(c)
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar outra condição..."
                      value={customCondicao}
                      onChange={(e) => setCustomCondicao(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => addCustomItem(customCondicao, setCustomCondicao, condicoesSaude, setCondicoesSaude)}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Restrições e Alergias */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      Restrições de produtos/equipamentos
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleArrayItem(restricoesProdutos, setRestricoesProdutos, 'Nenhuma')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          restricoesProdutos.includes('Nenhuma')
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                        }`}
                      >
                        Nenhuma
                      </button>
                      {RESTRICOES_PRODUTOS_PREDEFINIDAS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleArrayItem(restricoesProdutos, setRestricoesProdutos, r)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                            restricoesProdutos.includes(r)
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 font-bold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Outra restrição..."
                        value={customRestricao}
                        onChange={(e) => setCustomRestricao(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => addCustomItem(customRestricao, setCustomRestricao, restricoesProdutos, setRestricoesProdutos)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      Alergias conhecidas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleArrayItem(alergias, setAlergias, 'Nenhuma')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          alergias.includes('Nenhuma')
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                        }`}
                      >
                        Nenhuma
                      </button>
                      {ALERGIAS_PREDEFINIDAS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleArrayItem(alergias, setAlergias, a)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                            alergias.includes(a)
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 font-bold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Outra alergia..."
                        value={customAlergia}
                        onChange={(e) => setCustomAlergia(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => addCustomItem(customAlergia, setCustomAlergia, alergias, setAlergias)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Medicamentos ou shampoos terapêuticos
                    </label>
                    <input
                      type="text"
                      value={medicamentosUso}
                      onChange={(e) => setMedicamentosUso(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Antipulgas / Vermífugo atual
                    </label>
                    <input
                      type="text"
                      value={antipulgasAtual}
                      onChange={(e) => setAntipulgasAtual(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3 — COMPORTAMENTO E ROTINA */}
            {activeDataTab === 'comportamento' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    Temperamento no banho e tosa
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {TEMPERAMENTOS_OPCOES.map((item) => {
                      const isSelected = temperamento === item.value;
                      return (
                        <div
                          key={item.value}
                          onClick={() => setTemperamento(item.value)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Frequência ideal de banho (dias)
                    </label>
                    <input
                      type="number"
                      value={frequenciaBanhoDias}
                      onChange={(e) => setFrequenciaBanhoDias(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Horário preferencial de atendimento
                    </label>
                    <input
                      type="text"
                      value={horarioPreferencial}
                      onChange={(e) => setHorarioPreferencial(e.target.value)}
                      onBlur={(e) => setHorarioPreferencial(formatTimeInput(e.target.value))}
                      placeholder="Ex: 09:00"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Aceita enfeites e finalização (laços, gravatas, bandanas, colônia)?
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUsaEnfeites(true)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          usaEnfeites
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200'
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsaEnfeites(false)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          !usaEnfeites
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>

                  {usaEnfeites && (
                    <input
                      type="text"
                      placeholder="Preferências de laços, gravatinhas, bandanas ou colônia..."
                      value={cuidadosEspeciaisDescricao}
                      onChange={(e) => setCuidadosEspeciaisDescricao(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Observações gerais e manejo
                  </label>
                  <textarea
                    rows={3}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Barra Inferior com Botão "Salvar alterações" */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Todas as alterações são salvas diretamente no Neon.
              </span>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={savingPet}
                className="shadow-md shadow-blue-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Salvar alterações</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          SEÇÃO 2 — ATENDIMENTOS (PAINEL ESTÉTICO + LISTA + MODAL)
         ======================================================== */}
      {activeSection === 'atendimentos' && (
        <div className="space-y-6">
          {/* Painel de acompanhamento estético e condição da pelagem sempre visível */}
          <AestheticEvolutionPanel
            atendimentos={atendimentos}
            tipoPelagem={tipoPelagem}
            frequenciaIdealDias={frequenciaBanhoDias ? parseInt(frequenciaBanhoDias, 10) : null}
            onOpenNovoAtendimento={() => setIsNovoAtendimentoOpen(true)}
          />

          {/* Histórico / Lista de Atendimentos em ordem cronológica decrescente */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Histórico de Atendimentos ({atendimentos.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Banhos, tosas e hidratações em ordem cronológica decrescente (mais recente primeiro)
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNovoAtendimentoOpen(true)}
                className="shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Atendimento</span>
              </Button>
            </div>

            {atendimentos.length === 0 ? (
              <div className="py-14 text-center bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nenhum atendimento registrado ainda
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-sm">
                  Utilize o botão "Novo Atendimento" acima para registrar o primeiro banho ou tosa deste pet.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setIsNovoAtendimentoOpen(true)}>
                  <Plus className="w-4 h-4" />
                  <span>Novo Atendimento</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {atendimentos.map((a, index) => {
                  const dataFormatada = new Date(a.data_atendimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                  const retornoFormatado = a.proximo_retorno
                    ? new Date(a.proximo_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                    : null;

                  return (
                    <div
                      key={a.id}
                      className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600/50 transition-all shadow-2xs group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200/70 dark:border-slate-700/60">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              index === 0 ? 'bg-blue-600 ring-4 ring-blue-500/20' : 'bg-slate-400 dark:bg-slate-500'
                            }`}
                          />
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            Atendimento em {dataFormatada}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              Mais recente
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {retornoFormatado ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Próximo Retorno: {retornoFormatado}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              Sem retorno agendado
                            </span>
                          )}

                          <button
                            onClick={() => handleDeleteAtendimento(a.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Excluir atendimento"
                            aria-label="Excluir atendimento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Grade de Detalhes do Atendimento */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase">
                            Serviço Estético Realizado
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                            {a.servico_realizado || 'Banho e Tosa'}
                          </span>
                        </div>

                        <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase">
                            Condição / Nível de Nós na Pelagem
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {a.nivel_nos_pelagem || 'Sem nós'}
                          </span>
                        </div>

                        <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase">
                            Valor Cobrado
                          </span>
                          <span className="text-base font-extrabold text-blue-700 dark:text-blue-400">
                            {a.valor_cobrado !== null && a.valor_cobrado !== undefined
                              ? `R$ ${Number(a.valor_cobrado).toFixed(2)}`
                              : '-'}
                          </span>
                        </div>
                      </div>

                      {a.observacoes && (
                        <div className="mt-3 pt-2.5 text-xs text-slate-600 dark:text-slate-300 italic bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                          "{a.observacoes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SEÇÃO 3 — FINANCEIRO E PACOTES DO PET
         ======================================================== */}
      {activeSection === 'financeiro' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Histórico Financeiro e Pacotes — {pet.nome_pet}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Valores cobrados nos atendimentos de banho e tosa e pacotes mensais vinculados a este pet
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsNovaTransacaoOpen(true)}
              className="shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Pacote / Cobrança</span>
            </Button>
          </div>

          {/* Cards de Resumo Financeiro do Pet */}
          {(() => {
            const totalFaturadoPet = movimentacoesPet.reduce(
              (acc, item) => acc + Number(item.valor || 0),
              0
            );
            const ticketMedioPet =
              movimentacoesPet.length > 0 ? totalFaturadoPet / movimentacoesPet.length : 0;
            const ultimoLancamento = movimentacoesPet[0] || null;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-600/15">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 block">
                    Total Faturado com {pet.nome_pet}
                  </span>
                  <span className="text-2xl font-extrabold mt-1 block">
                    {totalFaturadoPet.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                  <span className="text-xs text-blue-100 mt-1 block">
                    {movimentacoesPet.length}{' '}
                    {movimentacoesPet.length === 1 ? 'registro financeiro' : 'registros financeiros'}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Ticket Médio do Pet
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                    {ticketMedioPet.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                    Média por banho/tosa ou pacote
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Último Pagamento Registrado
                  </span>
                  <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400 mt-1 block">
                    {ultimoLancamento
                      ? Number(ultimoLancamento.valor).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      : '-'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                    {ultimoLancamento
                      ? `Em ${new Date(ultimoLancamento.data).toLocaleDateString('pt-BR', {
                          timeZone: 'UTC',
                        })}`
                      : 'Sem pagamentos ainda'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Lista de Movimentações do Pet */}
          {movimentacoesPet.length === 0 ? (
            <div className="py-14 text-center bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-2xs">
                <DollarSign className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Nenhuma cobrança ou pacote registrado ainda
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-md">
                Os valores informados nos atendimentos de banho e tosa ou lançados como pacotes mensais aparecerão listados aqui automaticamente.
              </p>
              <Button variant="secondary" size="sm" onClick={() => setIsNovaTransacaoOpen(true)}>
                <Plus className="w-4 h-4" />
                <span>Lançar Primeiro Pacote / Cobrança</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {movimentacoesPet.map((mov) => {
                const dataFormatada = new Date(mov.data).toLocaleDateString('pt-BR', {
                  timeZone: 'UTC',
                });
                return (
                  <div
                    key={mov.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100/80 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {mov.descricao}
                          </h4>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {mov.categoria}
                          </span>
                          {mov.origem === 'atendimento' && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                              Atendimento Banho/Tosa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Data: <strong>{dataFormatada}</strong> &bull; {mov.forma_pagamento}
                        </p>
                        {mov.observacoes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1">
                            "{mov.observacoes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <button
                        type="button"
                        disabled={mov.origem === 'atendimento'}
                        onClick={async () => {
                          if (mov.origem !== 'lancamento' || !user?.id) return;
                          const novoStatus = mov.status === 'Pago' ? 'Pendente' : 'Pago';
                          const ok = await updateStatusTransacaoFinanceira(
                            mov.id,
                            user.id,
                            novoStatus
                          );
                          if (ok) {
                            setMovimentacoesPet((prev) =>
                              prev.map((m) =>
                                m.id === mov.id ? { ...m, status: novoStatus } : m
                              )
                            );
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          mov.status === 'Pago'
                            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
                            : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                        } ${mov.origem === 'lancamento' ? 'cursor-pointer hover:opacity-80' : ''}`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{mov.status}</span>
                      </button>

                      <span className="text-base font-extrabold text-blue-700 dark:text-blue-400">
                        {Number(mov.valor).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>

                      {mov.origem === 'lancamento' && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user?.id) return;
                            if (!window.confirm('Deseja excluir este lançamento financeiro?'))
                              return;
                            const ok = await deleteTransacaoFinanceira(mov.id, user.id);
                            if (ok) {
                              setMovimentacoesPet((prev) =>
                                prev.filter((m) => m.id !== mov.id)
                              );
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
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
      )}

      {/* Modal de Novo Atendimento */}
      <NovoAtendimentoModal
        petId={petId}
        petNome={pet.nome_pet}
        isOpen={isNovoAtendimentoOpen}
        onClose={() => setIsNovoAtendimentoOpen(false)}
        onAtendimentoSaved={async (novoAtendimento) => {
          setAtendimentos((prev) =>
            [novoAtendimento, ...prev].sort(
              (a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()
            )
          );
          if (user?.id) {
            const movs = await getMovimentacoesFinanceirasClinica(user.id, petId);
            setMovimentacoesPet(movs || []);
          }
          if (onPetUpdated) {
            onPetUpdated();
          }
        }}
      />

      {/* Modal de Novo Lançamento Financeiro do Pet */}
      {user?.id && (
        <NovaTransacaoModal
          profissionalId={user.id}
          defaultPetId={pet.id}
          defaultPetNome={pet.nome_pet}
          isOpen={isNovaTransacaoOpen}
          onClose={() => setIsNovaTransacaoOpen(false)}
          onSaved={async () => {
            const movs = await getMovimentacoesFinanceirasClinica(user.id, petId);
            setMovimentacoesPet(movs || []);
          }}
        />
      )}
    </div>
  );
};
