import React from 'react';
import './MindMapList.css';

const MindMapList = ({ mindMaps, onSelect, activeId }) => {
    return (
        <div className="mindmap-list-sidebar">
            <h2 className="sidebar-header">Mind Maps</h2>
            <ul>
                {mindMaps.map(map => (
                    <li
                        key={map.id}
                        className={map.id === activeId ? 'active' : ''}
                        onClick={() => onSelect(map.id)}
                    >
                        {map.title}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MindMapList;