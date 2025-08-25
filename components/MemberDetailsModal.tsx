import React, { useState, useEffect } from 'react';
import { type Person, type People, type RelationshipType, type PersonName, formatName } from '../types';
import { generateBio } from '../services/geminiService';
import { parseDateString, formatDateObject, sortByBirthDate } from '../utils/dateUtils';
import PersonSearch from './PersonSearch';

const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>;
const ActionButtonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>;
const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM9 2a1 1 0 011 1v1h1a1 1 0 110 2H10v1a1 1 0 11-2 0V6H7a1 1 0 010-2h1V3a1 1 0 011-1zm5 4a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V7a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TreeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><path d="M12 12V8" /></svg>;
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;

interface MemberDetailsModalProps {
  person: Person;
  people: People;
  onClose: () => void;
  onUpdate: (personId: string, data: Partial<Person>) => void;
  onAdd: (parentId: string, relationship: RelationshipType, data: Omit<Person, 'id' | 'fatherId' | 'motherId' | 'spouseId'>) => void;
  onAddParents: (personId: string) => void;
  onAddBirthParents: (personId: string) => void;
  onDelete: (personId: string) => void;
  onSetRoot: (personId: string) => void;
  onSetHome: (personId: string) => void;
  onDivorce: (personId: string) => void;
  onReplaceSpouse: (personId: string, newSpouseData: Omit<Person, 'id' | 'fatherId' | 'motherId' | 'spouseId'>) => void;
  currentRootId: string;
  homePersonId: string;
}

const DetailRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    value ? <div className="flex items-center py-1"><span className="font-semibold text-gray-500 w-28 inline-block shrink-0">{label}:</span> <span className="text-gray-700">{value}</span></div> : null
);

const EditableNameField: React.FC<{
    person: Person,
    onSave: (newName: PersonName) => void,
    isEditing: boolean,
    onSetEditing: (isEditing: boolean) => void,
}> = ({person, onSave, isEditing, onSetEditing}) => {
    const [currentName, setCurrentName] = useState(person.name);

    useEffect(() => {
        if (!isEditing) {
            setCurrentName(person.name);
        }
    }, [person.name, isEditing]);

    const handleSave = () => {
        onSave(currentName);
        onSetEditing(false);
    };

    const handleCancel = () => {
        onSetEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-2 my-2 p-2 border border-blue-300 rounded-md">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                    <input
                        type="text"
                        placeholder="First"
                        value={currentName.first}
                        onChange={(e) => setCurrentName(p => ({...p, first: e.target.value}))}
                        className="flex-1 min-w-0 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
                        autoFocus
                    />
                     <input
                        type="text"
                        placeholder="Middle"
                        value={currentName.middle || ''}
                        onChange={(e) => setCurrentName(p => ({...p, middle: e.target.value || undefined}))}
                        className="flex-1 min-w-0 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Surname"
                        value={currentName.surname}
                        onChange={(e) => setCurrentName(p => ({...p, surname: e.target.value}))}
                        className="flex-1 min-w-0 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <button onClick={handleSave} className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">Save</button>
                    <button onClick={handleCancel} className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300 transition-colors">Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center group my-1 py-2">
             <h2 className="text-2xl font-bold text-gray-900">{formatName(person)}</h2>
            <button onClick={() => onSetEditing(true)} className="ml-3 opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity">
                <PencilIcon />
            </button>
        </div>
    );
};

const UpDownButton: React.FC<{onUp: () => void, onDown: () => void}> = ({ onUp, onDown }) => (
    <div className="flex flex-col items-center justify-center ml-1 space-y-0.5">
        <button onClick={onUp} className="w-6 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-sm transition-colors" aria-label="Increase value">
            <ChevronUpIcon />
        </button>
        <button onClick={onDown} className="w-6 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-sm transition-colors" aria-label="Decrease value">
            <ChevronDownIcon />
        </button>
    </div>
);

