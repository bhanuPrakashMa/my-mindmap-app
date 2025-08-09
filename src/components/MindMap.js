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

        // Add a defs section for the arrowhead marker
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 20) // Adjust the position of the arrow relative to the circle
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

        const initialScale = 0.8;
        const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale);
        svg.transition().duration(750).call(d3.zoom().transform, initialTransform);

        function update(source) {
            const treeData = treeRef.current(rootRef.current);
            const nodes = treeData.descendants();
            const links = treeData.links();
            nodes.forEach(d => d.y = d.depth * 180);

            const node = gRef.current.selectAll("g.node")
                .data(nodes, d => d.id || (d.id = ++i));

            const nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${source.y0},${source.x0})`)
                .on("click", (event, d) => handleClick(event, d));

            nodeEnter.each(function(d) {
                const nodeGroup = d3.select(this);
                if (d.depth === 0) { // Root node
                    nodeGroup.append("rect")
                        .attr("width", 30)
                        .attr("height", 30)
                        .attr("x", -10)
                        .attr("y", -10)
                        .style("fill", "red");
                } else if (d.children || d._children) { // Parent node
                    nodeGroup.append("path")
                        .attr("d", "M -10,10 L 0,-10 L 10,10 Z")
                        .attr("transform", "scale(1)") // Triangle path
                        .style("fill", "green");
                } else { // Leaf node (no children)
                    nodeGroup.append("circle")
                        .attr("r", 1e-6)
                        .style("fill", d => d._children ? "lightsteelblue" : "#fff");
                }
            });

            nodeEnter.append("text")
                .attr("x", d => d.children || d._children ? -13 : 13)
                .attr("dy", ".35em")
                .attr("text-anchor", d => d.children || d._children ? "end" : "start")
                .text(d => d.data.name)
                .style("fill-opacity", 1e-6)
                .style("font-size", d => d.depth === 0 ? "16px" : d.depth === 1 ? "14px" : "12px");

            const nodeUpdate = nodeEnter.merge(node);
            nodeUpdate.transition().duration(duration).attr("transform", d => `translate(${d.y},${d.x})`);
            
            nodeUpdate.each(function(d) {
                const nodeGroup = d3.select(this);
                if (d.depth === 0) {
                    nodeGroup.select("rect").attr("width", 20).attr("height", 20).attr("x", -10).attr("y", -10).attr("cursor", "pointer");
                } else if (d.children || d._children) {
                    nodeGroup.select("path").attr("d", "M -10,10 L 0,-10 L 10,10 Z").attr("transform", "scale(1)").attr("cursor", "pointer");
                } else {
                    nodeGroup.select("circle").attr("r", 10).attr("cursor", "pointer");
                }
                nodeGroup.select("text").style("fill-opacity", 1);
            });

            nodeUpdate.select("text").style("fill-opacity", 1);

            const nodeExit = node.exit().transition().duration(duration).attr("transform", d => `translate(${source.y},${source.x})`).remove();
            nodeExit.select("circle").attr("r", 1e-6);
            nodeExit.select("text").style("fill-opacity", 1e-6);

            const link = gRef.current.selectAll("path.link").data(links, d => d.target.id);

            const linkEnter = link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", d => {
                    const o = { x: source.x0, y: source.y0 };
                    return d3.linkHorizontal()({ source: o, target: o });
                })
                .attr("marker-end", "url(#arrowhead)"); // Add the arrowhead to the end of the link

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
                    .node circle, .node rect, .node path {
                        stroke: steelblue;
                        stroke-width: 3px;
                    }
                    .node text { font-size: 12px; }
                    .link { fill: none; stroke: #ccc; stroke-width: 2px; }
                    .details-box {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: rgba(255, 255, 255, 0.9);
                        border: 1px solid #ccc;
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        max-width: 300px;
                        text-align: left;
                    }
                    .details-box h3 { margin-top: 0; }
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
                    <p><strong>Name:</strong> {selectedNode.name}</p>
                </div>
            )}
        </div>
    );
};

export default MindMap;
