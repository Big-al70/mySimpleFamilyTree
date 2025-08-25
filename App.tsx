import React, { useState, useCallback, useRef, useEffect } from 'react';
import FamilyTree from './components/FamilyTree';
import { MemberDetailsModal } from './components/MemberDetailsModal';
import { useFamilyTreeData } from './hooks/useFamilyTreeData';
import { type Person, RelationshipType, formatName } from './types';
import { parseGedcom, exportToGedcom } from './services/gedcomService';
import TreeViewControls from './components/TreeViewControls';
import ResearchAssistant from './components/ResearchAssistant';
import SaveAsModal from './components/SaveAsModal';
import LandingPage from './components/LandingPage';

const AppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-amber-500" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
        <circle cx="12" cy="4" r="2.5" fill="currentColor" stroke="none"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5V10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 10v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 10v4" />
        <circle cx="7" cy="16.5" r="2.5" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="16.5" r="2.5" fill="currentColor" stroke="none"/>
        <circle cx="17" cy="16.5" r="2.5" fill="currentColor" stroke="none"/>
    </svg>
);

const OpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
);

const ImportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const DocumentAddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
  </svg>
);


const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const EditableTreeName: React.FC<{ value: string; onSave: (newValue: string) => void }> = ({ value, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (currentValue.trim()) {
            onSave(currentValue.trim());
        } else {
            setCurrentValue(value); // revert if empty
        }
        setIsEditing(false);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="text-xl font-bold text-gray-800 bg-white p-1 rounded-md ring-2 ring-amber-500 outline-none w-auto"
                style={{minWidth: '250px'}}
                aria-label="Tree name"
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="group flex items-center gap-2 cursor-pointer hover:bg-gray-200/50 p-1 rounded-md transition-colors"
            title="Click to edit tree name"
        >
            <div className="text-xl font-bold text-gray-800">
                {value}
            </div>
            <span className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <PencilIcon />
            </span>
        </div>
    );
};

const QuestionMarkCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ConfirmNewTreeDialog: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center" onClick={onCancel} aria-modal="true" role="dialog" aria-labelledby="new-tree-confirm-title">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <QuestionMarkCircleIcon />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-bold text-gray-900" id="new-tree-confirm-title">
                    Create New Tree
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        Are you sure you want to create a new tree? Any unsaved changes to the current tree will be lost.
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
            Cancel
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            Create New
          </button>
        </div>
      </div>
    </div>
  );
};


