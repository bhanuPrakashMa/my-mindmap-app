import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MindMap = ({ data }) => {
    const svgRef = useRef();
    const gRef = useRef();
    const treeRef = useRef(d3.tree().size([800, 800 - 180]));
    const rootRef = useRef(null);
    const [currentRoot, setCurrentRoot] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    let i = 0;
    const duration = 750;

    useEffect(() => {
        if (!data || !data.name) {
            return;
        }

        setCurrentRoot(data);
        setSelectedNode(null);

        const margin = { top: 20, right: 90, bottom: 30, left: 90 };
        const width = 800 - margin.left - margin.right;
        const height = 800 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        svg.selectAll("*").remove();

        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 20)
            .attr("refY", 0)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .style("fill", "#ccc");

        gRef.current = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        const zoom = d3.zoom().scaleExtent([0.1, 8]).on("zoom", (event) => gRef.current.attr("transform", event.transform));
        svg.call(zoom);

        rootRef.current = d3.hierarchy(data, d => d.children);
        rootRef.current.x0 = height / 2;
        rootRef.current.y0 = 0;
        
        const collapse = (d) => {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        };

        if (rootRef.current.children) {
            rootRef.current.children.forEach(collapse);
        }

        update(rootRef.current);

        // const initialScale = 0.8;
        // const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale);
        // svg.transition().duration(750).call(d3.zoom().transform, initialTransform);

        const initialScale = 1; // A scale of 1 is a good starting point
        const svgWidth = width + margin.left + margin.right;
        const svgHeight = height + margin.top + margin.bottom;

        const initialTransform = d3.zoomIdentity
            .translate(svgWidth / 1, svgHeight / 3)
            .scale(initialScale);

        svg.call(zoom).transition().duration(750).call(zoom.transform, initialTransform);

        function update(source) {
            const treeData = treeRef.current(rootRef.current);
            const nodes = treeData.descendants();
            const links = treeData.links();
            nodes.forEach(d => d.y = d.depth * 180);

            const node = gRef.current.selectAll("g.node")
                .data(nodes, d => d.id || (d.id = ++i));

            // Enter new nodes at the source's previous position.
            const nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${source.y0},${source.x0})`)
                .on("click", (event, d) => handleClick(event, d));

            // Append a rectangle for the node box
            nodeEnter.append("rect")
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("x", -70)
                .attr("y", -15)
                .attr("width", 140)
                .attr("height", 30)
                .style("fill", d => {
                    // Assign different colors based on depth
                    switch (d.depth) {
                        case 0: return "#f28e2c"; // Orange for root
                        case 1: return "#e15759"; // Red for level 1
                        case 2: return "#76b7b2"; // Teal for level 2
                        case 3: return "#4e79a7"; // Blue for level 3
                        default: return "#bab0ac"; // Gray for other levels
                    }
                })
                .style("stroke", "#000")
                .style("stroke-width", "1px");

            // Append text for the node box
            nodeEnter.append("text")
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(d => d.data.name)
                .style("fill-opacity", 1e-6);

            // Update nodes to their new position.
            const nodeUpdate = nodeEnter.merge(node);
            nodeUpdate.transition().duration(duration).attr("transform", d => `translate(${d.y},${d.x})`);

            // Update styles for the rect and text
            nodeUpdate.select("rect")
                .attr("width", 140)
                .attr("height", 30)
                .attr("x", -70)
                .attr("y", -15)
                .attr("cursor", "pointer")
                .style("fill", d => {
                    switch (d.depth) {
                        case 0: return "#f28e2c";
                        case 1: return "#e15759";
                        case 2: return "#76b7b2";
                        case 3: return "#4e79a7";
                        default: return "#bab0ac";
                    }
                });
            
            nodeUpdate.select("text")
                .style("fill-opacity", 1)
                .style("font-size", "14px");

            // Exit removed nodes.
            const nodeExit = node.exit().transition().duration(duration).attr("transform", d => `translate(${source.y},${source.x})`).remove();
            
            nodeExit.select("rect").attr("width", 1e-4).attr("height", 1e-4);
            nodeExit.select("text").style("fill-opacity", 1e-6);

            const link = gRef.current.selectAll("path.link").data(links, d => d.target.id);

            const linkEnter = link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", d => {
                    const o = { x: source.x0, y: source.y0 };
                    return d3.linkHorizontal()({ source: o, target: o });
                })
                .attr("marker-end", "url(#arrowhead)");

            linkEnter.merge(link).transition().duration(duration)
                .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

            link.exit().transition().duration(duration)
                .attr("d", d => {
                    const o = { x: source.x, y: source.y };
                    return d3.linkHorizontal()({ source: o, target: o });
                })
                .remove();

            nodes.forEach(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }
        
        const handleClick = (event, d) => {
            event.stopPropagation();
            setSelectedNode(d.data);
            if (d.data !== currentRoot) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }
        };
    }, [data]);

    const handleGoBack = () => {
        if (!currentRoot || !data) return;
        const findParent = (node, targetData) => {
            if (!node || !node.children) return null;
            for (const child of node.children) {
                if (child.data === targetData) return node.data;
                const result = findParent(child, targetData);
                if (result) return result;
            }
            return null;
        };

        const parentNode = findParent(d3.hierarchy(data), currentRoot);
        if (parentNode) {
            setCurrentRoot(parentNode);
        } else {
            console.log("Already at the root node.");
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <style>
                {`
                    .node rect {
                        stroke: steelblue;
                        stroke-width: 1px;
                        transition: stroke-width 0.2s ease;
                    }
                    .node text { 
                        font-size: 12px;
                        fill: white;
                        pointer-events: none;
                        font-weight: bold;
                    }
                    .link { 
                        fill: none; 
                        stroke: #ccc; 
                        stroke-width: 2px;
                    }
                    .details-box {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: rgba(255, 255, 255, 0.9);
                        border: 1px solid #ccc;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        max-width: 450px;
                        text-align: left;
                    }
                    .details-box h3 { margin-top: 0; }
                    .details-box p { margin: 5px 0; }
                    .go-back-btn {
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        padding: 8px 12px;
                        cursor: pointer;
                        background-color: steelblue;
                        color: white;
                        border: none;
                        border-radius: 5px;
                    }
                `}
            </style>
            {currentRoot !== data && (
                <button className="go-back-btn" onClick={handleGoBack}>
                    Go Back
                </button>
            )}
            <svg ref={svgRef}></svg>
            {selectedNode && (
                <div className="details-box">
                    <h3>Node Details</h3>
                    {Object.keys(selectedNode).map((key) => {
                        // Check for null or undefined values, and skip the 'children' and 'name' keys
                        if (key !== 'children' && key !== 'name' && selectedNode[key] !== null && selectedNode[key] !== undefined) {
                            return (
                                <p key={key}>
                                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {selectedNode[key].toString()}
                                </p>
                            );
                        }
                        return null;
                    })}
                    <p><strong>Name:</strong> {selectedNode.name}</p>
                </div>
            )}
        </div>
    );
};

export default MindMap;