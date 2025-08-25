import React from 'react';

interface HistoryControlsProps {
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);


const HistoryControls: React.FC<HistoryControlsProps> = ({ onBack, onForward, onHome, canGoBack, canGoForward }) => {
    const baseButtonClass = "p-1.5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 flex items-center justify-center border";
    const enabledClass = "bg-white/60 hover:bg-white text-gray-700 border-gray-300/80";
    const disabledClass = "bg-gray-200/50 text-gray-400 cursor-not-allowed border-gray-300/50";

    return (
        <div className="flex space-x-1" aria-label="Tree history navigation">
            <button
                onClick={onHome}
                className={`${baseButtonClass} ${enabledClass}`}
                aria-label="Go to home person"
                title="Go home"
            >
                <HomeIcon />
            </button>
            <button
                onClick={onBack}
                disabled={!canGoBack}
                className={`${baseButtonClass} ${canGoBack ? enabledClass : disabledClass}`}
                aria-label="Go back to previous view"
                title="Go back"
            >
                <ChevronLeftIcon />
            </button>
            <button
                onClick={onForward}
                disabled={!canGoForward}
                className={`${baseButtonClass} ${canGoForward ? enabledClass : disabledClass}`}
                aria-label="Go forward to next view"
                title="Go forward"
            >
                <ChevronRightIcon />
            </button>
        </div>
    );
};

export default HistoryControls;
