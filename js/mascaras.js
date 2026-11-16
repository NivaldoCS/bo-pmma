// Máscaras e validações. Tudo como TEXTO (zeros à esquerda preservados).
// Alertas de formato nunca impedem o registro.

const dig = (s) => String(s || '').replace(/\D/g, '');

export const MASCARAS = {
  cpf(v) {
    const d = dig(v).slice(0, 11);
    return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  },
  cpfcnpj(v) {
    const d = dig(v);
    if (d.length <= 11) return MASCARAS.cpf(d);
    const c = d.slice(0, 14);
    return c.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  },
  data(v) {
    const d = dig(v).slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  },
  hora(v) {
    const d = dig(v).slice(0, 4);
    return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
  },
  cep(v) {
    const d = dig(v).slice(0, 8);
    return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
  },
  telefone(v) {
    const d = dig(v).slice(0, 9);
    return d.length <= 4 ? d : `${d.slice(0, d.length - 4)}-${d.slice(-4)}`;
  },
  ddd(v) { return dig(v).slice(0, 3); },
  uf(v) { return String(v || '').toUpperCase().replace(/[^A-Z/ ]/g, '').slice(0, 20); },
  placa(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7); },
  numero(v) { return dig(v); },
  maiusculas(v) { return String(v || '').toUpperCase(); },
};

export function cpfValido(v) {
  const d = dig(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const t of [9, 10]) {
    let s = 0;
    for (let i = 0; i < t; i++) s += +d[i] * (t + 1 - i);
    const r = ((s * 10) % 11) % 10;
    if (r !== +d[t]) return false;
  }
  return true;
}

export function dataValida(v) {
  const m = String(v || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return d.getFullYear() === +m[3] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[1];
}

export function horaValida(v) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || '')); }

/** Retorna mensagem de alerta (não bloqueante) ou ''. */
export function alertaFormato(tipo, v) {
  if (!v) return '';
  switch (tipo) {
    case 'cpf': return cpfValido(v) ? '' : 'CPF incompleto ou com dígito verificador diferente. Confira (o registro não é bloqueado).';
    case 'cpfcnpj': { const n = dig(v).length; return n === 11 ? (cpfValido(v) ? '' : 'CPF com dígito verificador diferente. Confira.') : (n === 14 ? '' : 'CPF/CNPJ incompleto. Confira.'); }
    case 'data': return dataValida(v) ? '' : 'Data incompleta ou inexistente (dd/mm/aaaa).';
    case 'hora': return horaValida(v) ? '' : 'Hora incompleta (hh:mm).';
    case 'cep': return dig(v).length === 8 ? '' : 'CEP incompleto.';
    case 'placa': return /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(v) ? '' : 'Placa fora do padrão (AAA0A00 ou AAA0000). Confira.';
    default: return '';
  }
}

export function hojeAgora() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return { data: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`, hora: `${p(d.getHours())}:${p(d.getMinutes())}` };
}
