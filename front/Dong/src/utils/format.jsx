export function formatNumber(num, locale = "fa-IR", opts = {}) {
  const n = Number(num);
  if (!isFinite(n)) return "0";
  return n.toLocaleString(locale, { maximumFractionDigits: 0, ...opts });
}

export function formatToman(num, locale = "fa-IR", options = {}) {
  const n = Number(num);
  if (!isFinite(n)) return `0 تومان`;

  const formatted = n.toLocaleString(locale, {
    maximumFractionDigits: 0,
    ...options,
  });
  return `${formatted} تومان`;
}

export default { formatNumber, formatToman };
