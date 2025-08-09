import React, { useState, useEffect } from 'react';
import MindMapContainer from './components/MindMapContainer';
import MindMapList from './components/MindMapList';
import './App.css';

// A single source of truth for all mind map data
const allMindMaps = [
    {
        id: 'map1',
        title: 'Project Planning',
        data: {
            "name": "My Project",
            "children": [
                {
                    "name": "Phase 1: Research",
                    "children": [
                        { "name": "Competitor Analysis" },
                        { "name": "Market Trends" },
                        { "name": "User Interviews" }
                    ]
                },
                {
                    "name": "Phase 2: Design",
                    "children": [
                        { "name": "Wireframes" },
                        { "name": "Mockups" },
                        { "name": "Prototyping" }
                    ]
                }
            ]
        }
    },
    {
        id: 'map2',
        title: 'Team Goals',
        data: {
            "name": "Team Goals",
            "children": [
                { "name": "Q3 Targets" },
                {
                    "name": "New Features",
                    "children": [
                        { "name": "Feature A" },
                        { "name": "Feature B" }
                    ]
                },
                { "name": "Growth Strategy" }
            ]
        }
    },
    {
        id: 'map3',
        title: 'Product Launch',
        data: {
            "name": "Product Launch",
            "children": [
                { "name": "Marketing Plan" },
                { "name": "Release Schedule" },
                { "name": "Post-Launch Support" }
            ]
        }
    }
];

function App() {
    const [selectedMapId, setSelectedMapId] = useState(allMindMaps[0].id);
    const [selectedMapData, setSelectedMapData] = useState(allMindMaps[0].data);
    const [mindMapKey, setMindMapKey] = useState(0); // A state variable to serve as a unique key

    // Update the data whenever a new map is selected from the sidebar
    useEffect(() => {
        const newMap = allMindMaps.find(map => map.id === selectedMapId);
        if (newMap) {
            setSelectedMapData(newMap.data);
            setMindMapKey(prevKey => prevKey + 1); // Increment the key to force re-mount
        }
    }, [selectedMapId]);

    return (
        <div className="App">
            <h1 className="main-header">Dynamic Mind Map Viewer</h1>
            <div className="main-content">
                <MindMapList
                    mindMaps={allMindMaps}
                    onSelect={setSelectedMapId}
                    activeId={selectedMapId}
                />
                <div className="mindmap-view-container">
                    <MindMapContainer
                        data={selectedMapData}
                        mindMapKey={mindMapKey} // Pass the key to the container
                    />
                </div>
            </div>
        </div>
    );
}

export default App;