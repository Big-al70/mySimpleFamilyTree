import { type People } from './types';

export const INITIAL_PEOPLE: People = {
  '1': { id: '1', name: { first: 'Eleanor', surname: 'Peterson' }, birthDate: '12 MAY 1925', deathDate: '28 SEP 2010', spouseId: '2', gender: 'female', fatherId: '11', motherId: '12' },
  '2': { id: '2', name: { first: 'James', surname: 'Vance' }, birthDate: '05 APR 1923', deathDate: '19 NOV 2008', spouseId: '1', gender: 'male' },
  '3': { id: '3', name: { first: 'Arthur', surname: 'Vance' }, birthDate: '21 JUN 1955', spouseId: '4', gender: 'male', motherId: '1', fatherId: '2' },
  '4': { id: '4', name: { first: 'Sofia', surname: 'Rossi' }, birthDate: '14 FEB 1957', spouseId: '3', gender: 'female', fatherId: '7', motherId: '8' },
  '5': { id: '5', name: { first: 'Clara', surname: 'Vance' }, birthDate: '03 AUG 1985', gender: 'female', motherId: '4', fatherId: '3', spouseId: '10', bio: "Born on 03 AUG 1985, Clara Vance is the daughter of Arthur Vance and Sofia Rossi. She is married to Ethan Miller." },
  '6': { id: '6', name: { first: 'Leo', surname: 'Vance' }, birthDate: '11 NOV 1988', gender: 'male', motherId: '4', fatherId: '3' },
  '7': { id: '7', name: { first: 'Marco', surname: 'Rossi' }, birthDate: '30 JUL 1935', gender: 'male', spouseId: '8' },
  '8': { id: '8', name: { first: 'Isabella', surname: 'Conti' }, birthDate: '09 SEP 1937', gender: 'female', spouseId: '7' },
  '9': { id: '9', name: { first: 'Evelyn', surname: 'Vance' }, birthDate: '18 OCT 1958', gender: 'female', motherId: '1', fatherId: '2' },
  '10': { id: '10', name: { first: 'Ethan', surname: 'Miller' }, birthDate: '25 DEC 1984', gender: 'male', spouseId: '5' },
  // Eleanor's Ancestors
  '11': { id: '11', name: { first: 'Robert', surname: 'Peterson' }, birthDate: '01 JAN 1900', deathDate: '15 MAR 1960', spouseId: '12', gender: 'male', fatherId: '13', motherId: '14' },
  '12': { id: '12', name: { first: 'Mary', surname: 'Johnson' }, birthDate: '10 FEB 1902', deathDate: '22 APR 1975', spouseId: '11', gender: 'female', fatherId: '15', motherId: '16' },
  // Paternal Grandparents
  '13': { id: '13', name: { first: 'Henry', surname: 'Peterson' }, birthDate: '17 JUL 1875', deathDate: '04 MAY 1940', spouseId: '14', gender: 'male' },
  '14': { id: '14', name: { first: 'Anna', surname: 'Schmidt' }, birthDate: '29 AUG 1878', deathDate: '13 JUN 1955', spouseId: '13', gender: 'female' },
  // Maternal Grandparents
  '15': { id: '15', name: { first: 'William', surname: 'Johnson' }, birthDate: '02 OCT 1877', deathDate: '16 JUL 1945', spouseId: '16', gender: 'male' },
  '16': { id: '16', name: { first: 'Emily', surname: 'Davis' }, birthDate: '23 NOV 1880', deathDate: '01 AUG 1962', spouseId: '15', gender: 'female' },
};

export const ROOT_PERSON_ID = '1';