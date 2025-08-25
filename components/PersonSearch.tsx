import React, { useState, useEffect, useRef } from 'react';
import { type People, type Person, formatName } from '../types';

interface PersonSearchProps {
    id: string;
    people: People;
    onPersonSelect: (personId: string | null) => void;
    placeholder: string;
    selectedPersonName?: string;
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;


const PersonSearch: React.FC<PersonSearchProps> = ({ id, people, onPersonSelect, placeholder, selectedPersonName }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Person[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const hasSelection = !!selectedPersonName;

    useEffect(() => {
        setQuery(selectedPersonName || '');
    }, [selectedPersonName]);

    useEffect(() => {
        if (hasSelection && query === selectedPersonName) {
            setResults([]);
            return;
        }

        if (query.trim().length > 0) {
            const lowerCaseQuery = query.toLowerCase();
            const filteredPeople = Object.values(people).filter(person =>
                formatName(person).toLowerCase().includes(lowerCaseQuery)
            ).sort((a,b) => formatName(a).localeCompare(formatName(b)))
            .slice(0, 10);
            setResults(filteredPeople);
        } else {
            setResults([]);
        }
    }, [query, people, hasSelection, selectedPersonName]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
                setResults([]);
                if (!hasSelection) {
                    setQuery('');
                } else {
                    setQuery(selectedPersonName || '');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [hasSelection, selectedPersonName]);

    const handleSelect = (personId: string) => {
        onPersonSelect(personId);
        setResults([]);
        setIsFocused(false);
    };
    
    const handleClear = () => {
        onPersonSelect(null);
        setQuery('');
    };

    return (
        <div className="relative w-full" ref={searchContainerRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
            </div>
            <input
                id={id}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    setIsFocused(true);
                    if (hasSelection) {
                        onPersonSelect(null);
                        setQuery('');
                    }
                }}
                placeholder={placeholder}
                aria-label={placeholder}
                className="w-full p-2 pl-10 text-sm border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-8"
            />
            {hasSelection && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label="Clear selection"
                >
                    <XCircleIcon />
                </button>
            )}
            {isFocused && results.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto" role="listbox">
                    {results.map(person => (
                        <li
                            key={person.id}
                            onClick={() => handleSelect(person.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSelect(person.id)}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer focus:outline-none focus:bg-blue-100"
                            role="option"
                            aria-selected="false"
                            tabIndex={0}
                        >
                            <p className="font-medium text-gray-900 truncate">{formatName(person)}</p>
                            <p className="text-xs text-gray-500">
                                {(person.birthDate || person.deathDate) ? (
                                    <>
                                        {person.birthDate && `b. ${person.birthDate}`}
                                        {person.deathDate?.trim() && <>{person.birthDate ? ' - ' : ''}d. ${person.deathDate}</>}
                                    </>
                                ) : (
                                    <span className="italic">No dates available</span>
                                )}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PersonSearch;