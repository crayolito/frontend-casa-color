export interface WhatsappConfig {
  enabled: boolean;
  phone?: string;
  message?: string;
}

export function whatsappHref(
  wa?: WhatsappConfig | null,
  extraText?: string,
): string {
  if (!wa?.enabled || !wa.phone?.trim()) {
    return '';
  }
  const phone = wa.phone.replace(/\D/g, '');
  if (!phone) {
    return '';
  }
  const text = encodeURIComponent((extraText ?? wa.message)?.trim() || '');
  return text ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/${phone}`;
}
