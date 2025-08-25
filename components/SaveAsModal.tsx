import React from 'react';

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm-1 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V6zm3 0a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1V6z" clipRule="evenodd" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V13a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zM3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
);

const XMarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

interface SaveAsModalProps {
  onSaveAs: (format: 'json' | 'ged') => void;
  onClose: () => void;
}

const SaveAsModal: React.FC<SaveAsModalProps> = ({ onSaveAs, onClose }) => {
    const optionButtonClass = "w-full text-left flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
    
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center" onClick={onClose} aria-modal="true" role="dialog" aria-labelledby="save-as-title">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 id="save-as-title" className="text-xl font-bold text-gray-900">Save As...</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full -mr-1" aria-label="Close save options">
            <XMarkIcon />
          </button>
        </div>
        <div className="space-y-4">
          <button onClick={() => onSaveAs('json')} className={optionButtonClass}>
            <SaveIcon />
            <div>
              <p className="font-semibold text-gray-800">Project File</p>
              <p className="text-sm text-gray-500">Saves the entire tree structure. Editable. (.json)</p>
            </div>
          </button>
          
          <button onClick={() => onSaveAs('ged')} className={optionButtonClass}>
            <ExportIcon />
            <div>
              <p className="font-semibold text-gray-800">GEDCOM File</p>
              <p className="text-sm text-gray-500">Standard genealogy format for other software. (.ged)</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveAsModal;