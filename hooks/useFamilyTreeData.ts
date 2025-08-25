

import { useState, useCallback, useMemo } from 'react';
import { type People, type Person, type NodeDatum, RelationshipType, formatName, PersonName } from '../types';
import { INITIAL_PEOPLE, ROOT_PERSON_ID } from '../constants';
import { parseDateString, sortByBirthDate } from '../utils/dateUtils';

// A function to get initial state, which returns the default constants.
const getInitialState = () => {
    return {
        initialPeople: INITIAL_PEOPLE,
        initialRootId: ROOT_PERSON_ID,
        initialTreeName: 'My Family Tree',
    };
};

interface DefaultTreeState {
  people: People;
  rootId: string;
  treeName: string;
}

const DEFAULT_NEW_TREE_STATE: DefaultTreeState = {
  people: {
    '1': { id: '1', name: { first: 'New', surname: 'Person' }, gender: 'male' }
  },
  rootId: '1',
  treeName: 'Untitled Family Tree'
};


// A memoized recursive function to build the ANCESTOR tree from flat data.
// Each node represents a single person.
const buildAncestorTree = (people: People, personId: string | null): NodeDatum | null => {
    if (!personId || !people[personId]) {
        return null;
    }
    const person = people[personId];

    const parentNodes: NodeDatum[] = [];
    // Legal/Adoptive Parents
    if (person.fatherId) {
        const fatherNode = buildAncestorTree(people, person.fatherId);
        if (fatherNode) parentNodes.push(fatherNode);
    }
    if (person.motherId) {
        const motherNode = buildAncestorTree(people, person.motherId);
        if (motherNode) parentNodes.push(motherNode);
    }

    // Birth Parents (if adopted)
    if (person.isAdopted) {
        if (person.birthFatherId) {
            const birthFatherNode = buildAncestorTree(people, person.birthFatherId);
            if (birthFatherNode) parentNodes.push(birthFatherNode);
        }
        if (person.birthMotherId) {
            const birthMotherNode = buildAncestorTree(people, person.birthMotherId);
            if (birthMotherNode) parentNodes.push(birthMotherNode);
        }
    }

    const nodeForPerson: NodeDatum = {
        name: formatName(person),
        attributes: { 'ID': person.id },
        __person: person,
        children: parentNodes,
    };
    return nodeForPerson;
};


// A memoized recursive function to build the DESCENDANT tree from flat data.
// Each node represents a single person.
const buildDescendantTree = (people: People, personId: string | null, processedIds: Set<string>): NodeDatum | null => {
    if (!personId || !people[personId] || processedIds.has(personId)) {
        return null;
    }
    processedIds.add(personId);

    const person = people[personId];

    const children = Object.values(people)
        .filter(p => 
            (p.fatherId === person.id || p.motherId === person.id) ||
            (p.isAdopted && (p.birthFatherId === person.id || p.birthMotherId === person.id))
        )
        .sort(sortByBirthDate);

    const childrenNodes: NodeDatum[] = children
        .map(child => buildDescendantTree(people, child.id, processedIds))
        .filter((node): node is NodeDatum => node !== null);

    const personNode: NodeDatum = {
        name: formatName(person),
        attributes: { 'ID': person.id },
        __person: person,
        children: childrenNodes,
    };

    return personNode;
};


