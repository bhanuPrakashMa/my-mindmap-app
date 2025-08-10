import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MindMap = ({ data }) => {
    const svgRef = useRef();
    const gRef = useRef();
    const [currentRoot, setCurrentRoot] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const containerRef = useRef();
    let i = 0;
    const duration = 750;

    useEffect(() => {
        if (!data || !data.name || !containerRef.current) {
            return;
        }

        setCurrentRoot(data);
        setSelectedNode(null);

        // Get container dimensions for a fluid layout
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        const margin = { top: 20, right: 90, bottom: 30, left: 90 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        const tree = d3.tree().size([height, width - 180]);

        const svg = d3.select(svgRef.current)
            .attr("width", containerWidth)
            .attr("height", containerHeight);

        svg.selectAll("*").remove();

        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 24)
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

        const root = d3.hierarchy(data, d => d.children);
        root.x0 = height / 2;
        root.y0 = 0;
        
        // On initialization, collapse all children of the root node
        if (root.children) {
            root._children = root.children;
            root.children = null;
        }
        
        update(root);

        const initialScale = 1;
        const svgWidth = width + margin.left + margin.right;
        const svgHeight = height + margin.top + margin.bottom;

        const initialTransform = d3.zoomIdentity
            .translate(svgWidth / 4, svgHeight / 3)
            .scale(initialScale);

        svg.call(zoom).transition().duration(duration).call(zoom.transform, initialTransform);

        function update(source) {
            const treeData = tree(root);
            const nodes = treeData.descendants();
            const links = treeData.links();
            nodes.forEach(d => d.y = d.depth * 260);

            const node = gRef.current.selectAll("g.node")
                .data(nodes, d => d.id || (d.id = ++i));

            const nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${source.y0},${source.x0})`)
                .on("click", (event, d) => handleClick(event, d));

            const cuboidSize = { width: 100, height: 60 };
            const parentNodeSize = { width: 120, height: 70 };
            const rootNodeSize = { width: 180, height: 100 };

            nodeEnter.append("g")
                .attr("class", "node-shape")
                .attr("transform", d => {
                    if (d.data === data) { // Root node
                        return `translate(${-rootNodeSize.width / 2}, ${-rootNodeSize.height / 2})`;
                    } else if (d.children || d._children) { // Parent node (has children or collapsed children)
                        return `translate(${-parentNodeSize.width / 2}, ${-parentNodeSize.height / 2})`;
                    } else { // Leaf node
                        return `translate(${-cuboidSize.width / 2}, ${-cuboidSize.height / 2})`;
                    }
                })
                .style("opacity", 1e-6)
                .each(function(d) {
                    const group = d3.select(this);

                    // Draw a large container/book for the root node
                    if (d.data === data) {
                        // Main body
                        group.append("path")
                            .attr("d", `M0 20 L0 100 L160 100 L160 20 Z`)
                            .style("fill", "#ce1414ff")
                            .style("stroke", "#ce1414ff")
                            .style("stroke-width", "1px");
                        // Top face
                        group.append("path")
                            .attr("d", `M0 20 L20 0 L180 0 L160 20 Z`)
                            .style("fill", "#e3d5d5ff")
                            .style("stroke", "#ce1414ff")
                            .style("stroke-width", "1px");
                        // Right face (spine)
                        group.append("path")
                            .attr("d", `M160 20 L180 0 L180 80 L160 100 Z`)
                            .style("fill", "#ce1414ff")
                            .style("stroke", "#ce1414ff")
                            .style("stroke-width", "1px");
                    } else if (d.children || d._children) {
                        // Parent nodes: single large book
                        // Main body (red)
                        group.append("path")
                            .attr("d", `M0 20 L0 70 L120 70 L120 20 Z`)
                            .style("fill", "#e74c3c")
                            .style("stroke", "#ce1414ff")
                            .style("stroke-width", "1px");
                        // Top face (pages)
                        group.append("path")
                            .attr("d", `M0 20 L15 0 L135 0 L120 20 Z`)
                            .style("fill", "#d41f1fff")
                            .style("stroke", "#ed2020ff")
                            .style("stroke-width", "1px");
                        // Right face (spine - darker red)
                        group.append("path")
                            .attr("d", `M120 20 L135 0 L135 50 L120 70 Z`)
                            .style("fill", "#dfd6d6ff")
                            .style("stroke", "#262424ff")
                            .style("stroke-width", "1px");
                    } else {
                        // Leaf nodes: cuboid
                        group.append("path")
                            .attr("d", `M0 20 L0 80 L100 80 L100 20 L0 20 Z`)
                            .style("fill", "#05393dff")
                            .style("stroke", "#05393dff")
                            .style("stroke-width", "1px");
                        group.append("path")
                            .attr("d", `M0 20 L20 0 L120 0 L100 20 Z`)
                            .style("fill", "#05393dff")
                            .style("stroke", "#05393dff")
                            .style("stroke-width", "1px");
                        group.append("path")
                            .attr("d", `M100 20 L120 0 L120 60 L100 80 Z`)
                            .style("fill", "#05393dff")
                            .style("stroke", "#05393dff")
                            .style("stroke-width", "1px");
                    }
                });
            
            // Append text and add two lines for ID and name
            nodeEnter.append("text")
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("fill-opacity", 1e-6)
                .attr("cursor", "pointer")
                .each(function(d) {
                    const name = d.data.name;
                    const truncatedName = name.length > 9 ? name.substring(0, 9) + '...' : name;

                    d3.select(this).append("tspan")
                        .attr("x", 0)
                        .attr("y", -8)
                        .style("font-size", "14px")
                        .text(`ID: ${d.data.id}`);
                    d3.select(this).append("tspan")
                        .attr("x", 0)
                        .attr("y", 8)
                        .style("font-size", "14px")
                        .text(truncatedName);
                });

            const nodeUpdate = nodeEnter.merge(node);
            nodeUpdate.transition().duration(duration).attr("transform", d => `translate(${d.y},${d.x})`);
            
            nodeUpdate.select(".node-shape")
                .style("opacity", 1);
            
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            const nodeExit = node.exit().transition().duration(duration).attr("transform", d => `translate(${source.y},${source.x})`).remove();
            
            nodeExit.select(".node-shape").style("opacity", 1e-6);
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
            
            if (d.children) {
                // Collapse the node
                d._children = d.children;
                d.children = null;
            } else {
                // Expand the node
                d.children = d._children;
                d._children = null;

                // New logic: If the expanded node is the root, collapse its children's children
                if (d.data === data && d.children) {
                    d.children.forEach(child => {
                        if (child.children) {
                            child._children = child.children;
                            child.children = null;
                        }
                    });
                }
            }
            update(d);
        };
    }, [data]);

    const handleGoBack = () => {
        if (!currentRoot || !data) return;
        const findParent = (node, targetData) => {
            if (node.data === targetData) return null;
            if (!node.children) return null;
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
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <style>
                {`
                    .node-shape {
                        cursor: pointer;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        user-select: none;
                    }
                    .node text { 
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
                    .details-box ul { list-style-type: none; padding: 0; margin: 0; }
                    .details-box li { padding: 5px 0; border-bottom: 1px solid #eee; }
                    .details-box li:last-child { border-bottom: none; }
                    .details-box strong { font-weight: bold; }
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
                    {selectedNode.attributes ? (
                        <ul>
                            {Object.entries(selectedNode.attributes).map(([key, value]) => (
                                <li key={key}><strong>{key}:</strong> {value}</li>
                            ))}
                        </ul>
                    ) : (
                        <p><strong>Name:</strong> {selectedNode.name}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MindMap;