const DateInputControl: React.FC<{
    date: { day: number; month: number; year: number } | null;
    onChange: (date: { day: number; month: number; year: number } | null) => void;
}> = ({ date, onChange }) => {
    const changeDatePart = (part: 'day' | 'month' | 'year', delta: number) => {
        const current = date || { year: new Date().getFullYear() - 30, month: 0, day: 1 };
        const calculationYear = current.year > 0 ? current.year : new Date().getFullYear() - 30;

        let finalDate: Date;

        if (part === 'month') {
            // For month changes, we clamp the day, not roll it over.
            const d = new Date(calculationYear, current.month, 1);
            d.setMonth(d.getMonth() + delta);
            
            const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            const clampedDay = Math.min(current.day, daysInTargetMonth);
            
            finalDate = new Date(d.getFullYear(), d.getMonth(), clampedDay);
        } else if (part === 'year') {
            // For year changes, we also clamp the day to handle leap years correctly.
            const newYear = calculationYear + delta;
            const daysInMonth = new Date(newYear, current.month + 1, 0).getDate();
            const clampedDay = Math.min(current.day, daysInMonth);
            finalDate = new Date(newYear, current.month, clampedDay);
        }
        else { // 'day'
            // For day changes, standard rollover is correct and expected.
            const d = new Date(calculationYear, current.month, current.day);
            d.setDate(d.getDate() + delta);
            finalDate = d;
        }
        
        onChange({ day: finalDate.getDate(), month: finalDate.getMonth(), year: finalDate.getFullYear() });
    };
    
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const yearStr = e.target.value.replace(/[^0-9]/g, '');
        if (yearStr.length > 4) return;

        const current = date || { day: 1, month: 0, year: 0 };

        if (yearStr === '') {
            onChange({ ...current, year: 0 });
            return;
        }

        const newYear = parseInt(yearStr, 10);

        if (isNaN(newYear)) {
            return; // Should not happen with regex, but good practice
        }
        
        // Clamp day to handle leap years correctly (e.g., changing from Feb 29 2020 to 2021)
        const daysInMonth = new Date(newYear, current.month + 1, 0).getDate();
        const clampedDay = Math.min(current.day, daysInMonth);

        onChange({ day: clampedDay, month: current.month, year: newYear });
    };

    const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    return (
        <div className="flex items-center w-full">
            <div className="flex-grow flex items-center justify-start sm:justify-around bg-gray-50 rounded-md p-1 space-x-2 sm:space-x-4 border border-gray-200">
                <div className="flex items-center">
                    <span className="text-lg font-mono w-8 text-center">{date ? String(date.day).padStart(2, '0') : '--'}</span>
                    <UpDownButton onUp={() => changeDatePart('day', 1)} onDown={() => changeDatePart('day', -1)} />
                </div>
                <div className="flex items-center">
                    <span className="text-lg font-mono w-12 text-center">{date ? MONTHS[date.month] : '---'}</span>
                    <UpDownButton onUp={() => changeDatePart('month', 1)} onDown={() => changeDatePart('month', -1)} />
                </div>
                <div className="flex items-center">
                     <input
                        type="text"
                        value={date && date.year > 0 ? date.year : ''}
                        onChange={handleYearChange}
                        placeholder="YYYY"
                        maxLength={4}
                        className="text-lg font-mono w-16 text-center bg-gray-100 rounded-sm outline-none focus:ring-2 focus:ring-blue-400 p-0"
                    />
                    <UpDownButton onUp={() => changeDatePart('year', 1)} onDown={() => changeDatePart('year', -1)} />
                </div>
            </div>
            {date && (
                 <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
                    title="Clear date"
                >
                    <XCircleIcon />
                </button>
            )}
        </div>
    );
};

const EditableDate: React.FC<{
    label: string;
    value: string | undefined;
    onSave: (newValue: string) => void;
    placeholder: string;
    isEditing: boolean;
    onSetEditing: (isEditing: boolean) => void;
}> = ({ label, value, onSave, placeholder, isEditing, onSetEditing }) => {
    const [date, setDate] = useState(() => parseDateString(value));

    useEffect(() => {
        if (!isEditing) {
            setDate(parseDateString(value));
        }
    }, [value, isEditing]);

    const handleSave = () => {
        onSave(date && date.year > 0 ? formatDateObject(date) : '');
        onSetEditing(false);
    };
    
    const handleCancel = () => {
        onSetEditing(false);
    }

    if (isEditing) {
        return (
            <div className="flex items-center space-x-2 my-2 p-2 border border-blue-300 rounded-lg bg-white">
                <label className="font-semibold text-gray-500 w-20 shrink-0">{label}:</label>
                <DateInputControl date={date} onChange={setDate} />
                <button onClick={handleSave} className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors">Save</button>
                <button onClick={handleCancel} className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300 transition-colors">Cancel</button>
            </div>
        );
    }
    
    return (
        <div className="flex items-center group my-1 py-1">
             <p className="text-gray-800"><span className="font-semibold text-gray-600 w-20 inline-block">{label}:</span> {value?.trim() || <span className="text-gray-400 italic">{placeholder}</span>}</p>
            <button onClick={() => {
                if (!date) {
                    const d = new Date();
                    setDate({day: d.getDate(), month: d.getMonth(), year: d.getFullYear() - 30 });
                }
                onSetEditing(true)
            }} className="ml-3 opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity">
                <PencilIcon />
            </button>
        </div>
    );
};

