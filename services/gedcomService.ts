
import { type People, type Person, type PersonName } from '../types';

interface GedcomIndividual {
  id: string;
  name?: string;
  givn?: string;
  surn?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  deathDate?: string;
  famc?: string;
  fams?: string[];
}

interface GedcomFamily {
  id: string;
  husb?: string;
  wife?: string;
  chil?: string[];
}

// Ensures an ID is in the format `@X@` for consistency.
const normalizeId = (id: string | undefined): string => {
    if (!id) return '';
    const trimmedId = id.trim();
    if (trimmedId.startsWith('@') && trimmedId.endsWith('@')) {
        return trimmedId;
    }
    return `@${trimmedId.replace(/@/g, '')}@`;
};

const parsePersonName = (indi: GedcomIndividual): PersonName => {
    // Prioritize GIVN/SURN tags if they were found.
    if (indi.givn || indi.surn) {
        const nameParts = (indi.givn || '').split(' ').filter(Boolean);
        const first = nameParts.shift() || 'Unknown';
        const middle = nameParts.join(' ') || undefined;
        const surname = indi.surn || '';
        return { first, middle, surname };
    }

    // Fallback to parsing the raw NAME tag value.
    const rawName = indi.name || '';
    if (!rawName) return { first: 'Unknown', surname: '' };

    const surnameMatch = rawName.match(/\s*\/(.*?)\/\s*/);
    if (surnameMatch && surnameMatch[1]) {
        const surname = surnameMatch[1].trim();
        const givenPart = rawName.slice(0, surnameMatch.index).trim();
        const nameParts = givenPart.split(/\s+/).filter(Boolean);
        const first = nameParts.shift() || 'Unknown';
        const middle = nameParts.join(' ') || undefined;
        return { first, middle, surname };
    }

    const nameParts = rawName.split(/\s+/).filter(Boolean);
    if (nameParts.length === 0) return { first: 'Unknown', surname: '' };
    if (nameParts.length === 1) return { first: nameParts[0], surname: '' };
    
    const surname = nameParts.pop()!;
    const first = nameParts.shift()!;
    const middle = nameParts.join(' ') || undefined;
    
    return { first, middle, surname };
};

