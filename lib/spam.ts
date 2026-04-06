export const isSpamHoneypot = (value?: string | null) => {
  return Boolean(value && value.trim().length > 0);
};
