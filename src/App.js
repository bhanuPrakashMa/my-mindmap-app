// import React, { useState, useEffect } from 'react';
// import MindMapContainer from './components/MindMapContainer';
// import MindMapList from './components/MindMapList';
// import './App.css';

// // A single source of truth for all mind map data
// const allMindMaps = [
//     {
//         id: 'map1',
//         title: 'Project Planning',
//         data: {
//             "name": "My Project",
//             "children": [
//                 {
//                     "name": "Phase 1: Research",
//                     "children": [
//                         { "name": "Competitor Analysis" },
//                         { "name": "Market Trends" },
//                         { "name": "User Interviews" }
//                     ]
//                 },
//                 {
//                     "name": "Phase 2: Design",
//                     "children": [
//                         { "name": "Wireframes" },
//                         { "name": "Mockups" },
//                         { "name": "Prototyping" }
//                     ]
//                 }
//             ]
//         }
//     },
//     {
//         id: 'map2',
//         title: 'Team Goals',
//         data: {
//             "name": "Team Goals",
//             "children": [
//                 { "name": "Q3 Targets" },
//                 {
//                     "name": "New Features",
//                     "children": [
//                         { "name": "Feature A" },
//                         { "name": "Feature B" }
//                     ]
//                 },
//                 { "name": "Growth Strategy" }
//             ]
//         }
//     },
//     {
//         id: 'map3',
//         title: 'Product Launch',
//         data: {
//             "name": "Product Launch",
//             "children": [
//                 { "name": "Marketing Plan" },
//                 { "name": "Release Schedule" },
//                 { "name": "Post-Launch Support" }
//             ]
//         }
//     }
// ];

// function App() {
//     const [selectedMapId, setSelectedMapId] = useState(allMindMaps[0].id);
//     const [selectedMapData, setSelectedMapData] = useState(allMindMaps[0].data);
//     const [mindMapKey, setMindMapKey] = useState(0); // A state variable to serve as a unique key

//     // Update the data whenever a new map is selected from the sidebar
//     useEffect(() => {
//         const newMap = allMindMaps.find(map => map.id === selectedMapId);
//         if (newMap) {
//             setSelectedMapData(newMap.data);
//             setMindMapKey(prevKey => prevKey + 1); // Increment the key to force re-mount
//         }
//     }, [selectedMapId]);

//     return (
//         <div className="App">
//             <h1 className="main-header">Dynamic Mind Map Viewer</h1>
//             <div className="main-content">
//                 <MindMapList
//                     mindMaps={allMindMaps}
//                     onSelect={setSelectedMapId}
//                     activeId={selectedMapId}
//                 />
//                 <div className="mindmap-view-container">
//                     <MindMapContainer
//                         data={selectedMapData}
//                         mindMapKey={mindMapKey} // Pass the key to the container
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import MindMapContainer from './components/MindMapContainer';
import MindMapList from './components/MindMapList';
import './App.css';

function App() {
    const [allMindMaps, setAllMindMaps] = useState([]);
    const [selectedMapId, setSelectedMapId] = useState(null);
    const [selectedMapData, setSelectedMapData] = useState(null);
    const [mindMapKey, setMindMapKey] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadMindMaps = async () => {
        setLoading(true);
        try {
            // Make a fetch call to the Node.js backend
            const response = await fetch('http://localhost:5000/api/mindmaps');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            
            setAllMindMaps(data);
            if (data.length > 0) {
                setSelectedMapId(data[0].id);
                setSelectedMapData(data[0].data);
            }
        } catch (error) {
            console.error("Failed to fetch mind maps:", error);
            // Handle error, e.g., display an error message to the user
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMindMaps();
    }, []);

    useEffect(() => {
        const newMap = allMindMaps.find(map => map.id === selectedMapId);
        if (newMap) {
            setSelectedMapData(newMap.data);
            setMindMapKey(prevKey => prevKey + 1);
        }
    }, [selectedMapId, allMindMaps]);

    return (
        <div className="App">
            <h1 className="main-header"> Production Equipment Engieering </h1>
            <div className="main-content">
                {loading ? (
                    <div className="loading-state">
                        <p>Loading mind maps...</p>
                    </div>
                ) : (
                    <>
                        <MindMapList
                            mindMaps={allMindMaps}
                            onSelect={setSelectedMapId}
                            activeId={selectedMapId}
                        /> 
                        <div className="mindmap-view-container">
                            <MindMapContainer
                                data={selectedMapData}
                                mindMapKey={mindMapKey}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
