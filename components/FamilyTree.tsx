import React, { useState, useRef, useEffect } from 'react';
import Tree from 'react-d3-tree';
import MemberNode from './MemberNode';
import { type NodeDatum, type Person, type People } from '../types';
import { type RawNodeDatum, type TreeLinkDatum } from 'react-d3-tree';


interface FamilyTreeProps {
  data: RawNodeDatum | null;
  onNodeClick: (person: Person) => void;
  viewMode: 'ancestors' | 'descendants';
  people: People;
  rootId: string;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({ data, onNodeClick, viewMode, people, rootId }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Use ResizeObserver for more reliable dimension tracking, ensuring
    // the centering is always accurate, especially on initial load.
    const observer = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      setDimensions({ width, height });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const pathClassFunc = (linkData: TreeLinkDatum): string => {
    const sourceNode = linkData.source.data as unknown as NodeDatum;
    const targetNode = linkData.target.data as unknown as NodeDatum;

    if (!sourceNode.__person || !targetNode.__person) {
      return 'rd3t-link';
    }
    
    const person1 = sourceNode.__person;
    const person2 = targetNode.__person;

    // The parent-child link can go either way depending on tree orientation.
    // Check if one is the adopted child of the other (as birth parent).
    const isP2AdoptedChildOfP1 = person2.isAdopted && (person2.birthFatherId === person1.id || person2.birthMotherId === person1.id);
    const isP1AdoptedChildOfP2 = person1.isAdopted && (person1.birthFatherId === person2.id || person1.birthMotherId === person2.id);

    if (isP1AdoptedChildOfP2 || isP2AdoptedChildOfP1) {
      return 'birth-parent-link';
    }

    return 'rd3t-link';
  };

  if (!data) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading family tree...</div>;
  }
  
  const isAncestors = viewMode === 'ancestors';

  // Center the root node in the middle of the container, both horizontally and vertically.
  const translate = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  };
  
  const orientation = 'vertical';
  const pathFunc = 'step';
  const scaleExtent = { min: 0.1, max: 2.5 };
  
  let nodeSize;
  let separation;
  const horizontalNodeSize = 150; // Adjusted for single-person nodes

  if (viewMode === 'descendants') {
    nodeSize = { x: horizontalNodeSize, y: 130 };
    separation = { siblings: 1, nonSiblings: 1 };
  } else {
    nodeSize = { x: horizontalNodeSize, y: 140 };
    separation = { siblings: 1, nonSiblings: 1 };
  }


  return (
    <div ref={containerRef} className="w-full h-full bg-gray-50/75 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]">
      {dimensions.width > 0 && (
         <div style={{
           width: '100%',
           height: '100%',
           transform: isAncestors ? 'scale(1, -1)' : 'none'
         }}>
          <Tree
              data={data}
              orientation={orientation}
              pathFunc={pathFunc}
              pathClassFunc={pathClassFunc}
              collapsible={true}
              initialDepth={3}
              translate={translate}
              nodeSize={nodeSize}
              separation={separation}
              scaleExtent={scaleExtent}
              renderCustomNodeElement={({ nodeDatum }) => (
                // We must counter-transform each node's content so it's not upside-down.
                <g transform={isAncestors ? 'scale(1, -1)' : 'none'}>
                  <MemberNode
                    nodeDatum={nodeDatum as unknown as NodeDatum}
                    onNodeClick={onNodeClick}
                    people={people}
                    rootId={rootId}
                    viewMode={viewMode}
                  />
                </g>
              )}
          />
        </div>
      )}
    </div>
  );
};

export default FamilyTree;