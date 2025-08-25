

import React from 'react';
import { type NodeDatum, type Person, formatCardName, type People } from '../types';
import { findRelationship } from '../services/relationshipService';
import { calculateAge } from '../utils/dateUtils';

interface CustomNodeElementProps {
  nodeDatum: any; // Use `any` to access react-d3-tree's internal `_children` property
  onNodeClick: (person: Person) => void;
  people: People;
  rootId: string;
  viewMode: 'ancestors' | 'descendants';
}

const PersonCard: React.FC<{ person: Person, relationship: string | null }> = ({ person, relationship }) => {
    const isDeceased = !!person.deathDate;
    const age = calculateAge(person.birthDate, person.deathDate);

    const genderStyles = {
        male: 'bg-blue-50 border-blue-400 group-hover:bg-blue-100',
        female: 'bg-rose-50 border-rose-400 group-hover:bg-rose-100',
    };

    const defaultStyle = 'bg-white border-gray-300 group-hover:bg-gray-100';

    const genderOrBaseStyle = person.gender ? genderStyles[person.gender] : defaultStyle;

    let deceasedStyle = '';
    if (isDeceased) {
        if (person.gender === 'male') {
            deceasedStyle = 'grayscale brightness-95'; // Darker for deceased males
        } else {
            deceasedStyle = 'grayscale'; // Standard for others
        }
    }

    const cardClasses = [
        "relative rounded-md shadow-md px-2 pt-2 pb-5 w-[110px] transition-all duration-200 cursor-pointer border",
        genderOrBaseStyle,
        deceasedStyle
    ].join(' ');

    return (
        <div className={cardClasses}>
            {age !== null && (
                <div
                    className="absolute top-0 right-0 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-[10px] shadow-sm z-30"
                    style={{ transform: 'translate(50%, -50%)' }}
                    title={isDeceased ? `Age at death: ${age}` : `Age: ${age}`}
                >
                    {age}
                </div>
            )}
             {relationship && relationship !== "Root Person" && (
                <div
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full bg-transparent text-transparent group-hover:bg-indigo-500 group-hover:text-white text-[9px] font-semibold shadow-md whitespace-nowrap z-20 transition-colors duration-300"
                >
                    {relationship}
                </div>
            )}
            <div className="text-center">
                <p className="text-xs font-bold text-gray-800 truncate">{formatCardName(person)}</p>
                <div className="text-[10px] leading-tight text-gray-500 mt-0.5 h-7 flex flex-col justify-center items-center">
                    {(person.birthDate || person.deathDate) ? (
                        <>
                            <div>
                                {person.birthDate ? `b. ${person.birthDate}` : <>&nbsp;</>}
                            </div>
                            <div>
                                {person.deathDate?.trim() ? `d. ${person.deathDate}` : <>&nbsp;</>}
                            </div>
                        </>
                    ) : (
                        <span className="italic">No dates</span>
                    )}
                </div>
            </div>
        </div>
    );
};

const SpouseLink: React.FC<{ spouse: Person, onClick: (person: Person) => void }> = ({ spouse, onClick }) => {
    const isDeceased = !!spouse.deathDate;
    const age = calculateAge(spouse.birthDate, spouse.deathDate);
    const genderStyles = {
        male: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
        female: 'bg-rose-50 border-rose-300 hover:bg-rose-100',
    };
    const defaultStyle = 'bg-white border-gray-300 hover:bg-gray-100';
    const genderOrBaseStyle = spouse.gender ? genderStyles[spouse.gender] : defaultStyle;

    const cardClasses = [
        "rounded-md shadow-md px-2 py-1 transition-all duration-200 cursor-pointer border whitespace-nowrap text-center",
        genderOrBaseStyle,
        isDeceased ? 'grayscale' : ''
    ].join(' ');

    return (
        <div 
            className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-500 pointer-events-auto z-40"
            style={{ transform: 'translate(-50%, -50%)' }} // Position center of spouse box on top-left of main card
            onClick={(e) => {
                e.stopPropagation();
                onClick(spouse);
            }}
        >
            <div className="relative">
                {/* Connector line: from bottom-right of this element to the parent's top-left */}
                <div className="absolute top-full right-0 w-[5px] h-[8px] border-b border-r border-gray-400 rounded-br-sm"></div>
                
                {age !== null && (
                    <div
                        className={`absolute top-0 right-0 w-7 h-7 rounded-full bg-amber-400 ${isDeceased ? 'grayscale' : ''} flex items-center justify-center text-white font-bold text-[10px] shadow-sm z-30`}
                        style={{ transform: 'translate(50%, -50%)' }}
                        title={isDeceased ? `Age at death: ${age}` : `Age: ${age}`}
                    >
                        {age}
                    </div>
                )}
                
                <div className={cardClasses} title={`Spouse: ${formatCardName(spouse)}`}>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider -mb-0.5">Spouse</p>
                    <p className="text-xs font-semibold text-gray-700 truncate">{formatCardName(spouse)}</p>
                </div>
            </div>
        </div>
    );
};

const MemberNode: React.FC<CustomNodeElementProps> = ({ nodeDatum, onNodeClick, people, rootId, viewMode }) => {
    const person = nodeDatum.__person;
    const spouse = person.spouseId ? people[person.spouseId] : null;
    const relationship = findRelationship(people, rootId, person.id);

    // Increase the foreignObject size to provide padding for overflowing elements like age badges and spouse cards.
    const width = 160;
    const height = 120;
    const xOffset = -width / 2;
    const yOffset = -height / 2;

    return (
        <g>
            <foreignObject width={width} height={height} x={xOffset} y={yOffset} overflow="visible">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="group relative" onClick={() => onNodeClick(person)}>
                        <PersonCard person={person} relationship={relationship} />
                        {spouse && viewMode === 'descendants' && <SpouseLink spouse={spouse} onClick={onNodeClick} />}
                    </div>
                </div>
            </foreignObject>
        </g>
    );
};

export default MemberNode;