const ConfirmDeleteDialog: React.FC<{
  personName: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ personName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center" onClick={onCancel} aria-modal="true" role="dialog" aria-labelledby="delete-confirm-title">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-bold text-gray-900" id="delete-confirm-title">
                    Delete {personName}
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete this person? This action cannot be undone. It will permanently remove them and update all related family connections.
                    </p>
                </div>
            </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onCancel}
          >
            No, Cancel
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const RelatedPersonLinks: React.FC<{
    people: Person[];
    onNav: (person: Person) => void;
    emptyText: string;
    separator?: string;
}> = ({ people, onNav, emptyText, separator = ', ' }) => {
    if (people.length === 0) {
        return <span className="text-gray-500">{emptyText}</span>;
    }
    return (
        <>
            {people.map((p, i) => (
                <React.Fragment key={p.id}>
                    <button
                        onClick={() => onNav(p)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                    >
                        {formatName(p)}
                    </button>
                    {i < people.length - 1 && separator}
                </React.Fragment>
            ))}
        </>
    );
};


export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({ person, people, onClose, onUpdate, onAdd, onAddParents, onAddBirthParents, onDelete, onSetRoot, onSetHome, onDivorce, onReplaceSpouse, currentRootId, homePersonId }) => {
    const [bio, setBio] = useState(person.bio || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [isDeceased, setIsDeceased] = useState(!!person.deathDate);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isSpouseRelationshipOpen, setIsSpouseRelationshipOpen] = useState(false);
    const [isBioOpen, setIsBioOpen] = useState(false);

    useEffect(() => {
        // This effect resets the modal's UI state ONLY when the person ID changes.
        // This prevents UI state from resetting during edits on the same person.
        setEditingField(null);
        setIsConfirmingDelete(false);

        // Reset collapsible sections to always be closed for a new person.
        setIsSpouseRelationshipOpen(false);
        setIsBioOpen(false);
    }, [person.id]);

    useEffect(() => {
        // This effect syncs local state that is derived from the person prop.
        // It runs whenever these specific properties change, even during an edit.
        setBio(person.bio || '');
        setIsDeceased(!!person.deathDate);
    }, [person.bio, person.deathDate]);

    const handleAddDefaultPerson = (relationship: 'child' | 'sibling' | 'spouse') => {
        const defaultData = { name: { first: 'Unknown', surname: '' } };
        if (relationship === 'spouse') {
            const currentSpouse = person.spouseId ? people[person.spouseId] : null;

            if (currentSpouse) {
                onReplaceSpouse(person.id, defaultData);
            } else {
                onAdd(person.id, 'spouse', defaultData);
            }
        } else {
            onAdd(person.id, relationship, defaultData);
        }
        onClose();
    };

    const handleStatusChange = (newStatusIsDeceased: boolean) => {
        setIsDeceased(newStatusIsDeceased);
        if (newStatusIsDeceased) {
            if (!person.deathDate?.trim()) {
                onUpdate(person.id, { deathDate: ' ' });
            }
        } else {
            onUpdate(person.id, { deathDate: '' });
            if (editingField === 'deathDate') {
                setEditingField(null);
            }
        }
    };

    const handleDeathDateSave = (deathDate: string) => {
        const newDeathDate = deathDate.trim() ? deathDate : ' ';
        onUpdate(person.id, { deathDate: newDeathDate });
        setIsDeceased(true);
    };

    const handleGenerateBio = async () => {
        setIsGenerating(true);
        const generated = await generateBio(person, people);
        setBio(generated);
        onUpdate(person.id, { bio: generated });
        setIsGenerating(false);
    };
    
    const handleNav = (person: Person) => {
        onSetRoot(person.id);
        onClose();
    };

    // --- Family Member Calculations ---
    const spouse = person.spouseId ? people[person.spouseId] : null;
    const father = person.fatherId ? people[person.fatherId] : null;
    const mother = person.motherId ? people[person.motherId] : null;
    const legalParents = [father, mother].filter((p): p is Person => !!p);
    
    const birthFather = person.birthFatherId ? people[person.birthFatherId] : null;
    const birthMother = person.birthMotherId ? people[person.birthMotherId] : null;
    const birthParents = [birthFather, birthMother].filter((p): p is Person => !!p);

    const siblings = (person.fatherId && person.motherId)
        ? Object.values(people).filter(p => 
            p.id !== person.id && 
            p.fatherId === person.fatherId && 
            p.motherId === person.motherId
        ).sort(sortByBirthDate)
        : [];

    const children = Object.values(people)
        .filter(p => p.fatherId === person.id || p.motherId === person.id)
        .sort(sortByBirthDate);
        
    const formerSpouses = person.formerSpouseIds?.map(id => people[id]).filter((p): p is Person => !!p) || [];

    const isWidowed = spouse && !!spouse.deathDate;

    const actionButtonClass = "flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium whitespace-nowrap min-w-0";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start overflow-y-auto py-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 md:p-8 relative animate-fade-in-up m-4" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
                    <XMarkIcon />
                </button>
                
                <EditableNameField
                    person={person}
                    onSave={(newName) => onUpdate(person.id, { name: newName })}
                    isEditing={editingField === 'name'}
                    onSetEditing={(isEditing) => setEditingField(isEditing ? 'name' : null)}
                />
                
                <EditableDate
                  label="Born"
                  value={person.birthDate}
                  onSave={(birthDate) => onUpdate(person.id, { birthDate })}
                  placeholder="Set birth date"
                  isEditing={editingField === 'birthDate'}
                  onSetEditing={(isEditing) => setEditingField(isEditing ? 'birthDate' : null)}
                />
                
                <div className="flex items-center space-x-2 my-1 py-1">
                    <label className="font-semibold text-gray-600 w-20 inline-block shrink-0">Gender:</label>
                    <select
                        value={person.gender || ''}
                        onChange={(e) => onUpdate(person.id, { gender: e.target.value as 'male' | 'female' | undefined })}
                        className="p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 outline-none transition-all"
                    >
                        <option value="">Not Specified</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2 my-1 py-1">
                    <span className="font-semibold text-gray-600 w-20 inline-block shrink-0">Status</span>
                    <div role="radiogroup" aria-label="Life status" className="flex items-center rounded-lg p-1 bg-gray-200/60">
                        <button
                            role="radio"
                            aria-checked={!isDeceased}
                            onClick={() => handleStatusChange(false)}
                            className={`px-4 py-1 text-sm rounded-md transition-colors font-medium ${!isDeceased ? 'bg-white shadow-sm text-gray-800' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Alive
                        </button>
                        <button
                            role="radio"
                            aria-checked={isDeceased}
                            onClick={() => handleStatusChange(true)}
                            className={`px-4 py-1 text-sm rounded-md transition-colors font-medium ${isDeceased ? 'bg-white shadow-sm text-gray-800' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Deceased
                        </button>
                    </div>
                </div>
                
                <div className={isDeceased ? '' : 'hidden'}>
                    <EditableDate
                      label="Died"
                      value={person.deathDate}
                      onSave={handleDeathDateSave}
                      placeholder="Set death date"
                      isEditing={editingField === 'deathDate'}
                      onSetEditing={(isEditing) => setEditingField(isEditing ? 'deathDate' : null)}
                    />
                </div>

                <div className="mt-4 border-t pt-4">
                    <div className="p-1 -ml-1">
                        <h3 className="text-lg font-semibold text-gray-800">Immediate Family</h3>
                    </div>
                    <div id="family-details" className="mt-2">
                        <DetailRow label="Spouse" value={spouse ? <RelatedPersonLinks people={[spouse]} onNav={handleNav} emptyText="" /> : <span className="text-gray-500">None</span>} />
                        <DetailRow label="Parents" value={<RelatedPersonLinks people={legalParents} onNav={handleNav} emptyText="Unknown" />} />
                        <DetailRow label="Siblings" value={<RelatedPersonLinks people={siblings} onNav={handleNav} emptyText="None" />} />
                        <DetailRow label="Children" value={<RelatedPersonLinks people={children} onNav={handleNav} emptyText="None" />} />
                    </div>
                </div>
                
                <div className="mt-4 border-t pt-4">
                     <div className="flex items-center justify-between p-1 -ml-1 cursor-pointer" onClick={() => setIsSpouseRelationshipOpen(!isSpouseRelationshipOpen)}>
                        <h3 className="text-lg font-semibold text-gray-800">Spouse, Relationships &amp; Adoption</h3>
                        <button className="text-gray-500 hover:text-gray-800">{isSpouseRelationshipOpen ? <MinusIcon/> : <PlusIcon/>}</button>
                    </div>

                    {isSpouseRelationshipOpen && (
                        <div className="mt-2 space-y-2">
                             <DetailRow label="Status" value={
                                spouse ? (
                                    person.isSeparated ? 'Separated' : (isWidowed ? 'Widowed' : 'Married')
                                ) : (
                                    'Single'
                                )}
                            />
                            <DetailRow label="Former Spouses" value={<RelatedPersonLinks people={formerSpouses} onNav={handleNav} emptyText="None" />} />
                           
                           {spouse && (
                               <div className="flex flex-wrap gap-2 pt-2">
                                   <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={person.isSeparated || false}
                                            onChange={(e) => onUpdate(person.id, { isSeparated: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700">Mark as separated</span>
                                    </label>
                               </div>
                           )}

                           <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is-adopted-checkbox"
                                        checked={person.isAdopted || false}
                                        onChange={(e) => onUpdate(person.id, { isAdopted: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                                    />
                                    <label htmlFor="is-adopted-checkbox" className="text-gray-700">This person was adopted</label>
                                </div>
                                
                                {person.isAdopted && (
                                    <>
                                        <DetailRow label="Birth Parents" value={<RelatedPersonLinks people={birthParents} onNav={handleNav} emptyText="Unknown" />} />
                                        {!birthFather && !birthMother && (
                                            <button onClick={() => { onAddBirthParents(person.id); onClose(); }} className="text-sm text-blue-600 hover:underline">
                                                + Add Birth Parents
                                            </button>
                                        )}
                                    </>
                                )}
                           </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-2 mt-6">
                    <button onClick={() => handleAddDefaultPerson('child')} className={actionButtonClass}><ActionButtonIcon /> Add Child</button>
                    <button onClick={() => handleAddDefaultPerson('sibling')} className={actionButtonClass}><ActionButtonIcon /> Add Sibling</button>
                    {spouse ? (
                         <button onClick={() => handleAddDefaultPerson('spouse')} className={actionButtonClass}><ActionButtonIcon /> Replace Spouse</button>
                    ) : (
                        <button onClick={() => handleAddDefaultPerson('spouse')} className={actionButtonClass}><ActionButtonIcon /> Add Spouse</button>
                    )}
                    {!father && !mother && (
                        <button onClick={() => { onAddParents(person.id); onClose(); }} className={actionButtonClass}><ActionButtonIcon /> Add Parents</button>
                    )}
                </div>
                
                <div className="mt-6 border-t pt-4">
                    <div className="flex items-center justify-between p-1 -ml-1 cursor-pointer" onClick={() => setIsBioOpen(!isBioOpen)}>
                        <h3 className="text-lg font-semibold text-gray-800">Biography</h3>
                        <button className="text-gray-500 hover:text-gray-800">{isBioOpen ? <MinusIcon/> : <PlusIcon/>}</button>
                    </div>
                     {isBioOpen && (
                        <div className="mt-2">
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                onBlur={() => onUpdate(person.id, { bio })}
                                placeholder="No biography available. You can write one here or generate one."
                                className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 outline-none transition-all text-gray-700"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleGenerateBio}
                                    disabled={isGenerating}
                                    className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-amber-300 transition-colors"
                                >
                                    <SparklesIcon />
                                    {isGenerating ? 'Generating...' : 'Generate Biography'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSetRoot(person.id)}
                            disabled={person.id === currentRootId}
                            className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <TreeIcon /> Focus Tree Here
                        </button>
                         <button
                            onClick={() => onSetHome(person.id)}
                            disabled={person.id === homePersonId}
                            className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <HomeIcon /> Set as Home
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium order-first sm:order-none w-full sm:w-auto"
                    >
                        <CheckIcon /> OK
                    </button>

                    <button
                        onClick={() => setIsConfirmingDelete(true)}
                        className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        <TrashIcon /> Delete Person
                    </button>
                </div>

            </div>
            {isConfirmingDelete && (
                <ConfirmDeleteDialog
                    personName={formatName(person)}
                    onConfirm={() => {
                        onDelete(person.id);
                        setIsConfirmingDelete(false);
                    }}
                    onCancel={() => setIsConfirmingDelete(false)}
                />
            )}
        </div>
    );
};