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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';

function App() {
    const [allMindMaps, setAllMindMaps] = useState([]);
    const [selectedMapId, setSelectedMapId] = useState(null);
    const [selectedMapData, setSelectedMapData] = useState(null);
    const [mindMapKey, setMindMapKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState('');

    // Function to fetch mind maps from the backend
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

    // Function to handle saving the mind map as a PDF
    const handleSave = async () => {
        setSaveMessage('Saving...');
        try {
            const mindMapElement = document.querySelector('.mindmap-view-container');
            if (!mindMapElement) {
                throw new Error("Mind map container element not found.");
            }

            // Use html2canvas to capture the content of the container
            const canvas = await html2canvas(mindMapElement, {
                useCORS: true,
                scale: 2,
            });

            // Get the image data from the canvas
            const imgData = canvas.toDataURL('image/png');

            // Create a new jsPDF instance, setting a landscape orientation
            const pdf = new jsPDF('landscape', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Add the image to the PDF
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Save the PDF file with a dynamic name
            pdf.save(`mindmap-${selectedMapId || 'untitled'}.pdf`);

            setSaveMessage('Solutions saved in PDF form.');
        } catch (error) {
            console.error("Failed to save PDF:", error);
            setSaveMessage('Failed to save the Solutions.');
        } finally {
            // Clear the message after a delay
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    // Load mind maps on initial component mount
    useEffect(() => {
        loadMindMaps();
    }, []);

    // Update the data whenever a new map is selected
    useEffect(() => {
        const newMap = allMindMaps.find(map => map.id === selectedMapId);
        if (newMap) {
            setSelectedMapData(newMap.data);
            setMindMapKey(prevKey => prevKey + 1); // Increment the key to force re-mount
        }
    }, [selectedMapId, allMindMaps]);

    return (
        <div className="App">
            <h1 className="main-header"> Production Equipment Engineering </h1>
            <div className='save-button-container'>
                <button className="save-button" onClick={handleSave}>Save as PDF</button>
                {saveMessage && <div className="save-message">{saveMessage}</div>}
            </div>
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
