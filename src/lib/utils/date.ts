/**
 * Calcula a idade em anos baseado na data de nascimento
 * @param birthDate - Data de nascimento no formato YYYY-MM-DD
 * @returns Idade em anos (número inteiro)
 */
export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  const today = new Date();

  // Calcular anos de diferença
  let age = today.getFullYear() - birth.getFullYear();

  // Ajustar se ainda não fez aniversário este ano
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Formata uma data de nascimento para exibição no formato brasileiro
 * @param birthDate - Data de nascimento no formato YYYY-MM-DD
 * @returns Data formatada como DD/MM/YYYY
 */
export function formatBirthDate(birthDate: string): string {
  if (!birthDate) return '';

  const date = new Date(birthDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Calcula a próxima data de aniversário
 * @param birthDate - Data de nascimento no formato YYYY-MM-DD
 * @returns Número de dias até o próximo aniversário
 */
export function daysUntilBirthday(birthDate: string): number {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  const today = new Date();

  // Criar data do aniversário deste ano
  const thisYearBirthday = new Date(
    today.getFullYear(),
    birth.getMonth(),
    birth.getDate()
  );

  // Se já passou, considerar o próximo ano
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1);
  }

  // Calcular diferença em dias
  const diffTime = thisYearBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
