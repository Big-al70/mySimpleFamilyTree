import { type People } from './types';

export const INITIAL_PEOPLE: People = {
  '1': { id: '1', name: { first: 'Eleanor', surname: 'Peterson' }, birthDate: '1925', deathDate: '2010', spouseId: '2', gender: 'female', fatherId: '11', motherId: '12' },
  '2': { id: '2', name: { first: 'James', surname: 'Vance' }, birthDate: '1923', deathDate: '2008', spouseId: '1', gender: 'male' },
  '3': { id: '3', name: { first: 'Arthur', surname: 'Vance' }, birthDate: '1955', spouseId: '4', gender: 'male', motherId: '1', fatherId: '2' },
  '4': { id: '4', name: { first: 'Sofia', surname: 'Rossi' }, birthDate: '1957', spouseId: '3', gender: 'female', fatherId: '7', motherId: '8' },
  '5': { id: '5', name: { first: 'Clara', surname: 'Vance' }, birthDate: '1985', gender: 'female', motherId: '4', fatherId: '3', spouseId: '10', bio: "Born in 1985, Clara Vance is the daughter of Arthur Vance and Sofia Rossi. She is married to Ethan Miller." },
  '6': { id: '6', name: { first: 'Leo', surname: 'Vance' }, birthDate: '1988', gender: 'male', motherId: '4', fatherId: '3' },
  '7': { id: '7', name: { first: 'Marco', surname: 'Rossi' }, birthDate: '1935', gender: 'male', spouseId: '8' },
  '8': { id: '8', name: { first: 'Isabella', surname: 'Conti' }, birthDate: '1937', gender: 'female', spouseId: '7' },
  '9': { id: '9', name: { first: 'Evelyn', surname: 'Vance' }, birthDate: '1958', gender: 'female', motherId: '1', fatherId: '2' },
  '10': { id: '10', name: { first: 'Ethan', surname: 'Miller' }, birthDate: '1984', gender: 'male', spouseId: '5' },
  // Eleanor's Ancestors
  '11': { id: '11', name: { first: 'Robert', surname: 'Peterson' }, birthDate: '1900', deathDate: '1960', spouseId: '12', gender: 'male', fatherId: '13', motherId: '14' },
  '12': { id: '12', name: { first: 'Mary', surname: 'Johnson' }, birthDate: '1902', deathDate: '1975', spouseId: '11', gender: 'female', fatherId: '15', motherId: '16' },
  // Paternal Grandparents
  '13': { id: '13', name: { first: 'Henry', surname: 'Peterson' }, birthDate: '1875', deathDate: '1940', spouseId: '14', gender: 'male' },
  '14': { id: '14', name: { first: 'Anna', surname: 'Schmidt' }, birthDate: '1878', deathDate: '1955', spouseId: '13', gender: 'female' },
  // Maternal Grandparents
  '15': { id: '15', name: { first: 'William', surname: 'Johnson' }, birthDate: '1877', deathDate: '1945', spouseId: '16', gender: 'male' },
  '16': { id: '16', name: { first: 'Emily', surname: 'Davis' }, birthDate: '1880', deathDate: '1962', spouseId: '15', gender: 'female' },
};

export const ROOT_PERSON_ID = '1';