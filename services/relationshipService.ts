
import { type People } from '../types';

const getGreats = (level: number, base: 'Parent' | 'Child'): string => {
    if (level <= 0) return base; // Should not happen with this logic, but safe
    if (level === 1) return base;
    if (level === 2) return `Grand${base}`;
    // level 3 = Great-Grand
    // The number of "Great-"s is level - 2.
    const prefix = 'Great-'.repeat(level - 2);
    return `${prefix}Grand${base}`;
};

const toOrdinal = (n: number): string => {
    if (n <= 0) return String(n);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const removedText = (r: number): string => {
    if (r === 0) return '';
    if (r === 1) return ', once removed';
    if (r === 2) return ', twice removed';
    return `, ${r} times removed`;
};

const genderize = (base: string, gender?: 'male' | 'female'): string => {
    if (!gender) return base;

    // A map of base terms to their gendered counterparts.
    const genderMap: { [key: string]: { male: string, female: string } } = {
        'Pibling': { male: 'Uncle', female: 'Aunt' },
        'Nibling': { male: 'Nephew', female: 'Niece' },
        'Parent': { male: 'Father', female: 'Mother' },
        'Child': { male: 'Son', female: 'Daughter' },
        'Sibling': { male: 'Brother', female: 'Sister' },
        'Spouse': { male: 'Husband', female: 'Wife' },
        'Stepparent': { male: 'Stepfather', female: 'Stepmother' },
        'Stepchild': { male: 'Stepson', female: 'Stepdaughter' },
        'Stepsibling': { male: 'Stepbrother', female: 'Stepsister' },
        'Grandparent': { male: 'Grandfather', female: 'Grandmother' },
        'Grandchild': { male: 'Grandson', female: 'Granddaughter' },
        'Cousin': { male: 'Cousin', female: 'Cousin' }, // No gender change
    };

    let result = base;
    // Iterate from most specific to least specific to avoid premature replacement (e.g., 'Grandchild' before 'Child').
    const sortedKeys = Object.keys(genderMap).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        const regex = new RegExp(key, 'g');
        if (regex.test(result)) {
            result = result.replace(regex, gender === 'male' ? genderMap[key].male : genderMap[key].female);
        }
    }
    return result;
};

// Map gendered terms back to their neutral base.
const reverseGenderMap: { [key: string]: string } = {
    'Uncle': 'Pibling', 'Aunt': 'Pibling',
    'Nephew': 'Nibling', 'Niece': 'Nibling',
    'Father': 'Parent', 'Mother': 'Parent',
    'Son': 'Child', 'Daughter': 'Child',
    'Brother': 'Sibling', 'Sister': 'Sibling',
    'Husband': 'Spouse', 'Wife': 'Spouse',
    'Stepfather': 'Stepparent', 'Stepmother': 'Stepparent',
    'Stepson': 'Stepchild', 'Stepdaughter': 'Stepchild',
    'Stepbrother': 'Stepsibling', 'Stepsister': 'Stepsibling',
    'Grandfather': 'Grandparent', 'Grandmother': 'Grandparent',
    'Grandson': 'Grandchild', 'Granddaughter': 'Grandchild',
};


// Finds all ancestors of a person and their distance (generation gap) using Breadth-First Search.
const getAncestorsWithDistance = (people: People, personId: string): Map<string, number> => {
    const ancestors = new Map<string, number>();
    const queue: { id: string; distance: number }[] = [{ id: personId, distance: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const { id, distance } = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);

        const person = people[id];
        if (person) {
            ancestors.set(id, distance);
            if (person.fatherId && people[person.fatherId]) queue.push({ id: person.fatherId, distance: distance + 1 });
            if (person.motherId && people[person.motherId]) queue.push({ id: person.motherId, distance: distance + 1 });
        }
    }
    return ancestors;
};


