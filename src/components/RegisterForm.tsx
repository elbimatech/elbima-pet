import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RegisterFormProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onNavigateToLogin,
  onRegisterSuccess 
}) => {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validação em tempo real dos 9 caracteres
  const isPasswordLongEnough = password.length >= 9;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!nome.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (nome.trim().length < 3) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    // Regra: A senha deve ter no mínimo 9 caracteres
    if (password.length < 9) {
      setErrorMessage('A senha deve conter no mínimo 9 caracteres.');
      return;
    }

    // Validação de confirmação de senha
    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Verifique e tente novamente.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(nome, email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Não foi possível concluir o cadastro.');
      } else {
        setSuccessMessage('Conta criada com sucesso! Redirecionando...');
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      }
    } catch {
      setErrorMessage('Ocorreu um erro no servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50/70 via-white to-sky-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 transition-colors relative">
      {/* Botão de alternância de tema no canto superior */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 overflow-hidden pointer-events-none -z-10 opacity-70">
        <div className="absolute -top-24 left-1/4 w-80 h-80 rounded-full bg-blue-200/35 dark:bg-blue-600/10 blur-3xl" />
        <div className="absolute -top-20 right-1/4 w-96 h-96 rounded-full bg-sky-200/30 dark:bg-sky-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md my-8">
        {/* Card Principal */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 transition-all">
          {/* Logo no Topo */}
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Criar nova conta
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Cadastre-se para gerenciar pets, banhos, tosas e planos estéticos
            </p>
          </div>

          {/* Alerta de Erro */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50/90 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-left font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Alerta de Sucesso */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="text-left font-medium">
                {successMessage}
              </div>
            </div>
          )}

          {/* Formulário de Cadastro */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="register-nome"
              type="text"
              label="Nome completo"
              placeholder="Ex: Camila Rocha (Esteticista Pet)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              leadingIcon={<User className="w-4 h-4" />}
              autoComplete="name"
              required
            />

            <Input
              id="register-email"
              type="email"
              label="E-mail profissional"
              placeholder="camila@elbimapet.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leadingIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <div>
              <Input
                id="register-password"
                type="password"
                isPassword
                label="Senha de acesso"
                placeholder="Mínimo 9 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leadingIcon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
                required
              />
              
              {/* Indicador de requisito da senha */}
              <div className="flex items-center gap-2 mt-1.5 px-1">
                <div className={`w-2 h-2 rounded-full transition-colors ${isPasswordLongEnough ? 'bg-blue-500' : password.length > 0 ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <span className={`text-xs transition-colors ${isPasswordLongEnough ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                  Mínimo de 9 caracteres {password.length > 0 && `(${password.length}/9)`}
                </span>
              </div>
            </div>

            <Input
              id="register-confirm-password"
              type="password"
              isPassword
              label="Confirmar senha"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leadingIcon={<ShieldCheck className="w-4 h-4" />}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2 text-base group"
            >
              <span>Criar conta</span>
              {!loading && (
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </form>

          {/* Rodapé / Link de Login */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded cursor-pointer"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>

        {/* Rodapé institucional */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 font-medium">
          Seus dados são protegidos por criptografia e Row Level Security (RLS)
        </p>
      </div>
    </div>
  );
};
