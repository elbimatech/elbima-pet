import { sql } from '../lib/auth';

export interface PetSemRetorno {
  pet_id: string;
  nome_pet: string;
  especie: string;
  porte: string | null;
  nome_tutor: string;
  whatsapp_tutor: string | null;
  email_tutor: string | null;
  ultimo_atendimento_data: string;
  maior_proximo_retorno: string | null;
  dias_sem_atendimento: number;
}

export interface DashboardStats {
  totalPets: number;
  atendimentosSemana: number;
  petsSemRetorno: PetSemRetorno[];
}

export interface Pet {
  id: string;
  profissional_id: string;
  nome_pet: string;
  especie: string;
  raca?: string | null;
  data_nascimento?: string | null;
  sexo?: string | null;
  porte?: string | null;
  peso_inicial?: number | null;
  nome_tutor: string;
  whatsapp_tutor?: string | null;
  email_tutor?: string | null;
  tipo_pelagem?: string | null;
  servicos_preferidos?: string[] | null;
  objetivo_estetico?: string | null;
  temperamento?: string | null;
  condicoes_saude?: string[] | null;
  restricoes_produtos?: string[] | null;
  alergias?: string[] | null;
  medicamentos_uso?: string | null;
  antipulgas_atual?: string | null;
  frequencia_banho_dias?: number | null;
  horario_preferencial?: string | null;
  usa_enfeites?: boolean | null;
  cuidados_especiais_descricao?: string | null;
  observacoes?: string | null;
  created_at?: string;
  // Campos calculados na listagem
  ultimo_atendimento?: string | null;
  proximo_retorno?: string | null;
  total_atendimentos?: number;
}

export interface Atendimento {
  id: string;
  pet_id: string;
  data_atendimento: string;
  peso?: number | null;
  servico_realizado?: string | null;
  nivel_nos_pelagem?: string | null;
  valor_cobrado?: number | null;
  observacoes?: string | null;
  proximo_retorno?: string | null;
  created_at?: string;
}

export interface PlanoEstetico {
  id: string;
  pet_id: string;
  conteudo: any;
  created_at: string;
}

export interface TransacaoFinanceira {
  id: string;
  profissional_id: string;
  pet_id?: string | null;
  atendimento_id?: string | null;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  forma_pagamento?: string | null;
  status: 'Pago' | 'Pendente';
  data_transacao: string;
  observacoes?: string | null;
  created_at?: string;
  // Campos enriquecidos via JOIN
  nome_pet?: string | null;
  nome_tutor?: string | null;
  especie_pet?: string | null;
}

export interface MovimentacaoFinanceira {
  id: string;
  origem: 'atendimento' | 'lancamento';
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  forma_pagamento: string;
  status: 'Pago' | 'Pendente';
  data: string;
  observacoes?: string | null;
  pet_id?: string | null;
  nome_pet?: string | null;
  nome_tutor?: string | null;
  especie_pet?: string | null;
  atendimento_id?: string | null;
}

/**
 * Carrega todas as métricas do Dashboard em tempo real diretamente do Neon DB
 */
export async function getDashboardStats(profissionalId: string): Promise<DashboardStats> {
  try {
    // 1. Total de pets cadastrados pelo profissional logado
    const totalPetsQuery = await sql.query(
      `SELECT COUNT(*)::int as count 
       FROM public.pets 
       WHERE profissional_id = $1`,
      [profissionalId]
    );
    const totalPets = Number(totalPetsQuery[0]?.count || 0);

    // 2. Banho e Tosa (Atendimentos) da semana atual (segunda a domingo)
    const atendimentosSemanaQuery = await sql.query(
      `SELECT COUNT(*)::int as count 
       FROM public.atendimentos a
       JOIN public.pets p ON p.id = a.pet_id
       WHERE p.profissional_id = $1
         AND a.data_atendimento >= date_trunc('week', CURRENT_DATE)::date
         AND a.data_atendimento <= (date_trunc('week', CURRENT_DATE) + interval '6 days')::date`,
      [profissionalId]
    );
    const atendimentosSemana = Number(atendimentosSemanaQuery[0]?.count || 0);

    // 3. Pets sem retorno: último atendimento há mais de 30 dias e sem próximo retorno agendado
    const petsSemRetornoQuery = await sql.query(
      `WITH ultimos_atendimentos AS (
         SELECT 
           p.id AS pet_id,
           p.nome_pet,
           p.especie,
           p.porte,
           p.nome_tutor,
           p.whatsapp_tutor,
           p.email_tutor,
           MAX(a.data_atendimento) AS ultimo_atendimento_data,
           MAX(a.proximo_retorno) AS maior_proximo_retorno
         FROM public.pets p
         LEFT JOIN public.atendimentos a ON a.pet_id = p.id
         WHERE p.profissional_id = $1
         GROUP BY p.id, p.nome_pet, p.especie, p.porte, p.nome_tutor, p.whatsapp_tutor, p.email_tutor
       )
       SELECT 
         pet_id,
         nome_pet,
         especie,
         porte,
         nome_tutor,
         whatsapp_tutor,
         email_tutor,
         ultimo_atendimento_data,
         maior_proximo_retorno,
         (CURRENT_DATE - ultimo_atendimento_data)::int AS dias_sem_atendimento
       FROM ultimos_atendimentos
       WHERE ultimo_atendimento_data IS NOT NULL
         AND ultimo_atendimento_data < (CURRENT_DATE - INTERVAL '30 days')
         AND (maior_proximo_retorno IS NULL OR maior_proximo_retorno < CURRENT_DATE)
       ORDER BY dias_sem_atendimento DESC;`,
      [profissionalId]
    );

    const petsSemRetorno: PetSemRetorno[] = (petsSemRetornoQuery || []).map((row: any) => ({
      pet_id: row.pet_id,
      nome_pet: row.nome_pet,
      especie: row.especie || 'Pet',
      porte: row.porte || null,
      nome_tutor: row.nome_tutor,
      whatsapp_tutor: row.whatsapp_tutor,
      email_tutor: row.email_tutor,
      ultimo_atendimento_data: row.ultimo_atendimento_data
        ? new Date(row.ultimo_atendimento_data).toISOString().split('T')[0]
        : '',
      maior_proximo_retorno: row.maior_proximo_retorno
        ? new Date(row.maior_proximo_retorno).toISOString().split('T')[0]
        : null,
      dias_sem_atendimento: Number(row.dias_sem_atendimento || 0),
    }));

    return {
      totalPets,
      atendimentosSemana,
      petsSemRetorno,
    };
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard no Neon:', error);
    return {
      totalPets: 0,
      atendimentosSemana: 0,
      petsSemRetorno: [],
    };
  }
}

/**
 * Busca a lista completa de pets do profissional logado
 */
