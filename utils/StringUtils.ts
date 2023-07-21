export const addSpacesAndCapitalizeFirst = (text: string) => {
  return (text.charAt(0).toUpperCase() + text.slice(1)).replaceAll("_", " ");
}