function App() {
  const { people, tree, updatePerson, addPerson, addParents, addBirthParents, deletePerson, loadPeople, rootId, setRootId, viewMode, setViewMode, treeName, setTreeName, resetTree, goBack, goForward, canGoBack, canGoForward, homePersonId, setHomePersonId, goToHome, divorce, replaceSpouse } = useFamilyTreeData();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [newlyAddedChildId, setNewlyAddedChildId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmingNew, setIsConfirmingNew] = useState(false);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [isAppStarted, setIsAppStarted] = useState(false);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const gedcomFileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedPerson = selectedPersonId ? people[selectedPersonId] : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Update document title when the tree name changes for better UX and SEO
  useEffect(() => {
    if (isAppStarted && treeName) {
      document.title = `${treeName} | My Simple Family Tree`;
    } else {
      document.title = 'My Simple Family Tree | Free, Online Genealogy Software';
    }
  }, [treeName, isAppStarted]);

  const handleNodeClick = useCallback((person: Person) => {
    setSelectedPersonId(person.id);
  }, []);

  const handleCloseModal = () => {
    setSelectedPersonId(null);
  };
  
  const handleUpdate = useCallback((personId: string, data: Partial<Person>) => {
      updatePerson(personId, data);
  }, [updatePerson]);

  const handleAdd = useCallback((parentId: string, relationship: RelationshipType, data: Omit<Person, 'id' | 'fatherId' | 'motherId' | 'spouseId'>) => {
    const newId = addPerson(parentId, relationship, data);
    if (relationship === 'child') {
      setNewlyAddedChildId(newId);
    }
    handleCloseModal();
  }, [addPerson]);
  
  const handleDelete = useCallback((personId: string) => {
      deletePerson(personId);
      handleCloseModal();
  }, [deletePerson]);

  useEffect(() => {
    if (newlyAddedChildId && people[newlyAddedChildId]) {
      setRootId(newlyAddedChildId);
      setNewlyAddedChildId(null);
    }
  }, [newlyAddedChildId, people, setRootId]);

  const handleSetRoot = useCallback((personId: string) => {
    setRootId(personId);
    handleCloseModal();
  }, [setRootId]);

  const handleConfirmNewTree = () => {
    resetTree();
    setIsConfirmingNew(false);
  };

  const handleOpenProjectClick = () => {
    setIsMenuOpen(false);
    projectFileInputRef.current?.click();
  };

  const handleProjectFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const data = JSON.parse(content);
        if (data && data.people && data.rootId) {
            loadPeople(data.people, data.rootId, data.treeName);
            setSelectedPersonId(null);
            alert(`Successfully opened: ${file.name}`);
        } else {
            throw new Error("Invalid project JSON file format.");
        }
      } catch (error) {
        console.error("Failed to open file:", error);
        alert(`Error opening file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.onerror = () => {
        alert("Failed to read the file.");
    };
    reader.readAsText(file);
    event.target.value = '';
  };


  const handleImportGedcomClick = () => {
    gedcomFileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  const handleGedcomFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const { people: newPeople, rootId: newRootId } = parseGedcom(content);
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const newTreeName = fileNameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ').trim();
        loadPeople(newPeople, newRootId, newTreeName || 'Imported Tree');
        setSelectedPersonId(null);
        alert(`Successfully imported GEDCOM with ${Object.keys(newPeople).length} individuals!`);
      } catch (error) {
        console.error("Failed to parse file:", error);
        alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.onerror = () => {
        alert("Failed to read the file.");
    };
    reader.readAsText(file);

    event.target.value = '';
  };
  
  const saveFile = async (blob: Blob, fileName: string) => {
    const fallbackSave = () => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // Use the File System Access API if available, with a fallback.
    // This provides a modern save dialog in supported browsers like Chrome.
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        // This catch block handles errors, including the user canceling the dialog (AbortError)
        // or security restrictions in sandboxed environments (like cross-origin iframes).
        console.error('Failed to save file:', err);
        // If the user cancels, it's an AbortError, and we shouldn't do anything.
        // For other errors, we fall back to the old download method.
        if ((err as Error).name !== 'AbortError') {
          fallbackSave();
        }
      }
    } else {
      fallbackSave();
    }
  };

  const handleSaveAs = async (format: 'json' | 'ged') => {
      setIsSaveAsModalOpen(false);
      setIsMenuOpen(false);

      if (Object.keys(people).length === 0) {
        alert("Cannot save: the tree is empty.");
        return;
      }

      const safeTreeName = treeName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      
      let blob: Blob;
      let fileName: string;

      if (format === 'json') {
          const saveData = { treeName, people, rootId };
          const jsonString = JSON.stringify(saveData, null, 2);
          blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
          fileName = `${safeTreeName}_tree.json`;
      } else if (format === 'ged') {
          const gedcomContent = exportToGedcom(people);
          blob = new Blob([gedcomContent], { type: 'text/plain;charset=utf-8' });
          fileName = `${safeTreeName}_tree.ged`;
      } else {
          // Should not happen, but good to handle.
          return;
      }
      
      await saveFile(blob, fileName);
  };

  const rootPerson = people[rootId];

  if (!isAppStarted) {
    return <LandingPage onStart={() => setIsAppStarted(true)} />;
  }

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col antialiased overflow-hidden">
       <header className="relative bg-white shadow-md z-30 p-4 flex justify-between items-center border-b">
            {/* Left Side: App Icon and Title */}
            <div className="flex-shrink-0 flex items-center">
                <AppIcon />
                <h1 className="text-xl font-bold text-gray-800 -ml-1 hidden md:block">
                    <span className="text-amber-500">My Simple</span> Family Tree
                </h1>
            </div>

            {/* Center: Editable Tree Name */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <EditableTreeName value={treeName} onSave={setTreeName} />
            </div>

            {/* Right Side: Search and Actions */}
            <div className="flex-shrink-0 flex items-center">
                {/* File Operations Menu */}
                <div ref={menuRef} className="relative">
                    <button
                        onClick={() => setIsMenuOpen(prev => !prev)}
                        className="p-2 rounded-full text-orange-500 hover:bg-orange-100 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        aria-label="File menu"
                        aria-haspopup="true"
                        aria-expanded={isMenuOpen}
                    >
                        <HamburgerIcon />
                    </button>
                    {isMenuOpen && (
                        <div 
                            className="absolute right-0 mt-2 w-64 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                            role="menu" 
                            aria-orientation="vertical" 
                            aria-labelledby="menu-button"
                        >
                             <div className="py-1" role="none">
                                <button onClick={() => { setIsConfirmingNew(true); setIsMenuOpen(false); }} className="w-full text-left text-gray-700 block px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100" role="menuitem">
                                    <DocumentAddIcon />
                                    <span>New Tree</span>
                                </button>
                            </div>
                            <div className="border-t border-gray-100"></div>
                            <div className="py-1" role="none">
                                <button onClick={handleOpenProjectClick} className="w-full text-left text-gray-700 block px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100" role="menuitem">
                                    <OpenIcon />
                                    <span>Open Project (.json)</span>
                                </button>
                                <button onClick={() => { setIsSaveAsModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left text-gray-700 block px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100" role="menuitem">
                                    <SaveIcon />
                                    <span>Save As...</span>
                                </button>
                                <button onClick={handleImportGedcomClick} className="w-full text-left text-gray-700 block px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100" role="menuitem">
                                    <ImportIcon />
                                    <span>Import GEDCOM (.ged)</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
      <main className="flex-grow relative">
        <TreeViewControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            rootPersonName={rootPerson ? formatName(rootPerson) : '...'}
            people={people}
            onPersonSelect={setRootId}
            onBack={goBack}
            onForward={goForward}
            onHome={goToHome}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
        />
        <ResearchAssistant person={rootPerson} />
        <input 
            type="file" 
            ref={gedcomFileInputRef} 
            onChange={handleGedcomFileChange}
            className="hidden" 
            accept=".ged,.gedcom"
        />
        <input
            type="file"
            ref={projectFileInputRef}
            onChange={handleProjectFileChange}
            className="hidden"
            accept=".json"
        />
        <FamilyTree
            key={rootId}
            data={tree} 
            onNodeClick={handleNodeClick} 
            viewMode={viewMode} 
            people={people} 
            rootId={rootId}
        />
      </main>
      {selectedPerson && (
        <MemberDetailsModal
          person={selectedPerson}
          people={people}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
          onAdd={handleAdd}
          onAddParents={addParents}
          onAddBirthParents={addBirthParents}
          onDelete={handleDelete}
          onSetRoot={handleSetRoot}
          onSetHome={setHomePersonId}
          currentRootId={rootId}
          homePersonId={homePersonId}
          onDivorce={divorce}
          onReplaceSpouse={replaceSpouse}
        />
      )}
      {isConfirmingNew && (
          <ConfirmNewTreeDialog
              onConfirm={handleConfirmNewTree}
              onCancel={() => setIsConfirmingNew(false)}
          />
      )}
      {isSaveAsModalOpen && (
        <SaveAsModal
            onClose={() => setIsSaveAsModalOpen(false)}
            onSaveAs={handleSaveAs}
        />
      )}
    </div>
  );
}

export default App;