export const useFamilyTreeData = () => {
    const [{ initialPeople, initialRootId, initialTreeName }] = useState(getInitialState);

    const [people, setPeople] = useState<People>(initialPeople);
    const [treeName, setTreeName] = useState<string>(initialTreeName);
    const [viewMode, setViewMode] = useState<'ancestors' | 'descendants'>('descendants');
    const [homePersonId, setHomePersonId] = useState<string>(initialRootId);

    const [history, setHistory] = useState<{ items: string[], currentIndex: number }>({
        items: [initialRootId],
        currentIndex: 0,
    });

    const rootId = history.items[history.currentIndex];
    const canGoBack = history.currentIndex > 0;
    const canGoForward = history.currentIndex < history.items.length - 1;

    const setRootId = useCallback((newRootId: string) => {
        setHistory(prev => {
            if (prev.items[prev.currentIndex] === newRootId) return prev;
            // Clear forward history when selecting a new root
            const newItems = prev.items.slice(0, prev.currentIndex + 1);
            newItems.push(newRootId);
            return {
                items: newItems,
                currentIndex: newItems.length - 1,
            };
        });
    }, []);

    const goBack = useCallback(() => {
        setHistory(prev => {
            if (prev.currentIndex > 0) {
                return { ...prev, currentIndex: prev.currentIndex - 1 };
            }
            return prev;
        });
    }, []);

    const goForward = useCallback(() => {
        setHistory(prev => {
            if (prev.currentIndex < prev.items.length - 1) {
                return { ...prev, currentIndex: prev.currentIndex + 1 };
            }
            return prev;
        });
    }, []);
    
    const goToHome = useCallback(() => {
        setRootId(homePersonId);
    }, [homePersonId, setRootId]);

    const tree = useMemo(() => {
        if (!rootId) return null;
        if (viewMode === 'ancestors') {
            return buildAncestorTree(people, rootId);
        }
        const processedIds = new Set<string>();
        return buildDescendantTree(people, rootId, processedIds);
    }, [people, rootId, viewMode]);

    const addParents = useCallback((personId: string) => {
        setPeople(prevPeople => {
            const person = prevPeople[personId];
            if (!person || person.fatherId || person.motherId) {
                return prevPeople;
            }

            const newPeople = { ...prevPeople };

            const fatherId = crypto.randomUUID();
            const motherId = crypto.randomUUID();

            const newFather: Person = {
                id: fatherId,
                name: { first: 'Unknown', surname: person.name.surname || 'Father' },
                spouseId: motherId,
                gender: 'male',
            };
            const newMother: Person = {
                id: motherId,
                name: { first: 'Unknown', surname: 'Mother' },
                spouseId: fatherId,
                gender: 'female',
            };

            newPeople[fatherId] = newFather;
            newPeople[motherId] = newMother;
            newPeople[personId] = { ...person, fatherId, motherId };
            
            return newPeople;
        });
    }, []);

    const addBirthParents = useCallback((personId: string) => {
        setPeople(prevPeople => {
            const person = prevPeople[personId];
            if (!person || person.birthFatherId || person.birthMotherId) {
                return prevPeople;
            }

            const newPeople = { ...prevPeople };

            const birthFatherId = crypto.randomUUID();
            const birthMotherId = crypto.randomUUID();

            const newBirthFather: Person = {
                id: birthFatherId,
                name: { first: 'Unknown', surname: 'Birth Father' },
                spouseId: birthMotherId,
                gender: 'male',
            };
            const newBirthMother: Person = {
                id: birthMotherId,
                name: { first: 'Unknown', surname: 'Birth Mother' },
                spouseId: birthFatherId,
                gender: 'female',
            };

            newPeople[birthFatherId] = newBirthFather;
            newPeople[birthMotherId] = newBirthMother;
            newPeople[personId] = { ...person, birthFatherId, birthMotherId };
            
            return newPeople;
        });
    }, []);

    const updatePerson = useCallback((personId: string, updatedData: Partial<Person>) => {
        setPeople(prevPeople => {
            const newPeople = {
                ...prevPeople,
                [personId]: { ...prevPeople[personId], ...updatedData },
            };
            
            // Sync isSeparated with spouse
            if ('isSeparated' in updatedData) {
                const person = newPeople[personId];
                const spouseId = person.spouseId;
                if (spouseId && newPeople[spouseId]) {
                    // Don't trigger a re-render if data is already correct
                    if (newPeople[spouseId].isSeparated !== updatedData.isSeparated) {
                        newPeople[spouseId] = {
                            ...newPeople[spouseId],
                            isSeparated: updatedData.isSeparated,
                        };
                    }
                }
            }

            return newPeople;
        });
    }, []);

    const addPerson = useCallback((personId: string, relationship: RelationshipType, personData: Omit<Person, 'id' | 'fatherId' | 'motherId' | 'spouseId'>): string => {
        const newId = crypto.randomUUID();

        setPeople(prevPeople => {
            let newPeople = { ...prevPeople };

            // This function creates and adds parents for a person if they don't have any.
            // It MUTATES the `newPeople` object.
            const ensureParents = (personId: string) => {
                const person = newPeople[personId];
                if (!person || person.fatherId || person.motherId) {
                    return;
                }

                const fatherId = crypto.randomUUID();
                const motherId = crypto.randomUUID();

                const newFather: Person = {
                    id: fatherId,
                    name: { first: 'Unknown', surname: person.name.surname || 'Father' },
                    spouseId: motherId,
                    gender: 'male',
                };
                const newMother: Person = {
                    id: motherId,
                    name: { first: 'Unknown', surname: 'Mother' },
                    spouseId: fatherId,
                    gender: 'female',
                };

                newPeople[fatherId] = newFather;
                newPeople[motherId] = newMother;
                newPeople[personId] = { ...person, fatherId, motherId };
            };

            if (relationship === 'child') {
                // Step 1: Ensure the clicked parent has their own parents.
                ensureParents(personId);
                let clickedParent = { ...newPeople[personId] };

                // Step 2: Ensure the clicked parent has a spouse, creating one if necessary.
                if (!clickedParent.spouseId) {
                    const newSpouseId = crypto.randomUUID();
                    const newSpouse: Person = {
                        id: newSpouseId,
                        name: { first: 'Unknown', surname: 'Spouse' },
                        spouseId: personId,
                        gender: clickedParent.gender === 'male' ? 'female' : (clickedParent.gender === 'female' ? 'male' : undefined),
                    };
                    newPeople[newSpouseId] = newSpouse;
                    
                    newPeople[personId] = { ...clickedParent, spouseId: newSpouseId };
                    clickedParent.spouseId = newSpouseId; 

                    // Step 3: The newly created spouse does not need parents by default.
                }

                const spouse = newPeople[clickedParent.spouseId!];
                
                // Step 4: Determine the father and mother roles for the new child.
                let father, mother;
                if (clickedParent.gender === 'male') {
                    father = clickedParent;
                    mother = spouse;
                } else if (clickedParent.gender === 'female') {
                    mother = clickedParent;
                    father = spouse;
                } else {
                    if (spouse.gender === 'female') {
                        father = clickedParent; mother = spouse;
                    } else {
                        mother = clickedParent; father = spouse;
                    }
                }
                
                // Step 5: Create the new child object.
                const newChild: Person = { ...personData, id: newId, fatherId: father.id, motherId: mother.id };

                // Step 6: Assign surname from the father.
                if (father?.name.surname && father.name.surname !== 'Spouse') {
                    newChild.name = { ...personData.name, surname: father.name.surname };
                }
                
                newPeople[newId] = newChild;

            } else if (relationship === 'spouse') {
                const newSpouse: Person = { ...personData, id: newId, spouseId: personId };
                const existingPerson = newPeople[personId];
                if (existingPerson) {
                    newPeople[personId] = { ...existingPerson, spouseId: newId };
                }
                newPeople[newId] = newSpouse;
                
                // A new spouse does not get parents by default.
            } else if (relationship === 'sibling') {
                // Step 1: Ensure the person we're adding a sibling to has parents.
                ensureParents(personId);
                const siblingOfWithParents = newPeople[personId]; // Re-fetch after ensureParents might mutate it

                const { fatherId, motherId } = siblingOfWithParents;

                // Step 2: Create the new sibling with the same parents.
                const newSibling: Person = { ...personData, id: newId, fatherId, motherId };
                
                // Step 3: Assign surname from the father.
                if (fatherId && newPeople[fatherId]?.name.surname) {
                    const father = newPeople[fatherId];
                    if (father.name.surname) {
                        newSibling.name = { ...personData.name, surname: father.name.surname };
                    }
                }

                newPeople[newId] = newSibling;
            }
            
            return newPeople;
        });

        return newId;
    }, []);

    const deletePerson = useCallback((personIdToDelete: string) => {
        if (!people[personIdToDelete]) return;

        if (Object.keys(people).length <= 1) {
            alert("Cannot delete the last person in the tree.");
            return;
        }

        const newPeople = { ...people };
        delete newPeople[personIdToDelete];

        // Clear references from others
        for (const id in newPeople) {
            const person = newPeople[id];
            if (person.spouseId === personIdToDelete) newPeople[id] = { ...person, spouseId: undefined };
            if (person.fatherId === personIdToDelete) newPeople[id] = { ...person, fatherId: undefined };
            if (person.motherId === personIdToDelete) newPeople[id] = { ...person, motherId: undefined };
            if (person.birthFatherId === personIdToDelete) newPeople[id] = { ...person, birthFatherId: undefined };
            if (person.birthMotherId === personIdToDelete) newPeople[id] = { ...person, birthMotherId: undefined };
            if (person.formerSpouseIds?.includes(personIdToDelete)) {
                newPeople[id] = { ...person, formerSpouseIds: person.formerSpouseIds.filter(exId => exId !== personIdToDelete) };
            }
        }
        
        setPeople(newPeople);
        
        let newHomeId = homePersonId;
        if (homePersonId === personIdToDelete) {
             // If home person deleted, set new home to first available person.
            newHomeId = Object.keys(newPeople)[0];
            setHomePersonId(newHomeId);
        }

        setHistory(prev => {
            const newItems = prev.items.filter(id => id !== personIdToDelete);
            if (newItems.length === 0 && Object.keys(newPeople).length > 0) {
                // History is now empty, re-initialize with the new home person
                return { items: [newHomeId], currentIndex: 0 };
            }
            // Clamp index to valid bounds after deletion
            const newIndex = Math.min(prev.currentIndex, newItems.length - 1);
            return { items: newItems, currentIndex: newIndex };
        });

    }, [people, homePersonId]);

    const loadPeople = useCallback((newPeople: People, newRootId: string, newTreeName?: string) => {
        setPeople(newPeople);
        setTreeName(newTreeName || 'My Family Tree');
        setHistory({ items: [newRootId], currentIndex: 0 });
        setHomePersonId(newRootId);
    }, []);
    
    const resetTree = useCallback(() => {
        setPeople(DEFAULT_NEW_TREE_STATE.people);
        setTreeName(DEFAULT_NEW_TREE_STATE.treeName);
        setHistory({ items: [DEFAULT_NEW_TREE_STATE.rootId], currentIndex: 0 });
        setHomePersonId(DEFAULT_NEW_TREE_STATE.rootId);
    }, []);

    const divorce = useCallback((person1Id: string) => {
        setPeople(prevPeople => {
            const person1 = prevPeople[person1Id];
            const person2Id = person1?.spouseId;
            if (!person1 || !person2Id || !prevPeople[person2Id]) {
                return prevPeople;
            }
            const person2 = prevPeople[person2Id];

            const newPeople = { ...prevPeople };

            newPeople[person1Id] = {
                ...person1,
                spouseId: undefined,
                isSeparated: undefined, // Clear separation status on divorce
                formerSpouseIds: [...(person1.formerSpouseIds || []), person2Id],
            };
            newPeople[person2Id] = {
                ...person2,
                spouseId: undefined,
                isSeparated: undefined, // Clear separation status on divorce
                formerSpouseIds: [...(person2.formerSpouseIds || []), person1Id],
            };

            return newPeople;
        });
    }, []);

    const replaceSpouse = useCallback((personId: string, newSpouseData: Omit<Person, 'id' | 'fatherId' | 'motherId' | 'spouseId'>): string => {
        const newSpouseId = crypto.randomUUID();

        setPeople(prevPeople => {
            const person = prevPeople[personId];
            const oldSpouseId = person?.spouseId;

            // Safeguard against being called incorrectly
            if (!oldSpouseId || !prevPeople[oldSpouseId]) {
                console.error("replaceSpouse called for a person with no spouse or an invalid spouse ID.");
                // Fallback to just adding a spouse
                const newPeople = { ...prevPeople };
                const newSpouse: Person = { ...newSpouseData, id: newSpouseId, spouseId: personId };
                newPeople[newSpouseId] = newSpouse;
                newPeople[personId] = { ...person, spouseId: newSpouseId };
                return newPeople;
            }

            const oldSpouse = prevPeople[oldSpouseId];
            const newPeople = { ...prevPeople };

            // 1. Update the old spouse to be a former spouse
            newPeople[oldSpouseId] = {
                ...oldSpouse,
                spouseId: undefined,
                isSeparated: undefined,
                formerSpouseIds: [...(oldSpouse.formerSpouseIds || []), personId],
            };
            
            // 2. Create and add the new spouse
            const newSpouse: Person = { ...newSpouseData, id: newSpouseId, spouseId: personId };
            newPeople[newSpouseId] = newSpouse;

            // 3. Update the main person to link to the new spouse and archive the old one
            newPeople[personId] = {
                ...person,
                spouseId: newSpouseId,
                isSeparated: undefined,
                formerSpouseIds: [...(person.formerSpouseIds || []), oldSpouseId],
            };

            return newPeople;
        });

        return newSpouseId;
    }, []);

    return { people, tree, updatePerson, addPerson, addParents, addBirthParents, deletePerson, loadPeople, rootId, setRootId, viewMode, setViewMode, treeName, setTreeName, resetTree, goBack, goForward, canGoBack, canGoForward, homePersonId, setHomePersonId, goToHome, divorce, replaceSpouse };
};
