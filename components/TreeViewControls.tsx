import React from 'react';
import PersonSearch from './PersonSearch';
import { type People } from '../types';
import RelationshipEstimator from './RelationshipEstimator';
import HistoryControls from './HistoryControls';

type ViewMode = 'ancestors' | 'descendants';

interface TreeViewControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  rootPersonName: string;
  people: People;
  onPersonSelect: (personId: string) => void;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const AncestorsIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 mr-1" viewBox="0 0 20 20">
        {/* Background/Left Person (Ancestor) - moved up */}
        <g fill="#f59e0b" transform="translate(0, -2)">
            <circle cx="7" cy="6.5" r="3" />
            <path d="M7 10.5c-3.3 0-5 2.2-5 5V17h10v-1.5C12 12.7 10.3 10.5 7 10.5z" />
        </g>
        {/* Foreground/Right Person */}
        <g fill="#6B7280">
            <circle cx="13" cy="6.5" r="3" />
            <path d="M13 10.5c-3.3 0-5 2.2-5 5V17h10v-1.5C18 12.7 16.3 10.5 13 10.5z" />
        </g>
    </svg>
);
const DescendantsIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 mr-1" viewBox="0 0 20 20">
        {/* Left Person - behind */}
        <g fill="#6B7280">
            <circle cx="7" cy="6.5" r="3" />
            <path d="M7 10.5c-3.3 0-5 2.2-5 5V17h10v-1.5C12 12.7 10.3 10.5 7 10.5z" />
        </g>
        {/* Right Person (Descendant) - moved down, to the right, and in front */}
        <g fill="#f59e0b" transform="translate(0, 2)">
            <circle cx="13" cy="6.5" r="3" />
            <path d="M13 10.5c-3.3 0-5 2.2-5 5V17h10v-1.5C18 12.7 16.3 10.5 13 10.5z" />
        </g>
    </svg>
);


const TreeViewControls: React.FC<TreeViewControlsProps> = ({ viewMode, setViewMode, rootPersonName, people, onPersonSelect, onBack, onForward, onHome, canGoBack, canGoForward }) => {
  const baseButtonClass = "flex-1 px-3 py-2 text-sm font-semibold rounded-md flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-amber-500";
  const activeButtonClass = "bg-white text-gray-800 shadow";
  const inactiveButtonClass = "bg-transparent text-gray-500 hover:bg-white/50 hover:text-gray-700";

  return (
    <div className="absolute top-4 left-4 z-10 flex items-start space-x-2" aria-label="Tree navigation controls">
      <div className="flex flex-col space-y-4 w-72">
        {/* Panel for tree view controls */}
        <div className="bg-gray-100/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 flex flex-col items-start gap-3" aria-labelledby="tree-view-heading">
          <div className="w-full">
              <div className="px-1">
                  <p id="tree-view-heading" className="text-xs text-gray-500">Showing tree for</p>
                  <p className="text-base font-bold text-gray-800 truncate" title={rootPersonName}>{rootPersonName}</p>
              </div>
          </div>
          <div role="radiogroup" className="flex items-center space-x-1 bg-gray-200/70 p-1 rounded-lg w-full">
            <button
              role="radio"
              aria-checked={viewMode === 'ancestors'}
              onClick={() => setViewMode('ancestors')}
              className={`${baseButtonClass} ${viewMode === 'ancestors' ? activeButtonClass : inactiveButtonClass}`}
            >
              <AncestorsIcon />
              Ancestors
            </button>
            <button
              role="radio"
              aria-checked={viewMode === 'descendants'}
              onClick={() => setViewMode('descendants')}
              className={`${baseButtonClass} ${viewMode === 'descendants' ? activeButtonClass : inactiveButtonClass}`}
            >
              <DescendantsIcon />
              Descendants
            </button>
          </div>
        </div>
        
        {/* Panel for person search - higher z-index to ensure dropdown is on top */}
        <div className="relative z-20 bg-gray-100/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 flex flex-col gap-1">
          <label htmlFor="focus-person-search" className="text-xs text-gray-500 px-1">Find & focus on person</label>
          <PersonSearch
              id="focus-person-search"
              people={people}
              onPersonSelect={(id) => id && onPersonSelect(id)}
              placeholder="Find a person..."
          />
        </div>

        {/* Panel for relationship estimator */}
        <RelationshipEstimator people={people} />
      </div>
      
      {/* History Controls Panel */}
      <div className="bg-gray-100/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-gray-200">
        <HistoryControls
          onBack={onBack}
          onForward={onForward}
          onHome={onHome}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
        />
      </div>
    </div>
  );
};

export default TreeViewControls;