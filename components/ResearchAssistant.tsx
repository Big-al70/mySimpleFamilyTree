import React, { useState, useEffect } from 'react';
import { type Person, formatName, type ResearchResult } from '../types';
import { researchPerson } from '../services/geminiService';

// Icons
const LightBulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const GlobeAltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.998 5.998 0 0116 10c0 .954-.225 1.852-.635 2.673A6.01 6.01 0 0111.912 16a6.01 6.01 0 01-7.58-7.973z" clipRule="evenodd" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;


interface ResearchAssistantProps {
    person: Person | null;
}

const ResearchAssistant: React.FC<ResearchAssistantProps> = ({ person }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [researchQuery, setResearchQuery] = useState('');
    const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
    const [isResearching, setIsResearching] = useState(false);

    useEffect(() => {
        if (person) {
            const defaultQuery = `Historical records for ${formatName(person)}${person.birthDate ? `, born ${person.birthDate}` : ''}${person.deathDate?.trim() ? `, died ${person.deathDate}` : ''}`;
            setResearchQuery(defaultQuery);
            setResearchResult(null); // Clear previous results when person changes
            setIsResearching(false);
        }
    }, [person]);

    const handleResearch = async () => {
        if (!researchQuery.trim()) return;
        setIsResearching(true);
        setResearchResult(null);
        const result = await researchPerson(researchQuery);
        setResearchResult(result);
        setIsResearching(false);
    };

    const handleClear = () => {
        setResearchResult(null);
        setIsResearching(false);
        if (person) {
            const defaultQuery = `Historical records for ${formatName(person)}${person.birthDate ? `, born ${person.birthDate}` : ''}${person.deathDate?.trim() ? `, died ${person.deathDate}` : ''}`;
            setResearchQuery(defaultQuery);
        }
    };
    
    if (!person) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-20 w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center p-3 bg-gray-50/50 hover:bg-gray-100/70 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls="research-panel"
                >
                    <div className="flex items-center">
                        <LightBulbIcon />
                        <div className="ml-3 text-left">
                           <h3 className="font-bold text-gray-800">Research Assistant</h3>
                           <p className="text-xs text-gray-500 truncate max-w-[200px]">For: {formatName(person)}</p>
                        </div>
                    </div>
                    {isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
                </button>

                {isOpen && (
                     <div id="research-panel" className="p-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">Use Google Search to find historical records and information online.</p>

                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={researchQuery}
                                onChange={(e) => setResearchQuery(e.target.value)}
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Enter search query..."
                            />
                            <button
                                onClick={handleResearch}
                                disabled={isResearching}
                                className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors shrink-0"
                            >
                                <GlobeAltIcon />
                                {isResearching ? 'Searching...' : 'Search'}
                            </button>
                             {(researchResult || isResearching) && (
                                <button
                                    onClick={handleClear}
                                    className="flex items-center p-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shrink-0"
                                    title="Clear research results and reset query"
                                    aria-label="Clear research results"
                                >
                                    <XCircleIcon />
                                </button>
                            )}
                        </div>

                        <div className="mt-4 max-h-[calc(100vh-350px)] overflow-y-auto">
                            {isResearching && <p className="text-gray-500 italic p-3 text-center">Searching the web...</p>}
                            
                            {researchResult && (
                                <div className="bg-gray-50 p-4 rounded-md border">
                                    <p className="text-gray-800 whitespace-pre-wrap">{researchResult.summary}</p>
                                    {researchResult.sources.length > 0 && (
                                        <div className="mt-4 border-t pt-3">
                                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Sources:</h4>
                                            <ul className="space-y-2">
                                                {researchResult.sources.map((source, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <DocumentTextIcon />
                                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all">
                                                            {source.title || source.uri}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResearchAssistant;