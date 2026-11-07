import { createAuthClient } from '@neondatabase/neon-js/auth';
import { neon } from '@neondatabase/serverless';

// Obter URL do Neon Auth e Neon Database a partir das variáveis de ambiente (.env.local)
const authUrl = import.meta.env.VITE_NEON_AUTH_URL || '';
const dbUrl = import.meta.env.VITE_DATABASE_URL || '';

// Inicializa o cliente oficial do Neon Auth
export const authClient = createAuthClient(authUrl);

// Inicializa cliente serverless do Neon para sincronização direta do banco
export const sql = neon(dbUrl);

export interface ProfissionalProfile {
  id: string;
  nome: string;
  email: string;
  created_at?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: Date | string;
  [key: string]: any;
}

/**
 * Salva ou atualiza os dados do profissional na tabela public.profissionais
 */
export async function syncProfissionalProfile(userId: string, nome: string, email: string) {
  try {
    await sql.query(
      `INSERT INTO public.profissionais (id, nome, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE 
       SET nome = EXCLUDED.nome, email = EXCLUDED.email`,
      [userId, nome, email]
    );
  } catch (error) {
    console.error('Erro ao sincronizar perfil do profissional no banco:', error);
  }
}

/**
 * Busca perfil do profissional na tabela public.profissionais
 */
export async function getProfissionalProfile(userId: string): Promise<ProfissionalProfile | null> {
  try {
    const rows = await sql.query(
      `SELECT id, nome, email, created_at FROM public.profissionais WHERE id = $1 LIMIT 1`,
      [userId]
    );
    if (rows && rows.length > 0) {
      const row = rows[0] as unknown as ProfissionalProfile;
      return row;
    }
  } catch (error) {
    console.warn('Erro ao consultar public.profissionais:', error);
  }
  return null;
}

