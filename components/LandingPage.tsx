import React, { useState } from 'react';
import AnimatedTree from './AnimatedTree';

// --- SVG Icon Components ---

const AppIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8 text-amber-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
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

const BuildTreeIcon = () => (
    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-amber-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    </div>
);

const AiBioIcon = () => (
    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-amber-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h.01M15 9h.01M18 9h.01M18 12h.01M18 15h.01M15 15h.01M12 15h.01" stroke="currentColor" strokeOpacity="0.5" />
            <path d="M14.5 3l-1.5 1.5l1.5 1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 8l-1.5 1.5l1.5 1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

const ImportExportIcon = () => (
    <div className="flex items-center justify-center h-16 w-16 mx-auto bg-amber-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
    </div>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const GedcomFileIcon = () => (
    <div className="w-16 h-20 bg-green-100 rounded-lg border-2 border-green-300 flex flex-col items-center justify-center p-2 text-green-700 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="font-bold text-xs mt-1">GED</span>
    </div>
);

const JsonFileIcon = () => (
    <div className="w-16 h-20 bg-blue-100 rounded-lg border-2 border-blue-300 flex flex-col items-center justify-center p-2 text-blue-700 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        <span className="font-bold text-xs mt-1">JSON</span>
    </div>
);

const ArrowIcon: React.FC<{ direction: 'right' | 'down'}> = ({ direction }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-gray-400 ${direction === 'down' ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
                aria-expanded={isOpen}
            >
                <h4 className="text-lg font-semibold text-gray-800">{question}</h4>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}
            >
                <div className="text-gray-600 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};


// --- Landing Page Component ---

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="bg-white text-gray-800 antialiased">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-200/80">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <AppIcon />
                        <span className="font-bold text-xl text-gray-800">
                            <span className="text-amber-500">My Simple</span> Family Tree
                        </span>
                    </div>
                    <button 
                        onClick={onStart} 
                        className="bg-amber-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                        Get Started
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="bg-gray-50 pt-32 pb-20">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900">
                                Discover Your Roots, <br />
                                <span className="text-amber-600">Tell Their Stories.</span>
                            </h1>
                            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                                Visually construct your family tree with our intuitive, easy-to-use genealogy builder. It's completely free—no sign-up required, no hidden costs. Start charting your ancestry today.
                            </p>
                            <button 
                                onClick={onStart} 
                                className="mt-8 bg-amber-500 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center"
                            >
                                Start Building Your Tree
                                <ArrowRightIcon />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Everything You Need to Chart Your Lineage</h2>
                            <p className="text-gray-600 mt-3 text-lg">A powerful and simple genealogy tool, right in your browser.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-center">
                                <BuildTreeIcon />
                                <h3 className="text-xl font-semibold mt-6 mb-2">Intuitive Tree Builder</h3>
                                <p className="text-gray-600 leading-relaxed">Easily add parents, children, spouses, and siblings with our simple visual editor. Watch your interactive family chart grow, making complex family histories easy to understand.</p>
                            </div>
                             {/* Feature 2 */}
                             <div className="flex flex-col items-center">
                                <ImportExportIcon />
                                <h3 className="text-xl font-semibold mt-6 mb-2">Import & Export GEDCOM</h3>
                                <p className="text-gray-600 leading-relaxed">Seamlessly import existing family trees with standard GEDCOM files. Export your work to share, print, or use in other genealogy software. Your data is always portable.</p>
                            </div>
                            {/* Feature 3 */}
                             <div className="flex flex-col items-center">
                                <AiBioIcon />
                                <h3 className="text-xl font-semibold mt-6 mb-2">AI-Powered Biographies</h3>
                                <p className="text-gray-600 leading-relaxed">Go beyond dates and names. With one click, generate concise, narrative-style summaries of a person's life based on the known facts in your family tree, perfect for sharing.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Intuitive Tree Builder Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col-reverse md:flex-row-reverse items-center gap-12">
                            <div className="md:w-1/2 h-72 md:h-80 relative">
                                <AnimatedTree />
                            </div>
                            <div className="md:w-1/2">
                                <span className="text-amber-600 font-semibold">INTUITIVE BUILDER</span>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Visually Map Your History</h2>
                                <p className="text-lg text-gray-600 mt-4">
                                    Our simple family tree maker allows you to add parents, children, spouses, and siblings with a few clicks. The interactive tree automatically adjusts, providing a clear and beautiful view of your family's structure as it grows.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Import & Export Section */}
                <section className="bg-gray-50 py-20">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/2">
                                <span className="text-amber-600 font-semibold">COMPATIBLE & PORTABLE</span>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Works With Your Tools</h2>
                                <p className="text-lg text-gray-600 mt-4">
                                    Start your tree from scratch or import a standard GEDCOM file from another genealogy service. When you're done, save your work as a project file for later editing, or export it back to GEDCOM to share with family or use in other software.
                                </p>
                            </div>
                            <div className="md:w-1/2 flex items-center justify-center p-8">
                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-gray-500">
                                    <div className="flex flex-col items-center text-center w-20">
                                        <GedcomFileIcon />
                                        <span className="text-sm font-semibold mt-2 text-gray-600">Import</span>
                                    </div>
                                    <ArrowIcon direction="right" />
                                    <AppIcon className="h-20 w-20 text-amber-500 shrink-0" />
                                    <ArrowIcon direction="right" />
                                    <div className="flex flex-col items-center">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center text-center w-20">
                                                <GedcomFileIcon />
                                            </div>
                                            <div className="flex flex-col items-center text-center w-20">
                                                <JsonFileIcon />
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold mt-2 text-gray-600">Export</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* AI Feature Spotlight */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/2">
                                <span className="text-amber-600 font-semibold">NARRATIVE BIOGRAPHIES</span>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Bring Your Ancestors to Life</h2>
                                <p className="text-lg text-gray-600 mt-4">Our research assistant can search the web for historical records or summarize known facts—like birth dates, family members, and key life events—into a concise, narrative-style biography. It strictly adheres to the provided information to create an accurate summary.</p>
                            </div>
                            <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-lg border">
                                <div className="flex items-center gap-3">
                                    <AppIcon className="h-10 w-10 text-amber-500" />
                                    <div>
                                        <h4 className="font-bold text-lg">Eleanor Peterson</h4>
                                        <p className="text-sm text-gray-500">b. 1925 - d. 2010</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200/80">
                                    "Eleanor Peterson was born in 1925 to Robert Peterson and Mary Johnson. She married James Vance and they had two children, Arthur and Evelyn. Eleanor passed away in 2010."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="text-gray-600 mt-3 text-lg">Answers to common questions about our free family tree maker.</p>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            <FAQItem question="Is this family tree builder really free?">
                                <p>Yes, absolutely. My Simple Family Tree is 100% free to use with all features enabled. There are no subscriptions, hidden costs, or premium versions. We believe everyone should have access to their family history.</p>
                            </FAQItem>
                             <FAQItem question="Do I need to create an account or sign up?">
                                <p>No sign-up is required. The application runs entirely in your web browser. Your family tree data is processed on your device, ensuring your privacy.</p>
                            </FAQItem>
                            <FAQItem question="Is my family data private and secure?">
                                <p>Yes. Your privacy is our top priority. All data you enter is stored and processed locally within your browser. It is never sent to our servers or any third party, giving you complete control over your information.</p>
                            </FAQItem>
                            <FAQItem question="Can I save my work and continue later?">
                                <p>Yes. You can save your entire tree as a project file (.json) to your computer. You can then open this file later in our application to continue exactly where you left off.</p>
                            </FAQItem>
                            <FAQItem question="What is a GEDCOM file and do you support it?">
                                <p>GEDCOM (.ged) is the universal file format for sharing genealogical data between different software programs. We fully support both importing GEDCOM files to start your tree and exporting your completed tree to a GEDCOM file for use elsewhere.</p>
                            </FAQItem>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-white py-20 text-center">
                    <div className="container mx-auto px-6">
                         <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Ready to Uncover Your Family's Past?</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
                            Start for free. No sign-up required. Your journey into your family's history begins now.
                        </p>
                        <button onClick={onStart} className="mt-8 bg-amber-500 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Create Your Family Tree
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-400 py-6 text-center">
                <div className="container mx-auto px-6 text-sm">
                    <p>&copy; {new Date().getFullYear()} My Simple Family Tree.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;