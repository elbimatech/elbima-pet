/**
 * Utilitários para formatação e cálculos de pets
 */

export function formatTimeInput(value: string): string {
  if (!value) return '';
  const clean = value.trim();
  
  // Se já tiver formato HH:MM
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(clean)) {
    const [h, m] = clean.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }

  // Apenas dígitos
  const digits = clean.replace(/\D/g, '');
  if (!digits) return value;

  // Regras especificadas no Prompt 4:
  // ex: 9 → "09:00", 1430 → "14:30"
  if (digits.length === 1 || digits.length === 2) {
    let num = parseInt(digits, 10);
    if (num > 23) num = 23;
    return `${String(num).padStart(2, '0')}:00`;
  }

  if (digits.length === 3) {
    let h = parseInt(digits.slice(0, 1), 10);
    let m = parseInt(digits.slice(1), 10);
    if (h > 23) h = 23;
    if (m > 59) m = 59;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  if (digits.length >= 4) {
    let h = parseInt(digits.slice(0, 2), 10);
    let m = parseInt(digits.slice(2, 4), 10);
    if (h > 23) h = 23;
    if (m > 59) m = 59;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  return value;
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Converte com segurança qualquer formato de data (Date, string ISO, timestamp) para YYYY-MM-DD
 */
export function toISODateString(dateInput: unknown): string {
  if (!dateInput) return '';
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    return dateInput.toISOString().split('T')[0];
  }
  if (typeof dateInput === 'string') {
    return dateInput.split('T')[0];
  }
  try {
    return String(dateInput).split('T')[0];
  } catch {
    return '';
  }
}

export function calculatePetAgeLabel(dateInput: string | Date | null | undefined): string | null {
  if (!dateInput) return null;
  const isoStr = toISODateString(dateInput);
  const parts = isoStr.split('-');
  if (parts.length !== 3) return null;
  
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  
  const birth = new Date(birthYear, birthMonth, birthDay);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return null;
  if (years === 0) {
    return months <= 1 ? '1 mês' : `${months} meses`;
  }
  return years === 1 ? '1 ano' : `${years} anos`;
}

