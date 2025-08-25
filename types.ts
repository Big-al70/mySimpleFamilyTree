export interface PersonName {
  first: string;
  middle?: string;
  surname: string;
}

export interface Person {
  id: string;
  name: PersonName;
  birthDate?: string;
  deathDate?: string;
  spouseId?: string;
  fatherId?: string; // Legal/Adoptive father
  motherId?: string; // Legal/Adoptive mother
  bio?: string;
  gender?: 'male' | 'female';
  isAdopted?: boolean;
  birthFatherId?: string;
  birthMotherId?: string;
  formerSpouseIds?: string[];
  isSeparated?: boolean;
}

export type People = Record<string, Person>;

export const formatName = (person: Person): string => {
  if (!person) {
    return 'Unknown Person';
  }
  const { name } = person;
  const baseName = [name.first, name.middle, name.surname].filter(Boolean).join(' ');
  return baseName;
};

export const formatCardName = (person: Person): string => {
  if (!person) {
    return 'Unknown';
  }
  const { name } = person;
  return [name.first, name.surname].filter(Boolean).join(' ');
};

// This interface is compatible with react-d3-tree's RawNodeDatum
// and includes our custom application data.
export interface NodeDatum {
  name: string;
  attributes: {
    'ID': string; // Keep for unique identification in the tree if needed.
    [key: string]: string;
  };
  children: NodeDatum[];
  __person: Person; // Internal property to link back to the original Person object
}

export type RelationshipType = 'child' | 'spouse' | 'sibling';

export interface ResearchResult {
  summary: string;
  sources: {
    title: string;
    uri: string;
  }[];
}