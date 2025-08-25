

import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { type RawNodeDatum, type CustomNodeElementProps } from 'react-d3-tree';
import { calculateAge } from '../utils/dateUtils';

// Simplified to only show Clara and her parents.
const sampleTreeData: RawNodeDatum = {
  name: 'Clara Vance',
  attributes: { gender: 'female', birth: 'b. 1985' },
  children: [
    {
      name: 'Arthur Vance',
      attributes: { gender: 'male', birth: 'b. 1955' },
    },
    {
      name: 'Sofia Rossi',
      attributes: { gender: 'female', birth: 'b. 1957' },
    },
  ],
};

const LandingPageNode: React.FC<CustomNodeElementProps> = ({ nodeDatum }) => {
    const { name, attributes } = nodeDatum;
    const { gender, birth, death } = attributes as { gender?: 'male' | 'female', birth?: string, death?: string };

    const birthDate = birth?.replace('b. ', '');
    const deathDate = death?.replace('d. ', '');

    const age = calculateAge(birthDate, deathDate);
    const isDeceased = !!death;

    const genderStyles = {
        male: 'bg-blue-50 border-blue-400 group-hover:bg-blue-100',
        female: 'bg-rose-50 border-rose-400 group-hover:bg-rose-100',
    };

    const defaultStyle = 'bg-white border-gray-300 group-hover:bg-gray-100';

    const genderOrBaseStyle = gender ? genderStyles[gender] : defaultStyle;

    let deceasedStyle = '';
    if (isDeceased) {
        if (gender === 'male') {
            deceasedStyle = 'grayscale brightness-95';
        } else {
            deceasedStyle = 'grayscale';
        }
    }

    const cardClasses = [
        "relative rounded-md shadow-md px-2 pt-2 pb-5 w-[110px] transition-all duration-200 border",
        genderOrBaseStyle,
        deceasedStyle
    ].join(' ');

    return (
        <foreignObject width="160" height="120" x="-80" y="-60" overflow="visible" style={{ cursor: 'default' }}>
            <div className="w-full h-full flex items-center justify-center">
                <div className={`${cardClasses} group`}>
                     {age !== null && (
                        <div
                            className="absolute top-0 right-0 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-[10px] shadow-sm z-30"
                            style={{ transform: 'translate(50%, -50%)' }}
                            title={isDeceased ? `Age at death: ${age}` : `Age: ${age}`}
                        >
                            {age}
                        </div>
                    )}
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-800 truncate">{name}</p>
                        <div className="text-[10px] leading-tight text-gray-500 mt-0.5 h-7 flex flex-col justify-center items-center">
                            {(birth || death) ? (
                                <>
                                    <div>{birth || <>&nbsp;</>}</div>
                                    <div>{death || <>&nbsp;</>}</div>
                                </>
                            ) : (
                                <span className="italic">No dates</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </foreignObject>
    );
};

const AnimatedTree: React.FC = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            const { width, height } = container.getBoundingClientRect();
            setDimensions({ width, height });
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // This calculation centers the 2-level tree vertically. The tree is rendered
    // upside down to show ancestors, so we adjust the root's y-position.
    // The total link height for 2 levels is ~95px (1 level of links).
    // The correct y for the root is (containerHeight / 2) - (totalLinkHeight / 2).
    const translate = {
        x: dimensions.width / 2,
        y: dimensions.height / 2 - 47.5,
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
             {dimensions.width > 0 && (
                <div style={{ width: '100%', height: '100%', transform: 'scale(1, -1)' }}>
                    <Tree
                        data={sampleTreeData}
                        orientation="vertical"
                        pathFunc="step"
                        pathClassFunc={() => 'rd3t-link'}
                        translate={translate}
                        nodeSize={{ x: 150, y: 95 }}
                        separation={{ siblings: 1, nonSiblings: 1 }}
                        renderCustomNodeElement={(props) => (
                           <g transform="scale(1, -1)">
                                <LandingPageNode {...props} />
                           </g>
                        )}
                        zoomable={false}
                        draggable={false}
                        collapsible={false}
                        transitionDuration={0}
                        initialDepth={2}
                    />
                </div>
            )}
        </div>
    );
};

export default AnimatedTree;