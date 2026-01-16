/**
 * Author: Sambath Kumar Natarajan
 */
"use client"

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, GitCommit, ShieldAlert, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";

interface Node {
    id: string;
    label: string;
    type: 'CLAIM' | 'ATTACK' | 'VERDICT' | 'ROOT';
    status?: string;
    reason?: string;
    details?: string; // Full content for inspection
    x: number;
    y: number;
}

interface Edge {
    source: string;
    target: string;
    label?: string;
}

interface KnowledgeGraphProps {
    data: any;
}

export function KnowledgeGraph({ data }: KnowledgeGraphProps) {
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Transform session data into a graph structure
    const { nodes, edges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Vertical Swimlane Constants
        const startX = 50;
        const startY = 100;
        const laneHeight = 80; // Height per claim row

        // Root Node (Top Left or separate)
        nodes.push({
            id: 'ROOT',
            label: 'Thesis Core',
            type: 'ROOT',
            details: "The central hypothesis extracted from your manuscript.",
            x: 80,
            y: 40
        });

        if (!data || !data.claims) return { nodes, edges };

        data.claims.forEach((claim: any, index: number) => {
            const rowY = startY + (index * laneHeight);
            const claimId = claim.id;

            // 1. Claim Node (Lane Start)
            const claimX = 100;
            nodes.push({
                id: claimId,
                label: `Claim ${index + 1}`,
                type: 'CLAIM',
                status: claim.status,
                details: claim.statement,
                x: claimX,
                y: rowY
            });

            edges.push({ source: 'ROOT', target: claimId });

            if (claim.governanceLog) {
                // Filter meaningful logs
                const relevantLogs = claim.governanceLog.filter((l: any) =>
                    l.role === 'THESIS_DESTROYER' || l.role === 'JOURNAL_REVIEWER_SIMULATOR'
                );

                relevantLogs.forEach((log: any, logIndex: number) => {
                    const stepX = claimX + 200 + (logIndex * 200);
                    const nodeId = `${claimId}-log-${logIndex}`;

                    let label = "";
                    let type: 'ATTACK' | 'VERDICT' = 'ATTACK';
                    let statusColor = "";

                    if (log.role === 'THESIS_DESTROYER') {
                        label = "ATTACK VECTOR";
                        type = 'ATTACK';
                    } else if (log.role === 'JOURNAL_REVIEWER_SIMULATOR') {
                        // Fix for Issue 3: Explicit Nuance
                        const verdict = claim.status === 'ACCEPTED' ? 'PASS'
                            : claim.status === 'REVISE' ? 'REVISE'
                                : 'REJECT';
                        label = `VERDICT: ${verdict}`;
                        type = 'VERDICT';
                    }

                    nodes.push({
                        id: nodeId,
                        label: label,
                        type: type,
                        details: log.content,
                        reason: (log.content || "").substring(0, 100) + "...",
                        x: stepX,
                        y: rowY
                    });

                    edges.push({ source: claimId, target: nodeId });
                    // Link previous node in chain if needed, but star topology from claim is cleaner here
                    // actually, a chain is better: Claim -> Attack -> Verdict
                    if (logIndex > 0) {
                        // Find previous log node
                        const prevNodeId = `${claimId}-log-${logIndex - 1}`;
                        edges.push({ source: prevNodeId, target: nodeId });
                    }
                });
            }
        });

        return { nodes, edges };
    }, [data]);

    return (
        <div className="flex gap-4 h-[500px]">
            {/* Graph View */}
            <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden relative shadow-inner">
                <svg className="w-full h-full" viewBox="0 0 800 600">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                        </marker>
                    </defs>
                    {edges.map((edge, i) => {
                        const source = nodes.find(n => n.id === edge.source);
                        const target = nodes.find(n => n.id === edge.target);
                        if (!source || !target) return null;

                        return (
                            <line
                                key={`edge-${i}`}
                                x1={source.x}
                                y1={source.y}
                                x2={target.x}
                                y2={target.y}
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                                className="animate-in fade-in duration-700"
                            />
                        );
                    })}

                    {nodes.map((node) => (
                        <g
                            key={node.id}
                            onClick={() => setSelectedNode(node)}
                            className="group cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={node.id === selectedNode?.id ? 22 : (node.type === 'ROOT' ? 20 : 15)}
                                fill={
                                    node.type === 'ROOT' ? '#18181b' :
                                        node.type === 'CLAIM' ? (node.status === 'ACCEPTED' ? '#15803d' : '#ca8a04') :
                                            node.type === 'VERDICT' ? '#b91c1c' :
                                                '#3f3f46'
                                }
                                stroke={node.id === selectedNode?.id ? "#3b82f6" : "#fff"}
                                strokeWidth={node.id === selectedNode?.id ? 4 : 2}
                                className="transition-all duration-300"
                            />
                            <text
                                x={node.x}
                                y={node.y + 35}
                                textAnchor="middle"
                                className={`text-[10px] font-mono uppercase font-bold transition-all ${node.id === selectedNode?.id ? "fill-blue-600 opacity-100" : "fill-zinc-400 opacity-0 group-hover:opacity-100"
                                    }`}
                            >
                                {node.label}
                            </text>
                        </g>
                    ))}
                </svg>

                <div className="absolute bottom-4 left-4 text-xs font-mono text-zinc-400 bg-white/50 p-2 rounded pointer-events-none">
                    CLICK NODES TO INSPECT
                </div>
            </div>

            {/* Inspector Panel */}
            <div className={`w-80 border-l border-zinc-200 bg-white p-0 transition-all duration-300 ${selectedNode ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-50'}`}>
                {selectedNode ? (
                    <Card className="h-full border-0 shadow-none rounded-none">
                        <CardHeader className="pb-2 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                                    {selectedNode.type === 'ROOT' && <GitCommit className="h-4 w-4" />}
                                    {selectedNode.type === 'CLAIM' && <AlertTriangle className="h-4 w-4" />}
                                    {selectedNode.type === 'ATTACK' && <ShieldAlert className="h-4 w-4" />}
                                    {selectedNode.type === 'VERDICT' && <CheckCircle2 className="h-4 w-4" />}
                                    Node Inspector
                                </CardTitle>
                                <button onClick={() => setSelectedNode(null)} className="text-zinc-400 hover:text-zinc-900">
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 h-[400px] overflow-y-auto">
                            <div>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase">ID</h4>
                                <Badge variant="outline" className="mt-1 font-mono text-xs">{selectedNode.id}</Badge>
                            </div>

                            {selectedNode.status && (
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase">Status</h4>
                                    <Badge className={`mt-1 ${selectedNode.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'}`}>
                                        {selectedNode.status}
                                    </Badge>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Content Payload</h4>
                                <div className="p-3 bg-zinc-50 rounded border border-zinc-100 text-xs font-serif text-zinc-800 whitespace-pre-wrap leading-relaxed">
                                    {selectedNode.details || selectedNode.label}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-400 text-xs font-mono text-center p-8">
                        Select a node from the topology to view cryptographic proof and agent logs.
                    </div>
                )}
            </div>
        </div>
    );
}
