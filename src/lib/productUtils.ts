export const getBaseName = (name: string) => name.replace(/ - Grade [A-Z]+$/, '');

export const getGradeValue = (name: string) => {
  const match = name.match(/ - Grade ([A-Z]+)$/);
  return match ? match[1] : 'A';
};
