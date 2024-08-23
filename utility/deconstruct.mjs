export const deconstruct = (strings, ...substitutions) => {
  const { raw } = strings;
  return { strings: [...strings], substitutions, raw };
};
export default deconstruct;