export const parseGedcom = (gedcomContent: string): { people: People, rootId: string } => {
    const lines = gedcomContent.split(/\r?\n/);
    
    const individuals: Record<string, GedcomIndividual> = {};
    const families: Record<string, GedcomFamily> = {};

    // Group lines by top-level record ID (@I1@, @F1@, etc.)
    const records: Record<string, { type: 'INDI' | 'FAM', lines: string[] }> = {};
    let currentId: string | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) continue;

        const parts = trimmedLine.split(/\s+/);
        const level = parseInt(parts[0], 10);
        if (isNaN(level)) continue;

        if (level === 0) {
            let idToken = parts.length > 1 ? parts[1] : null;
            let tagToken = parts.length > 2 ? parts[2] : null;
            
            // Handle `0 @ID@ TAG` and `0 TAG @ID@`
            if (idToken && tagToken && (idToken === 'INDI' || idToken === 'FAM')) {
                [idToken, tagToken] = [tagToken, idToken];
            }
            
            if (tagToken === 'INDI' || tagToken === 'FAM') {
                const id = normalizeId(idToken);
                if (id) {
                    records[id] = { type: tagToken, lines: [] };
                    currentId = id;
                } else {
                    currentId = null;
                }
            } else {
                currentId = null; // Ignore other top-level tags like HEAD, TRLR
            }
        } else if (currentId && records[currentId]) {
            records[currentId].lines.push(trimmedLine);
        }
    }
    
    // Parse each record's grouped lines
    for (const id in records) {
        const record = records[id];
        let currentTagContext: string | null = null;
        
        if (record.type === 'INDI') {
            const indi: GedcomIndividual = { id, fams: [] };
            individuals[id] = indi;

            for (let i = 0; i < record.lines.length; i++) {
                const line = record.lines[i];
                const parts = line.split(/\s+/);
                const level = parseInt(parts[0], 10);
                const tag = parts[1];
                let value = parts.slice(2).join(' ').trim();
                
                // Handle CONT/CONC for multi-line values
                while (i + 1 < record.lines.length) {
                    const nextLineParts = record.lines[i+1].split(/\s+/);
                    const nextLevel = parseInt(nextLineParts[0], 10);
                    const nextTag = nextLineParts[1];
                    if (nextLevel > level && (nextTag === 'CONT' || nextTag === 'CONC')) {
                        const nextValue = nextLineParts.slice(2).join(' ');
                        value += (nextTag === 'CONC' ? '' : '\n') + nextValue;
                        i++; // Consume the next line
                    } else {
                        break;
                    }
                }

                if (level === 1) {
                    currentTagContext = tag;
                    switch(tag) {
                        case 'NAME': indi.name = value; break;
                        case 'SEX': 
                            if (value === 'M') indi.gender = 'male';
                            else if (value === 'F') indi.gender = 'female';
                            break;
                        case 'FAMC': indi.famc = normalizeId(value); break;
                        case 'FAMS': indi.fams?.push(normalizeId(value)); break;
                        case 'BIRT': case 'DEAT':
                            // These tags just set context; value is on the DATE sub-tag.
                            break;
                    }
                } else if (level === 2 && currentTagContext) {
                    switch(currentTagContext) {
                        case 'NAME':
                            if (tag === 'GIVN') indi.givn = value;
                            else if (tag === 'SURN') indi.surn = value;
                            break;
                        case 'BIRT':
                            if (tag === 'DATE') indi.birthDate = value;
                            break;
                        case 'DEAT':
                             if (tag === 'DATE') indi.deathDate = value;
                            break;
                    }
                }
            }
        } else if (record.type === 'FAM') {
            const fam: GedcomFamily = { id, chil: [] };
            families[id] = fam;

            for (const line of record.lines) {
                const parts = line.split(/\s+/);
                const tag = parts[1];
                const value = parts.slice(2).join(' ').trim();

                switch(tag) {
                    case 'HUSB': fam.husb = normalizeId(value); break;
                    case 'WIFE': fam.wife = normalizeId(value); break;
                    case 'CHIL': fam.chil?.push(normalizeId(value)); break;
                }
            }
        }
    }

    if (Object.keys(individuals).length === 0) {
        throw new Error("No individuals found in the file. Please check the file format.");
    }

    const people: People = {};
    for (const id in individuals) {
        const indi = individuals[id];
        people[id] = {
            id: indi.id,
            name: parsePersonName(indi),
            gender: indi.gender,
            birthDate: indi.birthDate,
            deathDate: indi.deathDate,
        };
    }

    // Link families
    for (const famId in families) {
        const fam = families[famId];
        const { husb, wife, chil } = fam;
        
        if (husb && wife && people[husb] && people[wife]) {
            people[husb].spouseId = wife;
            people[wife].spouseId = husb;
        }
        if (chil) {
            chil.forEach(childId => {
                if (people[childId]) {
                    if (husb) people[childId].fatherId = husb;
                    if (wife) people[childId].motherId = wife;
                }
            });
        }
    }
    
    // Fallback for FAMC links
    for (const indiId in individuals) {
        const indi = individuals[indiId];
        const person = people[indiId];
        if (indi.famc && (!person.fatherId || !person.motherId)) {
            const familyAsChild = families[indi.famc];
            if (familyAsChild) {
                if (familyAsChild.husb && !person.fatherId) person.fatherId = familyAsChild.husb;
                if (familyAsChild.wife && !person.motherId) person.motherId = familyAsChild.wife;
            }
        }
    }

    // Determine the root person
    let rootId = Object.keys(people).find(id => !people[id].fatherId && !people[id].motherId);
    if (!rootId) {
        rootId = Object.keys(people)[0];
    }
    if (!rootId) {
        throw new Error("Could not determine a root person from the GEDCOM file. The file might be empty or invalid.");
    }
    
    return { people, rootId };
};

