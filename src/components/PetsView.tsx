import React, { useState, useEffect } from 'react';
import { Pet, getPets } from '../services/petService';
import { useAuth } from '../context/AuthContext';
import { 
  PawPrint, 
  Search, 
  Plus, 
  Calendar, 
  ChevronRight, 
  Scissors, 
  Loader2, 
  User
} from 'lucide-react';
import { Button } from './ui/Button';

interface PetsViewProps {
  onSelectPet: (petId: string) => void;
  onOpenNewPetPage: () => void;
}

export const PetsView: React.FC<PetsViewProps> = ({
  onSelectPet,
  onOpenNewPetPage,
}) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPets = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getPets(user.id);
      setPets(data);
    } catch (err) {
      console.error('Erro ao carregar lista de pets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [user?.id]);

  // Busca por nome do pet ou nome do tutor
  const filteredPets = pets.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      p.nome_pet.toLowerCase().includes(term) ||
      p.nome_tutor.toLowerCase().includes(term) ||
      (p.raca && p.raca.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <PawPrint className="w-7 h-7 text-blue-600 dark:text-blue-500" />
            <span>Pets Cadastrados</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestão de cães e gatos de todos os portes, tutores e histórico de banho e tosa
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão "Novo Pet" que redireciona para o formulário de cadastro */}
          <Button
            variant="primary"
            size="md"
            onClick={onOpenNewPetPage}
            className="shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pet</span>
          </Button>
        </div>
      </div>

      {/* Campo de busca por nome do pet ou nome do tutor no topo da listagem */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 transition-colors">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome do pet ou nome do tutor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
          />
        </div>

        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap px-2">
          {filteredPets.length} {filteredPets.length === 1 ? 'pet' : 'pets'}
        </span>
      </div>

      {/* Lista / Grid de Pets */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-blue-700 dark:text-blue-400 font-medium bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600 dark:text-blue-500" />
          <span>Carregando pets cadastrados...</span>
        </div>
      ) : pets.length === 0 ? (
        /* Regra: "Se não houver pets cadastrados, exibir a mensagem 'Nenhum pet cadastrado ainda'" */
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 shadow-2xs flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-2xs">
            <PawPrint className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Nenhum pet cadastrado ainda
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 mb-6">
            Você ainda não possui pets registrados em sua clínica estética. Clique no botão abaixo para cadastrar o primeiro cão ou gato.
          </p>
          <Button variant="primary" size="md" onClick={onOpenNewPetPage}>
            <Plus className="w-4 h-4" />
            <span>Novo Pet</span>
          </Button>
        </div>
      ) : filteredPets.length === 0 ? (
        /* Caso a busca não retorne resultados */
        <div className="py-14 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xs">
          <Search className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Nenhum pet encontrado para "{searchTerm}"
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Verifique a digitação ou limpe a busca para visualizar todos os pets.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        /* Regra: "Cada pet exibe: nome do pet, espécie/porte, nome do tutor, serviços preferidos e data do último atendimento" */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPets.map((p) => {
            const dataUltimoAtendimento = p.ultimo_atendimento
              ? new Date(p.ultimo_atendimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
              : null;

            const temServicos = p.servicos_preferidos && p.servicos_preferidos.length > 0;

            return (
              <div
                key={p.id}
                onClick={() => onSelectPet(p.id)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Linha do Nome do Pet + Espécie/Porte */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-base shadow-xs group-hover:scale-105 transition-transform">
                        {p.nome_pet.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {p.nome_pet}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                            {p.especie}{p.porte ? ` • ${p.porte}` : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Tutor(a): <strong className="font-semibold text-slate-700 dark:text-slate-300">{p.nome_tutor}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white text-slate-400 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Exibição dos Serviços Preferidos / Objetivo Estético */}
                  <div className="py-2.5 px-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Scissors className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                      <span>Serviços Preferidos</span>
                    </div>

                    {temServicos ? (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {p.servicos_preferidos!.slice(0, 3).map((srv, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                          >
                            {srv}
                          </span>
                        ))}
                        {p.servicos_preferidos!.length > 3 && (
                          <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            +{p.servicos_preferidos!.length - 3}
                          </span>
                        )}
                      </div>
                    ) : p.objetivo_estetico ? (
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                        {p.objetivo_estetico}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                        Banho e tosa padrão
                      </p>
                    )}
                  </div>
                </div>

                {/* Data do Último Atendimento */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Último banho/tosa:</span>
                  </div>

                  {dataUltimoAtendimento ? (
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {dataUltimoAtendimento}
                    </span>
                  ) : (
                    <span className="font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-md text-[11px]">
                      Sem atendimentos
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

