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
        
        const collapse = (d) => {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        };

        if (root.children) {
            root.children.forEach(collapse);
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

            nodeEnter.append("rect")
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("x", -110)
                .attr("y", -24)
                .attr("width", 220)
                .attr("height", 48)
                .style("fill", d => {
                    switch (d.depth) {
                        case 0: return "#f28e2c";
                        case 1: return "#e15759";
                        case 2: return "#76b7b2";
                        case 3: return "#4e79a7";
                        default: return "#bab0ac";
                    }
                })
                .style("stroke", "#000")
                .style("stroke-width", "1px")
                .attr("cursor", "pointer")
                .style("opacity", 1e-6);

            nodeEnter.append("text")
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(d => d.data.name)
                .style("fill-opacity", 1e-6);

            const nodeUpdate = nodeEnter.merge(node);
            nodeUpdate.transition().duration(duration).attr("transform", d => `translate(${d.y},${d.x})`);
            
            nodeUpdate.select("rect")
                .style("opacity", 1);
            
            nodeUpdate.select("text")
                .style("fill-opacity", 1)
                .style("font-size", "16px");

            const nodeExit = node.exit().transition().duration(duration).attr("transform", d => `translate(${source.y},${source.x})`).remove();
            
            nodeExit.select("rect").style("opacity", 1e-6);
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