export const exportToGedcom = (people: People): string => {
    const lines: string[] = [];

    // --- HEAD Record ---
    lines.push('0 HEAD');
    lines.push('1 SOUR GeminiFamilyTree');
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    lines.push(`1 DATE ${day} ${month} ${year}`);
    lines.push('1 GEDC');
    lines.push('2 VERS 5.5.1');
    lines.push('2 FORM LINEAGE-LINKED');
    lines.push('1 CHAR UTF-8');

    // --- Process data to build family structures ---
    const families = new Map<string, { husb?: string; wife?: string; chil: string[]; famId: string }>();
    let famCounter = 1;

    const getFamily = (p1Id?: string, p2Id?: string): { husb?: string; wife?: string; chil: string[]; famId: string } | null => {
        if (!p1Id && !p2Id) return null;
        const key = [p1Id, p2Id].filter((id): id is string => !!id).sort().join('|');
        if (!key) return null;

        if (families.has(key)) {
            return families.get(key)!;
        }
        const newFam = { famId: `@F${famCounter++}@`, chil: [] };
        families.set(key, newFam);
        return newFam;
    };

    Object.values(people).forEach(person => {
        // Family where person is a child
        const familyAsChild = getFamily(person.fatherId, person.motherId);
        if (familyAsChild) {
            if (!familyAsChild.chil.includes(person.id)) {
                familyAsChild.chil.push(person.id);
            }
            if (person.fatherId) familyAsChild.husb = person.fatherId;
            if (person.motherId) familyAsChild.wife = person.motherId;
        }

        // Family where person is a spouse
        if (person.spouseId) {
            const familyAsSpouse = getFamily(person.id, person.spouseId)!;
            const spouse = people[person.spouseId];

            if (person.gender === 'male') {
                familyAsSpouse.husb = person.id;
                familyAsSpouse.wife = spouse?.id;
            } else if (person.gender === 'female') {
                familyAsSpouse.wife = person.id;
                familyAsSpouse.husb = spouse?.id;
            } else { // Gender not specified, make a best guess
                if (spouse?.gender === 'female') {
                    familyAsSpouse.husb = person.id;
                    familyAsSpouse.wife = spouse.id;
                } else {
                    familyAsSpouse.wife = person.id;
                    familyAsSpouse.husb = spouse?.id;
                }
            }
        }
    });

    // --- INDI Records ---
    Object.values(people).forEach(person => {
        lines.push(`0 ${person.id} INDI`);
        const givenName = [person.name.first, person.name.middle].filter(Boolean).join(' ');
        lines.push(`1 NAME ${givenName} /${person.name.surname || ''}/`);
        if (person.gender) {
            lines.push(`1 SEX ${person.gender === 'male' ? 'M' : 'F'}`);
        }
        if (person.birthDate) {
            lines.push('1 BIRT');
            lines.push(`2 DATE ${person.birthDate}`);
        }
        if (person.deathDate) {
            lines.push('1 DEAT');
            lines.push(`2 DATE ${person.deathDate}`);
        }
        if (person.spouseId) {
            const fam = getFamily(person.id, person.spouseId);
            if (fam) lines.push(`1 FAMS ${fam.famId}`);
        }
        if (person.fatherId || person.motherId) {
            const fam = getFamily(person.fatherId, person.motherId);
            if (fam) lines.push(`1 FAMC ${fam.famId}`);
        }
    });

    // --- FAM Records ---
    families.forEach(fam => {
        lines.push(`0 ${fam.famId} FAM`);
        if (fam.husb) lines.push(`1 HUSB ${fam.husb}`);
        if (fam.wife) lines.push(`1 WIFE ${fam.wife}`);
        fam.chil.forEach(childId => {
            lines.push(`1 CHIL ${childId}`);
        });
    });

    // --- TRLR Record ---
    lines.push('0 TRLR');

    return lines.join('\n');
};
