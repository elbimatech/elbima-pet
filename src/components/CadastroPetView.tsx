import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPet, Pet } from '../services/petService';
import { 
  formatTimeInput, 
  formatPhone, 
  calculatePetAgeLabel 
} from '../lib/petHelpers';
import { 
  PawPrint, 
  Scissors, 
  Heart, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  X, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2,
  User
} from 'lucide-react';
import { Button } from './ui/Button';

interface CadastroPetViewProps {
  onBack: () => void;
  onPetSaved: (savedPet: Pet) => void;
}

type TabKey = 'pet_tutor' | 'pelagem_saude' | 'comportamento';

// Opções pré-definidas conforme Prompt 4
export const ESPECIES_OPCOES = ['Cão', 'Gato'] as const;
export const PORTES_OPCOES = ['Mini', 'Pequeno', 'Médio', 'Grande', 'Gigante'] as const;
export const SEXOS_OPCOES = ['Macho', 'Fêmea'] as const;
export const TIPOS_PELAGEM_OPCOES = ['Curta', 'Média', 'Longa', 'Dupla', 'Encaracolada', 'Dura'] as const;

export const SERVICOS_PREDEFINIDOS = [
  'Banho',
  'Tosa Higiênica',
  'Tosa na Máquina',
  'Tosa na Tesoura',
  'Tosa da Raça',
  'Hidratação Profunda',
  'Desembolamento',
  'Corte de Unhas',
  'Limpeza de Ouvidos',
  'Escovação de Dentes',
];

export const CONDICOES_SAUDE_PREDEFINIDAS = [
  'Dermatite',
  'Otite recorrente',
  'Pele sensível',
  'Alergia cutânea',
  'Idoso',
  'Problemas articulares/displasia',
  'Cardiopata',
  'Cego/Surdo',
];

export const RESTRICOES_PRODUTOS_PREDEFINIDAS = [
  'Perfume forte',
  'Shampoo comum',
  'Secador quente',
  'Soprador de alta potência',
  'Lâmina baixa',
];

export const ALERGIAS_PREDEFINIDAS = [
  'Picada de pulga (DAPP)',
  'Clorexidina',
  'Fragrâncias',
  'Corantes',
  'Látex',
];

export const TEMPERAMENTOS_OPCOES = [
  { value: 'Dócil', label: 'Dócil', desc: 'Calmo e cooperativo no banho e tosa' },
  { value: 'Agitado', label: 'Agitado', desc: 'Inquieto na mesa, requer atenção constante' },
  { value: 'Medroso', label: 'Medroso', desc: 'Assusta-se com soprador ou barulhos' },
  { value: 'Ansioso', label: 'Ansioso', desc: 'Chora ou fica ofegante longe do tutor' },
  { value: 'Agressivo', label: 'Agressivo', desc: 'Tenta morder ou arranhar no manejo' },
  { value: 'Requer focinheira', label: 'Requer focinheira', desc: 'Uso obrigatório de contenção/focinheira' },
];