export async function getPets(profissionalId: string): Promise<Pet[]> {
  try {
    const rows = await sql.query(
      `SELECT 
         p.*,
         (SELECT MAX(a.data_atendimento) FROM public.atendimentos a WHERE a.pet_id = p.id) as ultimo_atendimento,
         (SELECT MAX(a.proximo_retorno) FROM public.atendimentos a WHERE a.pet_id = p.id) as proximo_retorno,
         (SELECT COUNT(*)::int FROM public.atendimentos a WHERE a.pet_id = p.id) as total_atendimentos
       FROM public.pets p
       WHERE p.profissional_id = $1
       ORDER BY p.nome_pet ASC`,
      [profissionalId]
    );

    return (rows || []).map((r: any) => {
      let dataNasc = r.data_nascimento;
      if (dataNasc instanceof Date) {
        dataNasc = dataNasc.toISOString().split('T')[0];
      } else if (typeof dataNasc === 'string') {
        dataNasc = dataNasc.split('T')[0];
      }
      return {
        ...r,
        data_nascimento: dataNasc || '',
        peso_inicial: r.peso_inicial !== null && r.peso_inicial !== undefined ? Number(r.peso_inicial) : null,
        frequencia_banho_dias: r.frequencia_banho_dias !== null && r.frequencia_banho_dias !== undefined ? Number(r.frequencia_banho_dias) : null,
        total_atendimentos: Number(r.total_atendimentos || 0),
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pets:', error);
    return [];
  }
}

/**
 * Busca detalhes completos de um pet e seus atendimentos
 */
export async function getPetDetalhes(petId: string, profissionalId: string): Promise<{ pet: Pet | null; atendimentos: Atendimento[] }> {
  try {
    const petRows = await sql.query(
      `SELECT * FROM public.pets WHERE id = $1 AND profissional_id = $2 LIMIT 1`,
      [petId, profissionalId]
    );

    if (!petRows || petRows.length === 0) {
      return { pet: null, atendimentos: [] };
    }

    const raw = petRows[0] as any;
    let dataNascimento = raw.data_nascimento;
    if (dataNascimento instanceof Date) {
      dataNascimento = dataNascimento.toISOString().split('T')[0];
    } else if (typeof dataNascimento === 'string') {
      dataNascimento = dataNascimento.split('T')[0];
    }

    const pet = {
      ...raw,
      data_nascimento: dataNascimento || '',
      peso_inicial: raw.peso_inicial !== null && raw.peso_inicial !== undefined ? Number(raw.peso_inicial) : null,
      frequencia_banho_dias: raw.frequencia_banho_dias !== null && raw.frequencia_banho_dias !== undefined ? Number(raw.frequencia_banho_dias) : null,
      servicos_preferidos: Array.isArray(raw.servicos_preferidos) ? raw.servicos_preferidos : [],
      condicoes_saude: Array.isArray(raw.condicoes_saude) ? raw.condicoes_saude : [],
      restricoes_produtos: Array.isArray(raw.restricoes_produtos) ? raw.restricoes_produtos : [],
      alergias: Array.isArray(raw.alergias) ? raw.alergias : [],
    } as unknown as Pet;

    const atendimentosRows = await sql.query(
      `SELECT * FROM public.atendimentos WHERE pet_id = $1 ORDER BY data_atendimento DESC, created_at DESC`,
      [petId]
    );

    const atendimentos = (atendimentosRows || []).map((a: any) => {
      let dataAtend = a.data_atendimento;
      if (dataAtend instanceof Date) {
        dataAtend = dataAtend.toISOString().split('T')[0];
      } else if (typeof dataAtend === 'string') {
        dataAtend = dataAtend.split('T')[0];
      }

      let proxRetorno = a.proximo_retorno;
      if (proxRetorno instanceof Date) {
        proxRetorno = proxRetorno.toISOString().split('T')[0];
      } else if (typeof proxRetorno === 'string') {
        proxRetorno = proxRetorno.split('T')[0];
      }

      return {
        ...a,
        data_atendimento: dataAtend || '',
        proximo_retorno: proxRetorno || null,
        peso: a.peso !== null && a.peso !== undefined ? Number(a.peso) : null,
        valor_cobrado: a.valor_cobrado !== null && a.valor_cobrado !== undefined ? Number(a.valor_cobrado) : null,
      };
    }) as unknown as Atendimento[];

    return { pet, atendimentos };
  } catch (error) {
    console.error('Erro ao buscar detalhes do pet:', error);
    return { pet: null, atendimentos: [] };
  }
}

/**
 * Cadastra um novo pet no banco Neon
 */
export async function createPet(profissionalId: string, data: Partial<Pet>): Promise<Pet | null> {
  try {
    const rows = await sql.query(
      `INSERT INTO public.pets (
         profissional_id,
         nome_pet,
         especie,
         raca,
         data_nascimento,
         sexo,
         porte,
         peso_inicial,
         nome_tutor,
         whatsapp_tutor,
         email_tutor,
         tipo_pelagem,
         servicos_preferidos,
         objetivo_estetico,
         temperamento,
         condicoes_saude,
         restricoes_produtos,
         alergias,
         medicamentos_uso,
         antipulgas_atual,
         frequencia_banho_dias,
         horario_preferencial,
         usa_enfeites,
         cuidados_especiais_descricao,
         observacoes
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
       ) RETURNING *`,
      [
        profissionalId,
        data.nome_pet || 'Pet sem nome',
        data.especie || 'Cão',
        data.raca || null,
        data.data_nascimento || null,
        data.sexo || null,
        data.porte || null,
        data.peso_inicial ?? null,
        data.nome_tutor || 'Tutor não informado',
        data.whatsapp_tutor || null,
        data.email_tutor || null,
        data.tipo_pelagem || null,
        data.servicos_preferidos || [],
        data.objetivo_estetico || null,
        data.temperamento || null,
        data.condicoes_saude || [],
        data.restricoes_produtos || [],
        data.alergias || [],
        data.medicamentos_uso || null,
        data.antipulgas_atual || null,
        data.frequencia_banho_dias ?? null,
        data.horario_preferencial || null,
        data.usa_enfeites ?? true,
        data.cuidados_especiais_descricao || null,
        data.observacoes || null,
      ]
    );

    return rows && rows.length > 0 ? (rows[0] as unknown as Pet) : null;
  } catch (error) {
    console.error('Erro ao cadastrar pet no Neon:', error);
    throw error;
  }
}

/**
 * Atualiza os dados cadastrais do pet diretamente no banco de dados
 */
export async function updatePet(
  petId: string,
  profissionalId: string,
  data: Partial<Pet>
): Promise<Pet | null> {
  try {
    const rows = await sql.query(
      `UPDATE public.pets SET
         nome_pet = COALESCE($3, nome_pet),
         especie = COALESCE($4, especie),
         raca = $5,
         data_nascimento = $6,
         sexo = $7,
         porte = $8,
         peso_inicial = $9,
         nome_tutor = COALESCE($10, nome_tutor),
         whatsapp_tutor = $11,
         email_tutor = $12,
         tipo_pelagem = $13,
         servicos_preferidos = $14,
         objetivo_estetico = $15,
         temperamento = $16,
         condicoes_saude = $17,
         restricoes_produtos = $18,
         alergias = $19,
         medicamentos_uso = $20,
         antipulgas_atual = $21,
         frequencia_banho_dias = $22,
         horario_preferencial = $23,
         usa_enfeites = $24,
         cuidados_especiais_descricao = $25,
         observacoes = $26
       WHERE id = $1 AND profissional_id = $2
       RETURNING *`,
      [
        petId,
        profissionalId,
        data.nome_pet,
        data.especie,
        data.raca || null,
        data.data_nascimento || null,
        data.sexo || null,
        data.porte || null,
        data.peso_inicial !== undefined && data.peso_inicial !== null ? data.peso_inicial : null,
        data.nome_tutor,
        data.whatsapp_tutor || null,
        data.email_tutor || null,
        data.tipo_pelagem || null,
        data.servicos_preferidos || [],
        data.objetivo_estetico || null,
        data.temperamento || null,
        data.condicoes_saude || [],
        data.restricoes_produtos || [],
        data.alergias || [],
        data.medicamentos_uso || null,
        data.antipulgas_atual || null,
        data.frequencia_banho_dias !== undefined && data.frequencia_banho_dias !== null ? data.frequencia_banho_dias : null,
        data.horario_preferencial || null,
        data.usa_enfeites ?? true,
        data.cuidados_especiais_descricao || null,
        data.observacoes || null,
      ]
    );

    return rows && rows.length > 0 ? (rows[0] as unknown as Pet) : null;
  } catch (error) {
    console.error('Erro ao atualizar pet:', error);
    throw error;
  }
}

/**
 * Cria um atendimento (banho/tosa) para um pet no Neon
 */
export async function createAtendimento(petId: string, data: Partial<Atendimento>): Promise<Atendimento | null> {
  try {
    const rows = await sql.query(
      `INSERT INTO public.atendimentos (
         pet_id,
         data_atendimento,
         peso,
         servico_realizado,
         nivel_nos_pelagem,
         valor_cobrado,
         observacoes,
         proximo_retorno
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        petId,
        data.data_atendimento || new Date().toISOString().split('T')[0],
        data.peso ?? null,
        data.servico_realizado || null,
        data.nivel_nos_pelagem || null,
        data.valor_cobrado ?? null,
        data.observacoes || null,
        data.proximo_retorno || null,
      ]
    );

    return rows && rows.length > 0 ? (rows[0] as unknown as Atendimento) : null;
  } catch (error) {
    console.error('Erro ao criar atendimento:', error);
    throw error;
  }
}

/**
 * Exclui um atendimento do histórico do pet
 */
export async function deleteAtendimento(atendimentoId: string): Promise<boolean> {
  try {
    await sql.query(`DELETE FROM public.atendimentos WHERE id = $1`, [atendimentoId]);
    return true;
  } catch (error) {
    console.error('Erro ao excluir atendimento:', error);
    return false;
  }
}

/**
 * Busca todos os planos estéticos salvos do pet
 */
export async function getPlanosEsteticos(petId: string): Promise<PlanoEstetico[]> {
  try {
    const rows = await sql.query(
      `SELECT * FROM public.planos_esteticos WHERE pet_id = $1 ORDER BY created_at DESC`,
      [petId]
    );
    return (rows || []) as unknown as PlanoEstetico[];
  } catch (error) {
    console.error('Erro ao buscar planos estéticos:', error);
    return [];
  }
}

/**
 * Salva um novo plano estético para o pet no banco Neon
 */
export async function createPlanoEstetico(
  petId: string,
  conteudo: any
): Promise<PlanoEstetico | null> {
  try {
    const jsonStr = typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo);
    const rows = await sql.query(
      `INSERT INTO public.planos_esteticos (pet_id, conteudo)
       VALUES ($1, $2::jsonb)
       RETURNING *`,
      [petId, jsonStr]
    );

    return rows && rows.length > 0 ? (rows[0] as unknown as PlanoEstetico) : null;
  } catch (error) {
    console.error('Erro ao salvar plano estético no Neon:', error);
    throw error;
  }
}

/**
 * Exclui um plano estético do histórico do pet
 */
export async function deletePlanoEstetico(planoId: string): Promise<boolean> {
  try {
    await sql.query(`DELETE FROM public.planos_esteticos WHERE id = $1`, [planoId]);
    return true;
  } catch (error) {
    console.error('Erro ao excluir plano estético no Neon:', error);
    return false;
  }
}

/**
 * Busca transações financeiras manuais do profissional (ou filtradas por pet)
 */
export async function getTransacoesFinanceiras(
  profissionalId: string,
  petId?: string
): Promise<TransacaoFinanceira[]> {
  try {
    const params: any[] = [profissionalId];
    let whereClause = `WHERE t.profissional_id = $1`;
    if (petId) {
      params.push(petId);
      whereClause += ` AND t.pet_id = $2`;
    }

    const rows = await sql.query(
      `SELECT 
         t.*,
         p.nome_pet,
         p.nome_tutor,
         p.especie AS especie_pet
       FROM public.transacoes_financeiras t
       LEFT JOIN public.pets p ON p.id = t.pet_id
       ${whereClause}
       ORDER BY t.data_transacao DESC, t.created_at DESC`,
      params
    );

    return (rows || []).map((r: any) => {
      let dataTrans = r.data_transacao;
      if (dataTrans instanceof Date) {
        dataTrans = dataTrans.toISOString().split('T')[0];
      } else if (typeof dataTrans === 'string') {
        dataTrans = dataTrans.split('T')[0];
      }
      return {
        ...r,
        valor: Number(r.valor || 0),
        data_transacao: dataTrans || '',
        status: r.status === 'Pendente' ? 'Pendente' : 'Pago',
      };
    });
  } catch (error) {
    console.error('Erro ao buscar transações financeiras:', error);
    return [];
  }
}

/**
 * Cria um novo lançamento financeiro (Receita ou Despesa) no Neon
 */
export async function createTransacaoFinanceira(
  profissionalId: string,
  data: Partial<TransacaoFinanceira>
): Promise<TransacaoFinanceira | null> {
  try {
    const rows = await sql.query(
      `INSERT INTO public.transacoes_financeiras (
         profissional_id,
         pet_id,
         atendimento_id,
         tipo,
         categoria,
         descricao,
         valor,
         forma_pagamento,
         status,
         data_transacao,
         observacoes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        profissionalId,
        data.pet_id || null,
        data.atendimento_id || null,
        data.tipo || 'receita',
        data.categoria || 'Banho e Tosa',
        data.descricao || 'Lançamento financeiro',
        Number(data.valor || 0),
        data.forma_pagamento || 'PIX',
        data.status || 'Pago',
        data.data_transacao || new Date().toISOString().split('T')[0],
        data.observacoes || null,
      ]
    );

    if (!rows || rows.length === 0) return null;
    const raw = rows[0] as any;
    let dataTrans = raw.data_transacao;
    if (dataTrans instanceof Date) {
      dataTrans = dataTrans.toISOString().split('T')[0];
    } else if (typeof dataTrans === 'string') {
      dataTrans = dataTrans.split('T')[0];
    }

    return {
      ...raw,
      valor: Number(raw.valor || 0),
      data_transacao: dataTrans || '',
    } as TransacaoFinanceira;
  } catch (error) {
    console.error('Erro ao criar transação financeira:', error);
    throw error;
  }
}

/**
 * Alterna ou atualiza o status (Pago / Pendente) de uma transação financeira
 */
export async function updateStatusTransacaoFinanceira(
  transacaoId: string,
  profissionalId: string,
  novoStatus: 'Pago' | 'Pendente'
): Promise<boolean> {
  try {
    await sql.query(
      `UPDATE public.transacoes_financeiras 
       SET status = $3 
       WHERE id = $1 AND profissional_id = $2`,
      [transacaoId, profissionalId, novoStatus]
    );
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da transação financeira:', error);
    return false;
  }
}

/**
 * Exclui um lançamento financeiro manual
 */
export async function deleteTransacaoFinanceira(
  transacaoId: string,
  profissionalId: string
): Promise<boolean> {
  try {
    await sql.query(
      `DELETE FROM public.transacoes_financeiras WHERE id = $1 AND profissional_id = $2`,
      [transacaoId, profissionalId]
    );
    return true;
  } catch (error) {
    console.error('Erro ao excluir transação financeira:', error);
    return false;
  }
}

/**
 * Retorna todas as movimentações financeiras da clínica unificando:
 * 1) Atendimentos de banho e tosa com valor_cobrado > 0
 * 2) Lançamentos manuais na tabela transacoes_financeiras (receitas de pacotes/produtos e despesas da clínica)
 */
export async function getMovimentacoesFinanceirasClinica(
  profissionalId: string,
  petIdFiltro?: string
): Promise<MovimentacaoFinanceira[]> {
  try {
    // 1. Buscar lançamentos da tabela transacoes_financeiras
    const transacoes = await getTransacoesFinanceiras(profissionalId, petIdFiltro);

    // 2. Buscar atendimentos com valor_cobrado > 0
    const paramsAtend: any[] = [profissionalId];
    let whereAtend = `WHERE p.profissional_id = $1 AND a.valor_cobrado IS NOT NULL AND a.valor_cobrado > 0`;
    if (petIdFiltro) {
      paramsAtend.push(petIdFiltro);
      whereAtend += ` AND a.pet_id = $2`;
    }

    const atendRows = await sql.query(
      `SELECT 
         a.id,
         a.pet_id,
         a.data_atendimento,
         a.servico_realizado,
         a.valor_cobrado,
         a.observacoes,
         p.nome_pet,
         p.nome_tutor,
         p.especie AS especie_pet
       FROM public.atendimentos a
       JOIN public.pets p ON p.id = a.pet_id
       ${whereAtend}
       ORDER BY a.data_atendimento DESC, a.created_at DESC`,
      paramsAtend
    );

    // IDs de atendimentos que já possuem lançamento vinculado para não duplicar
    const atendimentosVinculados = new Set(
      transacoes.filter((t) => t.atendimento_id).map((t) => t.atendimento_id)
    );

    const listaAtendimentos: MovimentacaoFinanceira[] = (atendRows || [])
      .filter((a: any) => !atendimentosVinculados.has(a.id))
      .map((a: any) => {
        let dataStr = a.data_atendimento;
        if (dataStr instanceof Date) {
          dataStr = dataStr.toISOString().split('T')[0];
        } else if (typeof dataStr === 'string') {
          dataStr = dataStr.split('T')[0];
        }

        const servico = a.servico_realizado || 'Banho e Tosa';
        return {
          id: `atend-${a.id}`,
          origem: 'atendimento' as const,
          tipo: 'receita' as const,
          categoria: servico,
          descricao: `${servico} — ${a.nome_pet}`,
          valor: Number(a.valor_cobrado || 0),
          forma_pagamento: 'Atendimento Clínica',
          status: 'Pago' as const,
          data: dataStr || '',
          observacoes: a.observacoes || null,
          pet_id: a.pet_id,
          nome_pet: a.nome_pet,
          nome_tutor: a.nome_tutor,
          especie_pet: a.especie_pet,
          atendimento_id: a.id,
        };
      });

    const listaTransacoes: MovimentacaoFinanceira[] = transacoes.map((t) => ({
      id: t.id,
      origem: 'lancamento' as const,
      tipo: t.tipo,
      categoria: t.categoria,
      descricao: t.descricao,
      valor: Number(t.valor || 0),
      forma_pagamento: t.forma_pagamento || 'PIX',
      status: t.status,
      data: t.data_transacao,
      observacoes: t.observacoes || null,
      pet_id: t.pet_id || null,
      nome_pet: t.nome_pet || null,
      nome_tutor: t.nome_tutor || null,
      especie_pet: t.especie_pet || null,
      atendimento_id: t.atendimento_id || null,
    }));

    const unificadas = [...listaTransacoes, ...listaAtendimentos].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    return unificadas;
  } catch (error) {
    console.error('Erro ao buscar movimentações financeiras da clínica:', error);
    return [];
  }
}

/**
 * Popula dados de exemplo realistas para o profissional testar o dashboard e listagem
 */
export async function seedDemoData(profissionalId: string): Promise<boolean> {
  try {
    // 1. Pet 1: Cão atendido esta semana (Card 2)
    const pet1 = await createPet(profissionalId, {
      nome_pet: 'Thor',
      especie: 'Cão',
      raca: 'Golden Retriever',
      data_nascimento: '2022-05-10',
      sexo: 'Macho',
      porte: 'Grande',
      peso_inicial: 32.5,
      nome_tutor: 'Mariana Alencar',
      whatsapp_tutor: '(11) 98765-4321',
      email_tutor: 'mariana.alencar@email.com',
      tipo_pelagem: 'Dupla',
      servicos_preferidos: ['Banho', 'Tosa Higiênica', 'Hidratação Profunda', 'Desembolamento'],
      objetivo_estetico: 'Manter subpelo desembolado e pelagem macia com brilho',
      temperamento: 'Dócil',
      condicoes_saude: ['Pele sensível'],
      restricoes_produtos: ['Secador quente'],
      alergias: ['Nenhuma'],
      medicamentos_uso: 'Nenhum',
      antipulgas_atual: 'Simparic (mensal)',
      frequencia_banho_dias: 15,
      horario_preferencial: '09:00',
      usa_enfeites: true,
      cuidados_especiais_descricao: 'Adora gravatinhas azuis e perfume suave hipoalergênico',
      observacoes: 'Muito carinhoso na mesa de secagem.',
    });

    if (pet1?.id) {
      const hoje = new Date().toISOString().split('T')[0];
      const daquiA15Dias = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await createAtendimento(pet1.id, {
        data_atendimento: hoje,
        peso: 32.8,
        servico_realizado: 'Banho + Tosa Higiênica + Hidratação',
        nivel_nos_pelagem: 'Poucos nós',
        valor_cobrado: 145.0,
        observacoes: 'Pelagem respondeu super bem à máscara de argan. Ouvidos limpos.',
        proximo_retorno: daquiA15Dias,
      });
    }

    // 2. Pet 2: Cão Pequeno com atendimento há 45 dias SEM retorno agendado (Card 3)
    const pet2 = await createPet(profissionalId, {
      nome_pet: 'Mel',
      especie: 'Cão',
      raca: 'Shih Tzu',
      data_nascimento: '2021-08-20',
      sexo: 'Fêmea',
      porte: 'Pequeno',
      peso_inicial: 5.4,
      nome_tutor: 'Carlos Eduardo Souza',
      whatsapp_tutor: '(11) 97654-3210',
      email_tutor: 'carlos.souza@email.com',
      tipo_pelagem: 'Longa',
      servicos_preferidos: ['Banho', 'Tosa na Tesoura', 'Hidratação Profunda', 'Limpeza de Ouvidos'],
      objetivo_estetico: 'Tosa bebê na tesoura e topete com lacinho',
      temperamento: 'Dócil',
      condicoes_saude: ['Dermatite', 'Otite recorrente'],
      restricoes_produtos: ['Perfume forte', 'Shampoo comum'],
      alergias: ['Fragrâncias'],
      medicamentos_uso: 'Shampoo hipoalergênico de aveia',
      antipulgas_atual: 'Bravecto',
      frequencia_banho_dias: 7,
      horario_preferencial: '14:00',
      usa_enfeites: true,
      cuidados_especiais_descricao: 'Usar apenas lacinhos leves no topete, sem perfume.',
      observacoes: 'Proteger bem os ouvidos com algodão impermeável durante o banho.',
    });

    if (pet2?.id) {
      const data45DiasAtras = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await createAtendimento(pet2.id, {
        data_atendimento: data45DiasAtras,
        peso: 5.5,
        servico_realizado: 'Banho Terapêutico + Tosa Bebê na Tesoura',
        nivel_nos_pelagem: 'Muitos nós',
        valor_cobrado: 120.0,
        observacoes: 'Desembolamento cuidadoso nas patas. Tutor ficou de confirmar o próximo agendamento.',
        proximo_retorno: null,
      });
    }

    // 3. Pet 3: Gato Persa com atendimento há 55 dias SEM retorno agendado (Card 3)
    const pet3 = await createPet(profissionalId, {
      nome_pet: 'Luna',
      especie: 'Gato',
      raca: 'Persa',
      data_nascimento: '2023-02-14',
      sexo: 'Fêmea',
      porte: 'Pequeno',
      peso_inicial: 3.8,
      nome_tutor: 'Fernanda Lima',
      whatsapp_tutor: '(21) 99887-6543',
      email_tutor: 'fernanda.lima@email.com',
      tipo_pelagem: 'Longa',
      servicos_preferidos: ['Banho', 'Tosa Higiênica', 'Desembolamento', 'Corte de Unhas'],
      objetivo_estetico: 'Remoção de subpelo morto e prevenção de bolas de pelo',
      temperamento: 'Ansioso',
      condicoes_saude: ['Nenhuma'],
      restricoes_produtos: ['Soprador de alta potência', 'Perfume forte'],
      alergias: ['Nenhuma'],
      medicamentos_uso: 'Nenhum',
      antipulgas_atual: 'Revolution Felinos',
      frequencia_banho_dias: 30,
      horario_preferencial: '10:30',
      usa_enfeites: false,
      cuidados_especiais_descricao: '',
      observacoes: 'Atender no primeiro horário da manhã sem cães por perto para reduzir estresse.',
    });

    if (pet3?.id) {
      const data55DiasAtras = new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await createAtendimento(pet3.id, {
        data_atendimento: data55DiasAtras,
        peso: 3.9,
        servico_realizado: 'Banho Felino Low Stress + Tosa Higiênica',
        nivel_nos_pelagem: 'Poucos nós',
        valor_cobrado: 130.0,
        observacoes: 'Secagem silenciosa realizada com tranquilidade.',
        proximo_retorno: null,
      });
    }

    return true;
  } catch (error) {
    console.error('Erro ao popular dados de exemplo:', error);
    return false;
  }
}

