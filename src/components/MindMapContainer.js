// import React, { useState } from 'react';
// import MindMap from './MindMap';
// import './MindMapContainer.css';

// const MindMapContainer = ({ data1, data2 }) => {
//     const [activeMap, setActiveMap] = useState('map1');

//     return (
//         <div className="mindmap-container">
//             <div className={`mindmap-wrapper ${activeMap === 'map1' ? 'active' : 'minimized'}`}>
//                 {activeMap === 'map1' && (
//                     <div className="mindmap-title">Mind Map 1</div>
//                 )}
//                 <MindMap data={data1} />
//                 {activeMap !== 'map1' && (
//                     <div className="overlay" onClick={() => setActiveMap('map1')}>
//                         <div className="overlay-text">Click to Maximize</div>
//                     </div>
//                 )}
//             </div>
            
//             <div className={`mindmap-wrapper ${activeMap === 'map2' ? 'active' : 'minimized'}`}>
//                 {activeMap === 'map2' && (
//                     <div className="mindmap-title">Mind Map 2</div>
//                 )}
//                 <MindMap data={data2} />
//                 {activeMap !== 'map2' && (
//                     <div className="overlay" onClick={() => setActiveMap('map2')}>
//                         <div className="overlay-text">Click to Maximize</div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default MindMapContainer;

import React from 'react';
import MindMap from './MindMap';
import './MindMapContainer.css';

const MindMapContainer = ({ data, mindMapKey }) => {
    return (
        <div className="mindmap-wrapper active">
            <MindMap key={mindMapKey} data={data} /> {/* Use the key here */}
        </div>
    );
};

export default MindMapContainer;