export const findRelationship = (people: People, rootId: string, targetId: string, isRecursiveCall: boolean = false): string | null => {
    if (!rootId || !targetId || !people[rootId] || !people[targetId]) {
        return null;
    }
    if (rootId === targetId) {
        // In the estimator this is special-cased, but for the tree view it's the root.
        return isRecursiveCall ? "Self" : "Root Person";
    }

    const root = people[rootId];
    const target = people[targetId];
    const targetGender = target.gender;

    // Direct spouse
    if (root.spouseId === targetId) {
        return genderize("Spouse", targetGender);
    }
    
    // Explicit check for birth parent/child relationships
    // Check if target is a birth parent of the root
    if (root.isAdopted) {
        if (root.birthFatherId === targetId) {
            return 'Birth Father';
        }
        if (root.birthMotherId === targetId) {
            return 'Birth Mother';
        }
    }
    
    // Check if target is a birth child of the root
    if (target.isAdopted) {
        if (target.birthFatherId === rootId || target.birthMotherId === rootId) {
            return genderize("Birth Child", targetGender);
        }
    }

    // --- Blood Relationship via Nearest Common Ancestor ---
    const rootAncestors = getAncestorsWithDistance(people, rootId);
    const targetAncestors = getAncestorsWithDistance(people, targetId);

    const commonAncestorIds = [...rootAncestors.keys()].filter(id => targetAncestors.has(id));

    if (commonAncestorIds.length > 0) {
        let nearestCommonAncestorId: string | null = null;
        let minDistanceSum = Infinity;

        // The "nearest" common ancestor is the one with the smallest combined generational distance from both individuals.
        for (const commonId of commonAncestorIds) {
            const d1 = rootAncestors.get(commonId)!;
            const d2 = targetAncestors.get(commonId)!;
            if (d1 + d2 < minDistanceSum) {
                minDistanceSum = d1 + d2;
                nearestCommonAncestorId = commonId;
            }
        }
        
        if (nearestCommonAncestorId) {
            const d1 = rootAncestors.get(nearestCommonAncestorId)!; // Distance from root to NCA
            const d2 = targetAncestors.get(nearestCommonAncestorId)!; // Distance from target to NCA
            let relationship: string | null = null;

            if (d1 === 0) { // Root is the NCA, so target is a descendant of root.
                relationship = getGreats(d2, 'Child');
            } else if (d2 === 0) { // Target is the NCA, so target is an ancestor of root.
                relationship = getGreats(d1, 'Parent');
            } else if (d1 === 1 && d2 === 1) { // Siblings or Half-siblings
                const rootFatherId = root.fatherId;
                const rootMotherId = root.motherId;
                const targetFatherId = target.fatherId;
                const targetMotherId = target.motherId;

                const sameFather = rootFatherId && targetFatherId && rootFatherId === targetFatherId;
                const sameMother = rootMotherId && targetMotherId && rootMotherId === targetMotherId;

                if (sameFather && sameMother) {
                    relationship = 'Sibling';
                } else if (sameFather || sameMother) {
                    relationship = 'Half-sibling';
                } else {
                    // This case is unlikely if NCA logic is correct for siblings,
                    // but could occur with complex step-families not yet handled.
                    // Defaulting to Sibling, as they share one common ancestor (the parent).
                    relationship = 'Sibling';
                }
            } else if (d1 > 1 && d2 === 1) { // Target is in the Aunt/Uncle line
                // d1=2: Pibling, d1=3: Great-Pibling, etc.
                const prefix = 'Great-'.repeat(d1 - 2);
                relationship = `${prefix}Pibling`; // Pibling = Parent's Sibling
            } else if (d1 === 1 && d2 > 1) { // Target is in the Niece/Nephew line
                // d2=2: Nibling, d2=3: Grandnibling, d2=4: Great-Grandnibling, etc.
                const base = getGreats(d2 - 1, 'Child'); // Child, Grandchild...
                relationship = base.replace('Child', 'Nibling'); // Nibling = Sibling's Child
            } else { // Cousins
                const cousinNum = Math.min(d1, d2) - 1;
                const removedNum = Math.abs(d1 - d2);
                relationship = `${toOrdinal(cousinNum)} Cousin${removedText(removedNum)}`;
            }
            
            if (relationship) {
                return genderize(relationship, targetGender);
            }
        }
    }

    // --- Step-relationships (if no blood relationship found) ---

    // Step-sibling check
    const rootFather = root.fatherId ? people[root.fatherId] : null;
    const rootMother = root.motherId ? people[root.motherId] : null;

    // Is target a child of my stepmother? (My father's spouse who isn't my mother)
    if (rootFather?.spouseId && rootFather.spouseId !== root.motherId) {
        const stepmother = people[rootFather.spouseId];
        if (stepmother && (target.fatherId === stepmother.id || target.motherId === stepmother.id)) {
            // We know from NCA check that target is not my half-sibling via father.
            return genderize('Stepsibling', targetGender);
        }
    }
    // Is target a child of my stepfather? (My mother's spouse who isn't my father)
    if (rootMother?.spouseId && rootMother.spouseId !== root.fatherId) {
        const stepfather = people[rootMother.spouseId];
        if (stepfather && (target.fatherId === stepfather.id || target.motherId === stepfather.id)) {
            // We know from NCA check that target is not my half-sibling via mother.
            return genderize('Stepsibling', targetGender);
        }
    }

    // Stepchild check
    if (root.spouseId) {
        const spouse = people[root.spouseId];
        // Check if target is a child of my spouse, but not my child.
        const isSpousesChild = target.fatherId === spouse.id || target.motherId === spouse.id;
        const isMyChild = target.fatherId === rootId || target.motherId === rootId;
        if (isSpousesChild && !isMyChild) {
            return genderize('Stepchild', targetGender);
        }
    }

    // If this is a recursive call, we stop before checking in-laws to prevent loops.
    if (isRecursiveCall) {
        return null;
    }

    // --- In-law relationships (if no blood or step relationship found) ---

    // Case A: Target is the spouse of a blood relative of the root.
    if (target.spouseId && people[target.spouseId]) {
        const bloodRelativeRelationship = findRelationship(people, rootId, target.spouseId, true);
        if (bloodRelativeRelationship && bloodRelativeRelationship !== "Self") {
            const lowerRel = bloodRelativeRelationship.toLowerCase();
            // Stepparent check (a type of in-law relationship)
            if (lowerRel.includes('parent') || lowerRel.includes('father') || lowerRel.includes('mother')) {
                return genderize(bloodRelativeRelationship.replace(/father|mother|parent/i, 'Stepparent'), targetGender);
            }
            
            // De-genderize the relationship to find the neutral base term (e.g., 'Son' -> 'Child').
            let baseTerm = bloodRelativeRelationship;
            const sortedGenderedKeys = Object.keys(reverseGenderMap).sort((a, b) => b.length - a.length);
            for (const key of sortedGenderedKeys) {
                if (baseTerm.includes(key)) {
                    baseTerm = baseTerm.replace(new RegExp(key, 'g'), reverseGenderMap[key]);
                }
            }
            
            // Re-genderize the base term using the *target's* gender.
            const finalTerm = genderize(baseTerm, targetGender);

            return `${finalTerm}-in-law`;
        }
    }

    // Case B: Target is a blood relative of the root's spouse.
    if (root.spouseId && people[root.spouseId]) {
        const relationshipToSpouse = findRelationship(people, root.spouseId, target.id, true);
        if (relationshipToSpouse && relationshipToSpouse !== "Self") {
            // The step-child case is now handled before this, so what remains is a true in-law.
            return `${relationshipToSpouse}-in-law`;
        }
    }

    return null;
};
