/**
 * Máscara para CPF: 000.000.000-00
 */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Máscara para telefone no formato brasileiro: +55 (00) 00000-0000
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 2) {
    return "+" + digits;
  }

  const country = digits.slice(0, 2);
  const rest = digits.slice(2);

  let formatted = `+${country} `;

  if (rest.length <= 2) {
    formatted += `(${rest}`;
  } else if (rest.length <= 7) {
    formatted += `(${rest.slice(0, 2)}) ${rest.slice(2)}`;
  } else {
    formatted += `(${rest.slice(0, 2)}) ${rest.slice(2, 7)}-${rest.slice(7, 11)}`;
  }

  return formatted;
}
