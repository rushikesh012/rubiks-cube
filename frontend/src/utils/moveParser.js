const VALID_TOKEN = /^[RLUDFB](2|')?$/;

export const parseMoveString = (value) => {
  if (!value || !value.trim()) return [];

  return value
    .trim()
    .split(/\s+/)
    .filter((token) => VALID_TOKEN.test(token));
};