export const CadastroPetView: React.FC<CadastroPetViewProps> = ({
  onBack,
  onPetSaved,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('pet_tutor');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // ==========================================
  // ABA 1 — DADOS DO PET E TUTOR
  // ==========================================
  const [nomePet, setNomePet] = useState('');
  const [especie, setEspecie] = useState<string>('Cão');
  const [raca, setRaca] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<string>('Macho');
  const [porte, setPorte] = useState<string>('Pequeno');
  const [nomeTutor, setNomeTutor] = useState('');
  const [whatsappTutor, setWhatsappTutor] = useState('');
  const [emailTutor, setEmailTutor] = useState('');

  // ==========================================
  // ABA 2 — PELAGEM E SAÚDE
  // ==========================================
  const [pesoKg, setPesoKg] = useState('');
  const [tipoPelagem, setTipoPelagem] = useState<string>('Curta');
  const [servicosSelecionados, setServicosSelecionados] = useState<string[]>(['Banho']);
  const [objetivoEstetico, setObjetivoEstetico] = useState('');

  // Condições de saúde
  const [condicoesSelecionadas, setCondicoesSelecionadas] = useState<string[]>([]);
  const [condicaoNenhuma, setCondicaoNenhuma] = useState(false);
  const [customCondicaoInput, setCustomCondicaoInput] = useState('');

  // Restrições de produtos/equipamentos
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState<string[]>([]);
  const [restricaoNenhuma, setRestricaoNenhuma] = useState(false);
  const [customRestricaoInput, setCustomRestricaoInput] = useState('');

  // Alergias
  const [alergiasSelecionadas, setAlergiasSelecionadas] = useState<string[]>([]);
  const [alergiaNenhuma, setAlergiaNenhuma] = useState(false);
  const [customAlergiaInput, setCustomAlergiaInput] = useState('');

  const [medicamentosUso, setMedicamentosUso] = useState('');
  const [antipulgasAtual, setAntipulgasAtual] = useState('');

  // ==========================================
  // ABA 3 — COMPORTAMENTO E ROTINA
  // ==========================================
  const [temperamento, setTemperamento] = useState('Dócil');
  const [frequenciaBanhoDias, setFrequenciaBanhoDias] = useState('15');
  const [horarioPreferencial, setHorarioPreferencial] = useState('');
  const [usaEnfeites, setUsaEnfeites] = useState<boolean>(true);
  const [cuidadosEspeciaisDescricao, setCuidadosEspeciaisDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Cálculo automático da idade do pet
  const idadePetLabel = calculatePetAgeLabel(dataNascimento);

  // Handlers de seleção múltipla
  const toggleServico = (srv: string) => {
    setServicosSelecionados((prev) =>
      prev.includes(srv) ? prev.filter((item) => item !== srv) : [...prev, srv]
    );
  };

  const toggleCondicao = (item: string) => {
    setCondicaoNenhuma(false);
    setCondicoesSelecionadas((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleToggleCondicaoNenhuma = () => {
    if (!condicaoNenhuma) {
      setCondicoesSelecionadas([]);
      setCondicaoNenhuma(true);
    } else {
      setCondicaoNenhuma(false);
    }
  };

  const handleAddCustomCondicao = () => {
    const clean = customCondicaoInput.trim();
    if (clean && !condicoesSelecionadas.includes(clean)) {
      setCondicaoNenhuma(false);
      setCondicoesSelecionadas((prev) => [...prev, clean]);
      setCustomCondicaoInput('');
    }
  };

  const toggleRestricao = (item: string) => {
    setRestricaoNenhuma(false);
    setRestricoesSelecionadas((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    );
  };

  const handleToggleRestricaoNenhuma = () => {
    if (!restricaoNenhuma) {
      setRestricoesSelecionadas([]);
      setRestricaoNenhuma(true);
    } else {
      setRestricaoNenhuma(false);
    }
  };

  const handleAddCustomRestricao = () => {
    const clean = customRestricaoInput.trim();
    if (clean && !restricoesSelecionadas.includes(clean)) {
      setRestricaoNenhuma(false);
      setRestricoesSelecionadas((prev) => [...prev, clean]);
      setCustomRestricaoInput('');
    }
  };

  const toggleAlergia = (item: string) => {
    setAlergiaNenhuma(false);
    setAlergiasSelecionadas((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleToggleAlergiaNenhuma = () => {
    if (!alergiaNenhuma) {
      setAlergiasSelecionadas([]);
      setAlergiaNenhuma(true);
    } else {
      setAlergiaNenhuma(false);
    }
  };

  const handleAddCustomAlergia = () => {
    const clean = customAlergiaInput.trim();
    if (clean && !alergiasSelecionadas.includes(clean)) {
      setAlergiaNenhuma(false);
      setAlergiasSelecionadas((prev) => [...prev, clean]);
      setCustomAlergiaInput('');
    }
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Regra: "Os campos obrigatórios são o nome do pet, espécie e nome do tutor"
    if (!nomePet.trim()) {
      setErrorMessage('Por favor, informe o nome do pet.');
      setActiveTab('pet_tutor');
      return;
    }

    if (!especie.trim()) {
      setErrorMessage('Por favor, selecione a espécie do pet (Cão ou Gato).');
      setActiveTab('pet_tutor');
      return;
    }

    if (!nomeTutor.trim()) {
      setErrorMessage('Por favor, informe o nome completo do tutor.');
      setActiveTab('pet_tutor');
      return;
    }

    if (!user?.id) {
      setErrorMessage('Sessão expirada. Faça login novamente.');
      return;
    }

    setSaving(true);
    try {
      const created = await createPet(user.id, {
        nome_pet: nomePet.trim(),
        especie,
        raca: raca ? raca.trim() : null,
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        porte: porte || null,
        peso_inicial: pesoKg ? parseFloat(pesoKg) : null,
        nome_tutor: nomeTutor.trim(),
        whatsapp_tutor: whatsappTutor ? whatsappTutor.trim() : null,
        email_tutor: emailTutor ? emailTutor.trim() : null,
        tipo_pelagem: tipoPelagem || null,
        servicos_preferidos: servicosSelecionados,
        objetivo_estetico: objetivoEstetico ? objetivoEstetico.trim() : null,
        temperamento: temperamento || null,
        condicoes_saude: condicaoNenhuma ? ['Nenhuma'] : condicoesSelecionadas,
        restricoes_produtos: restricaoNenhuma ? ['Nenhuma'] : restricoesSelecionadas,
        alergias: alergiaNenhuma ? ['Nenhuma'] : alergiasSelecionadas,
        medicamentos_uso: medicamentosUso ? medicamentosUso.trim() : null,
        antipulgas_atual: antipulgasAtual ? antipulgasAtual.trim() : null,
        frequencia_banho_dias: frequenciaBanhoDias ? parseInt(frequenciaBanhoDias, 10) : null,
        horario_preferencial: horarioPreferencial ? formatTimeInput(horarioPreferencial) : null,
        usa_enfeites: usaEnfeites,
        cuidados_especiais_descricao: usaEnfeites ? cuidadosEspeciaisDescricao.trim() : null,
        observacoes: observacoes ? observacoes.trim() : null,
      });

      if (created) {
        setSuccessToast(`Pet "${created.nome_pet}" cadastrado com sucesso!`);
        setTimeout(() => {
          onPetSaved(created);
        }, 700);
      }
    } catch (err) {
      console.error('Erro ao cadastrar pet no Neon:', err);
      setErrorMessage('Erro ao salvar o pet no banco de dados. Verifique a conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Toast de Sucesso Flutuante */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-blue-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-400">
          <CheckCircle2 className="w-5 h-5 text-blue-100" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* Header com Navegação e Título */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors mb-2.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Lista de Pets</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Novo Pet</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              Ficha Estética Completa
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastro de cães e gatos em 3 abas: Dados do Pet e Tutor, Pelagem e Saúde, e Comportamento e Rotina
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onBack}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmit}
            loading={saving}
            className="shadow-md shadow-blue-600/20"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Pet</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Erro caso ocorra */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pet_tutor')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'pet_tutor'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
            activeTab === 'pet_tutor' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            1
          </div>
          <PawPrint className="w-4 h-4" />
          <span>Dados do Pet e Tutor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pelagem_saude')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'pelagem_saude'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
            activeTab === 'pelagem_saude' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            2
          </div>
          <Scissors className="w-4 h-4" />
          <span>Pelagem e Saúde</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comportamento')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'comportamento'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
            activeTab === 'comportamento' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            3
          </div>
          <Heart className="w-4 h-4" />
          <span>Comportamento e Rotina</span>
        </button>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-8">
        
        {/* ========================================================= */}
        {/* ABA 1 — DADOS DO PET E TUTOR */}
        {/* ========================================================= */}
        {activeTab === 'pet_tutor' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Identificação do Pet e do Tutor</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Nome do pet, espécie, porte e dados de contato do responsável.
                </p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">Passo 1 de 3</span>
            </div>

            {/* Nome do Pet & Espécie */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="field-nome-pet" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nome do pet <span className="text-red-500 font-extrabold">*</span>
                </label>
                <input
                  id="field-nome-pet"
                  type="text"
                  placeholder="Ex: Thor, Mel, Luna..."
                  value={nomePet}
                  onChange={(e) => setNomePet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Espécie <span className="text-red-500 font-extrabold">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ESPECIES_OPCOES.map((esp) => (
                    <button
                      key={esp}
                      type="button"
                      onClick={() => setEspecie(esp)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        especie === esp
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {esp === 'Cão' ? '🐶 Cão' : '🐱 Gato'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Raça, Nascimento e Sexo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="field-raca" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Raça
                </label>
                <input
                  id="field-raca"
                  type="text"
                  placeholder="Ex: Shih Tzu, Golden, Persa, SRD"
                  value={raca}
                  onChange={(e) => setRaca(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="field-nasc" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Data de nascimento
                  </label>
                  {idadePetLabel && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      🎂 {idadePetLabel}
                    </span>
                  )}
                </div>
                <input
                  id="field-nasc"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
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

            {/* Porte do Pet */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Porte do Pet
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PORTES_OPCOES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPorte(p)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      porte === p
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Dados do Tutor */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Dados do Tutor (Responsável)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="field-tutor" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    Nome completo do tutor <span className="text-red-500 font-extrabold">*</span>
                  </label>
                  <input
                    id="field-tutor"
                    type="text"
                    placeholder="Ex: Mariana Alencar"
                    value={nomeTutor}
                    onChange={(e) => setNomeTutor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="field-whatsapp" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>WhatsApp do tutor</span>
                  </label>
                  <input
                    id="field-whatsapp"
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={whatsappTutor}
                    onChange={(e) => setWhatsappTutor(formatPhone(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="field-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>E-mail do tutor</span>
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    placeholder="tutor@exemplo.com"
                    value={emailTutor}
                    onChange={(e) => setEmailTutor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => setActiveTab('pelagem_saude')}
              >
                <span>Avançar para Pelagem e Saúde</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2 — PELAGEM E SAÚDE */}
        {/* ========================================================= */}
        {activeTab === 'pelagem_saude' && (
          <div className="space-y-7">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Pelagem, Serviços e Cuidados Dermatológicos</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Características da pelagem, serviços contratados e restrições de saúde/produtos
                </p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">Passo 2 de 3</span>
            </div>

            {/* Tipo de Pelagem */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/40">
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
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        tipoPelagem === pel
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Serviços Preferidos + Objetivo Estético */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Serviços preferidos / contratados
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecione os serviços habituais do pet e descreva preferências de corte/tosa abaixo
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SERVICOS_PREDEFINIDOS.map((srv) => {
                  const isSelected = servicosSelecionados.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleServico(srv)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{srv}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Objetivo estético / estilo de tosa (ex: Tosa bebê na tesoura, manter orelhas longas, aparar focinho...)"
                  value={objetivoEstetico}
                  onChange={(e) => setObjetivoEstetico(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Condições de saúde ou pele */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Condições de saúde ou pele
                </label>
                <span className="text-xs text-slate-400">Múltipla escolha</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleToggleCondicaoNenhuma}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    condicaoNenhuma
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Nenhuma
                </button>

                {CONDICOES_SAUDE_PREDEFINIDAS.map((item) => {
                  const isSelected = condicoesSelecionadas.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleCondicao(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-300 font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 text-red-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
                      <span>{item}</span>
                    </button>
                  );
                })}

                {condicoesSelecionadas
                  .filter((c) => !CONDICOES_SAUDE_PREDEFINIDAS.includes(c))
                  .map((custom) => (
                    <span
                      key={custom}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-900 border border-red-300 flex items-center gap-1.5"
                    >
                      <span>{custom}</span>
                      <button type="button" onClick={() => toggleCondicao(custom)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar outra condição de saúde ou pele..."
                  value={customCondicaoInput}
                  onChange={(e) => setCustomCondicaoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCondicao();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddCustomCondicao}>
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Restrições de produtos e equipamentos */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Restrições de produtos e equipamentos
                </label>
                <span className="text-xs text-slate-400">Múltipla escolha</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleToggleRestricaoNenhuma}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    restricaoNenhuma
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Nenhuma
                </button>

                {RESTRICOES_PRODUTOS_PREDEFINIDAS.map((item) => {
                  const isSelected = restricoesSelecionadas.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleRestricao(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 text-amber-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
                      <span>{item}</span>
                    </button>
                  );
                })}

                {restricoesSelecionadas
                  .filter((r) => !RESTRICOES_PRODUTOS_PREDEFINIDAS.includes(r))
                  .map((custom) => (
                    <span
                      key={custom}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5"
                    >
                      <span>{custom}</span>
                      <button type="button" onClick={() => toggleRestricao(custom)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar outra restrição de produto/equipamento..."
                  value={customRestricaoInput}
                  onChange={(e) => setCustomRestricaoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomRestricao();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddCustomRestricao}>
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Alergias conhecidas */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Alergias conhecidas
                </label>
                <span className="text-xs text-slate-400">Múltipla escolha</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleToggleAlergiaNenhuma}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    alergiaNenhuma
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Nenhuma
                </button>

                {ALERGIAS_PREDEFINIDAS.map((item) => {
                  const isSelected = alergiasSelecionadas.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAlergia(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 text-rose-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
                      <span>{item}</span>
                    </button>
                  );
                })}

                {alergiasSelecionadas
                  .filter((a) => !ALERGIAS_PREDEFINIDAS.includes(a))
                  .map((custom) => (
                    <span
                      key={custom}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5"
                    >
                      <span>{custom}</span>
                      <button type="button" onClick={() => toggleAlergia(custom)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Adicionar outra alergia..."
                  value={customAlergiaInput}
                  onChange={(e) => setCustomAlergiaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAlergia();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddCustomAlergia}>
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Medicamentos/Shampoos Terapêuticos e Antipulgas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Medicamentos ou shampoos terapêuticos em uso
                </label>
                <input
                  type="text"
                  placeholder="Ex: Shampoo de Clorexidina 2%, Apoquel..."
                  value={medicamentosUso}
                  onChange={(e) => setMedicamentosUso(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Antipulgas / Vermífugo atual
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bravecto, Simparic, NexGard, Revolution..."
                  value={antipulgasAtual}
                  onChange={(e) => setAntipulgasAtual(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('pet_tutor')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Voltar</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setActiveTab('comportamento')}
              >
                <span>Avançar para Comportamento e Rotina</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3 — COMPORTAMENTO E ROTINA */}
        {/* ========================================================= */}
        {activeTab === 'comportamento' && (
          <div className="space-y-7">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Comportamento, Manejo e Preferências de Finalização</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Temperamento na mesa, frequência ideal de banho, enfeites e observações de manejo
                </p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">Passo 3 de 3</span>
            </div>

            {/* Temperamento no banho e tosa */}
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
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <span className={`block text-xs font-bold ${isSelected ? 'text-blue-950 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Frequência de banho e Horário preferencial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Frequência ideal de banho (em dias)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ex: 7, 15, 30"
                    value={frequenciaBanhoDias}
                    onChange={(e) => setFrequenciaBanhoDias(e.target.value)}
                    className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                    dias
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Horário preferencial de atendimento</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 9 → 09:00 ou 1430 → 14:30"
                  value={horarioPreferencial}
                  onChange={(e) => setHorarioPreferencial(e.target.value)}
                  onBlur={() => setHorarioPreferencial(formatTimeInput(horarioPreferencial))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  Digite ex: 9 para "09:00" ou 1430 para "14:30".
                </p>
              </div>
            </div>

            {/* Aceita enfeites e finalização */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Aceita enfeites e finalização (laços, gravatinhas, bandanas, colônia)?</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUsaEnfeites(true)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      usaEnfeites
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsaEnfeites(false)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !usaEnfeites
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {usaEnfeites && (
                <div>
                  <input
                    type="text"
                    placeholder="Preferências de finalização (ex: Prefere bandanas, laços no topete, colônia suave de talco...)"
                    value={cuidadosEspeciaisDescricao}
                    onChange={(e) => setCuidadosEspeciaisDescricao(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Observações gerais */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Observações gerais e manejo
              </label>
              <textarea
                rows={3}
                placeholder="Anote detalhes importantes sobre comportamento na gaiola/box, sensibilidade nas patas, manejo com outros animais..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('pelagem_saude')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Voltar</span>
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={saving}
                className="shadow-md shadow-blue-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Cadastro do Pet</span>
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

