import { parseISO, format } from 'date-fns';

export default function utcToRegularDate(dataUtc: string | Date): string {
  const dataObj = typeof dataUtc === 'string' ? parseISO(dataUtc) : dataUtc; // Converte a string UTC para objeto de data
  return format(dataObj, 'dd/MM/yyyy'); // Formata a data no formato brasileiro
}
