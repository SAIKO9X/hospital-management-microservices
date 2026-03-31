export const parseListField = (
  value: string | string[] | undefined,
): string[] => {
  if (!value || (Array.isArray(value) && value.length === 0)) return [];
  return typeof value === "string"
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : value;
};
