import React, { useState, useEffect } from 'react';
import { type People, formatName } from '../types';
import PersonSearch from './PersonSearch';
import { findRelationship } from '../services/relationshipService';

// Icons
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface RelationshipEstimatorProps {
  people: People;
}

const RelationshipEstimator: React.FC<RelationshipEstimatorProps> = ({ people }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [person1Id, setPerson1Id] = useState<string | null>(null);
  const [person2Id, setPerson2Id] = useState<string | null>(null);
  const [relationship, setRelationship] = useState<string | null>(null);

  const person1 = person1Id ? people[person1Id] : null;
  const person2 = person2Id ? people[person2Id] : null;

  useEffect(() => {
    if (person1 && person2) {
      if (person1.id === person2.id) {
        setRelationship("They are the same person.");
        return;
      }
      
      const rel = findRelationship(people, person1.id, person2.id);

      if (rel) {
        const person1Name = formatName(person1);
        const person2Name = formatName(person2);
        setRelationship(`${person2Name} is ${person1Name}'s ${rel.replace('Root Person', 'self')}.`);
      } else {
        setRelationship("No direct relationship found.");
      }
    } else {
      setRelationship(null);
    }
  }, [person1, person2, people]);

  // When closing, clear the state to prevent stale data on reopen
  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const handleReset = () => {
    setPerson1Id(null);
    setPerson2Id(null);
  };

  const person1Name = person1 ? formatName(person1) : undefined;
  const person2Name = person2 ? formatName(person2) : undefined;

  return (
    <div className="bg-gray-100/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 flex flex-col gap-1">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center text-left rounded-md px-1"
            aria-expanded={isOpen}
            aria-controls="relationship-estimator-panel"
        >
            <span className="text-xs text-gray-500">Estimate relationship</span>
            <span className="text-gray-500">{isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
        </button>
        {isOpen && (
             <div id="relationship-estimator-panel" className="flex flex-col gap-2">
                <PersonSearch
                    id="person1-search"
                    people={people}
                    onPersonSelect={setPerson1Id}
                    placeholder="Select first person..."
                    selectedPersonName={person1Name}
                />
                <PersonSearch
                    id="person2-search"
                    people={people}
                    onPersonSelect={setPerson2Id}
                    placeholder="Select second person..."
                    selectedPersonName={person2Name}
                />
                {relationship && (
                    <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center relative">
                        <p className="text-sm font-semibold text-indigo-800">{relationship}</p>
                        <button 
                            onClick={handleReset} 
                            className="absolute top-1 right-1 p-0.5 text-indigo-400 hover:text-indigo-600 rounded-full hover:bg-indigo-100"
                            title="Clear selection"
                            aria-label="Clear relationship estimation"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default RelationshipEstimator;