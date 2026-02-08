import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

interface CustomJsonEditorProps {
    value: string;
    onChange: (val: string) => void;
}

export const LeftPanel_CustomJsonEditor: React.FC<CustomJsonEditorProps> = ({ value, onChange }) => {
    const [mode, setMode] = useState<'visual' | 'json'>('visual');
    const [visualTab, setVisualTab] = useState<'timeline' | 'structure'>('timeline');
    const [parsed, setParsed] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            if (mode !== 'json' && mode !== 'visual') return; 

            if (value && typeof value === 'string' && !value.trim().startsWith('{') && !value.trim().startsWith('[')) {
                 if (value.startsWith('http')) {
                      setParsed(null);
                      setError("Content is a URL, not JSON");
                      return;
                 }
            }

            const p = JSON.parse(value);
            setParsed(p);
            setError(null);
        } catch (e) {
            if (mode !== 'json') {
                setError("Invalid JSON - Please fix syntax");
            }
        }
    }, [value, mode]);

    const handleVisualUpdate = (newParsed: any) => {
        setParsed(newParsed);
        onChange(JSON.stringify(newParsed, null, 2));
    };

    const handleTextUpdate = (text: string) => {
        onChange(text);
        try {
            if (text && !text.trim().startsWith('{') && !text.trim().startsWith('[')) {
                 if (text.startsWith('http')) {
                      setParsed(null);
                      setError("Content is a URL");
                      return;
                 }
            }

            const p = JSON.parse(text);
            setParsed(p);
            setError(null);
        } catch (e) {
            setError("Invalid JSON");
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-2 border-b border-zinc-900 bg-zinc-900/50">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setMode('visual')}
                        disabled={!!error}
                        className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-colors ${mode === 'visual' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'}`}
                    >
                        Visual
                    </button>
                    <button
                        onClick={() => setMode('json')}
                        className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-colors ${mode === 'json' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        JSON
                    </button>
                </div>
                {error && <span className="text-[10px] text-red-500 font-mono animate-pulse">{error}</span>}
            </div>

            <div className="flex-1 overflow-hidden relative">
                {mode === 'json' && (
                    <textarea
                        className="w-full h-full bg-zinc-950 p-4 text-[10px] font-mono text-green-400 focus:outline-none resize-none leading-relaxed"
                        value={value}
                        onChange={(e) => handleTextUpdate(e.target.value)}
                        spellCheck={false}
                    />
                )}

                {mode === 'visual' && parsed && (
                    <div className="flex flex-col h-full">
                        <div className="flex border-b border-zinc-900">
                             <button
                                onClick={() => setVisualTab('timeline')}
                                className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider ${visualTab === 'timeline' ? 'text-white bg-zinc-900' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                Timeline
                            </button>
                            <button
                                onClick={() => setVisualTab('structure')}
                                className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider ${visualTab === 'structure' ? 'text-white bg-zinc-900' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                Structure
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-800">
                            {visualTab === 'timeline' && (
                                <TimelineEditor parsed={parsed} onUpdate={handleVisualUpdate} />
                            )}
                            {visualTab === 'structure' && (
                                <StructureEditor parsed={parsed} onUpdate={handleVisualUpdate} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const TimelineEditor = ({ parsed, onUpdate }: { parsed: any, onUpdate: (p: any) => void }) => {
    const timeline = parsed.timeline || [];

    const updateStep = (index: number, changes: any) => {
        const newTimeline = [...timeline];
        newTimeline[index] = { ...newTimeline[index], ...changes };
        onUpdate({ ...parsed, timeline: newTimeline });
    };

    const removeStep = (index: number) => {
        const newTimeline = [...timeline];
        newTimeline.splice(index, 1);
        onUpdate({ ...parsed, timeline: newTimeline });
    }

    const moveStep = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= timeline.length) return;
        const newTimeline = [...timeline];
        const temp = newTimeline[index];
        newTimeline[index] = newTimeline[index + direction];
        newTimeline[index + direction] = temp;
        onUpdate({ ...parsed, timeline: newTimeline });
    }

    const addStep = (type: 'wait' | 'guide' | 'anim' | 'label' | 'goto') => {
        let newStep = {};
        if (type === 'wait') newStep = { comment: "Wait", delay: 1 };
        if (type === 'guide') newStep = { comment: "Move Cursor", guide: { target: "id", duration: 1 } };
        if (type === 'anim') newStep = { id: "hero", animate: { opacity: 1 }, transition: { duration: 0.5 } };
        if (type === 'label') newStep = { label: "Start" };
        if (type === 'goto') newStep = { goto: "Start" };
        
        onUpdate({ ...parsed, timeline: [...timeline, newStep] });
    };

    return (
        <div className="space-y-4 pb-10">
            {timeline.map((step: any, i: number) => {
                const isGuide = !!step.guide;
                const isAnim = !!step.id && !!step.animate;
                const isLabel = !!step.label;
                const isGoto = !!step.goto;
                const isWait = !isGuide && !isAnim && !isLabel && !isGoto && step.delay !== undefined;

                return (
                <div key={i} className={`relative border rounded-r-lg p-3 transition-all group my-2 ${
                    isGuide ? 'border-l-4 border-l-purple-500 bg-zinc-950/50 border-y border-r border-zinc-900' : 
                    isAnim ? 'border-l-4 border-l-green-500 bg-zinc-950/50 border-y border-r border-zinc-900' :
                    isLabel ? 'border-l-4 border-l-blue-500 bg-blue-900/10 border-y border-r border-zinc-900' :
                    isGoto ? 'border-l-4 border-l-orange-500 bg-orange-900/10 border-y border-r border-zinc-900' :
                    'border-l-4 border-l-zinc-700 bg-zinc-950/50 border-y border-r border-zinc-900'
                }`}>
                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-mono text-zinc-600">#{i + 1}</span>
                            {isGuide && <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1"><LucideIcons.MousePointer2 size={10} /> CRSR MOVE</span>}
                            {isAnim && <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1"><LucideIcons.Zap size={10} /> ANIMATE</span>}
                            {isLabel && <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1"><LucideIcons.Flag size={10} /> ANCHOR</span>}
                            {isGoto && <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1"><LucideIcons.Repeat size={10} /> LOOP / GOTO</span>}
                            {isWait && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><LucideIcons.Clock size={10} /> DELAY</span>}
                        </div>
                        
                        <div className="flex items-center space-x-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white disabled:opacity-0"><LucideIcons.ChevronUp size={12} /></button>
                            <button onClick={() => moveStep(i, 1)} disabled={i === timeline.length - 1} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white disabled:opacity-0"><LucideIcons.ChevronDown size={12} /></button>
                            <div className="w-px h-3 bg-zinc-700 mx-1"></div>
                            <button onClick={() => removeStep(i)} className="p-1 hover:bg-red-900/30 rounded text-zinc-500 hover:text-red-400"><LucideIcons.Trash2 size={12} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                             <input 
                                className="w-full bg-transparent border-b border-dotted border-zinc-700 text-[10px] text-zinc-500 focus:text-zinc-300 focus:border-zinc-500 focus:outline-none py-0.5"
                                placeholder="// Add a comment..."
                                value={step.comment || ''}
                                onChange={(e) => updateStep(i, { comment: e.target.value })}
                            />
                        </div>

                        {isGuide && (
                             <>
                                <div>
                                    <label className="text-[8px] text-zinc-600 uppercase font-bold block mb-1">Target Element ID</label>
                                    <div className="relative">
                                        <input className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-purple-300 font-mono focus:border-purple-500/50 focus:outline-none"
                                            value={step.guide.target || ''} onChange={(e) => updateStep(i, { guide: { ...step.guide, target: e.target.value } })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[8px] text-zinc-600 uppercase font-bold block mb-1">Duration (s)</label>
                                    <input type="number" step="0.1" className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-300 focus:border-purple-500/50 focus:outline-none"
                                        value={step.guide.duration || 0} onChange={(e) => updateStep(i, { guide: { ...step.guide, duration: parseFloat(e.target.value) } })} />
                                </div>
                             </>
                        )}

                        {isAnim && (
                             <>
                                <div>
                                     <label className="text-[8px] text-zinc-600 uppercase font-bold block mb-1">Target ID</label>
                                     <input className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-green-300 font-mono focus:border-green-500/50 focus:outline-none"
                                        value={step.id || ''} onChange={(e) => updateStep(i, { id: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[8px] text-zinc-600 uppercase font-bold block mb-1">Transition (s)</label>
                                    <input type="number" step="0.1" className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-300 focus:border-green-500/50 focus:outline-none"
                                        value={step.transition?.duration ?? 0.5} 
                                        onChange={(e) => updateStep(i, { transition: { ...step.transition, duration: parseFloat(e.target.value) } })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[8px] text-zinc-600 uppercase font-bold block mb-1">Animate Props (JSON)</label>
                                    <input className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-300 font-mono focus:border-green-500/50 focus:outline-none"
                                        value={JSON.stringify(step.animate)} 
                                        onChange={(e) => {
                                            try { updateStep(i, { animate: JSON.parse(e.target.value) }) } catch(err) {} 
                                        }} 
                                    />
                                </div>
                             </>
                        )}
                        
                        {(isWait || step.delay !== undefined) && !isGuide && !isLabel && !isGoto && !isAnim && (
                             <div className="col-span-1">
                                <label className="text-[8px] text-zinc-600 uppercase font-bold block mb-1">Wait Duration (s)</label>
                                <input type="number" step="0.1" className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-300 focus:border-zinc-600 focus:outline-none"
                                    value={step.delay} onChange={(e) => updateStep(i, { delay: parseFloat(e.target.value) })} />
                            </div>
                        )}

                        {isLabel && (
                             <div className="col-span-2">
                                <label className="text-[8px] text-blue-600 uppercase font-bold block mb-1">Label Name</label>
                                <input className="w-full bg-zinc-950 border border-blue-900/50 rounded px-2 py-1.5 text-[10px] text-blue-300 focus:border-blue-500 focus:outline-none font-bold"
                                    value={step.label} onChange={(e) => updateStep(i, { label: e.target.value })} />
                            </div>
                        )}

                        {isGoto && (
                             <div className="col-span-2">
                                <label className="text-[8px] text-orange-600 uppercase font-bold block mb-1">Go to Label</label>
                                <input className="w-full bg-zinc-950 border border-orange-900/50 rounded px-2 py-1.5 text-[10px] text-orange-300 focus:border-orange-500 focus:outline-none font-bold"
                                    value={step.goto} onChange={(e) => updateStep(i, { goto: e.target.value })} />
                            </div>
                        )}
                    </div>
                </div>
            )})}
            
            {timeline.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-lg">
                    <p className="text-zinc-500 text-[10px]">No animation steps yet</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2">
                <button onClick={() => addStep('guide')} className="py-2.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold text-zinc-400 hover:text-purple-400 hover:border-purple-500/30 transition-all flex items-center justify-center gap-1.5">
                    <LucideIcons.MousePointer2 size={12} />
                    + CURSOR
                </button>
                <button onClick={() => addStep('anim')} className="py-2.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold text-zinc-400 hover:text-green-400 hover:border-green-500/30 transition-all flex items-center justify-center gap-1.5">
                    <LucideIcons.Zap size={12} />
                    + ANIM
                </button>
                <button onClick={() => addStep('wait')} className="py-2.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-1.5">
                    <LucideIcons.Clock size={12} />
                    + WAIT
                </button>
                <div className="col-span-3 grid grid-cols-2 gap-2 mt-1">
                     <button onClick={() => addStep('label')} className="py-2 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold text-blue-900 hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center justify-center gap-1.5">
                        <LucideIcons.Flag size={12} />
                        + ANCHOR
                    </button>
                    <button onClick={() => addStep('goto')} className="py-2 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold text-orange-900 hover:text-orange-400 hover:border-orange-500/30 transition-all flex items-center justify-center gap-1.5">
                        <LucideIcons.Repeat size={12} />
                        + LOOP
                    </button>
                </div>
            </div>
        </div>
    );
};

const StructureEditor = ({ parsed, onUpdate }: { parsed: any, onUpdate: (p: any) => void }) => {
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    const selectedNode = useMemo(() => {
        if (!selectedPath) return null;
        let current = parsed;
        const pathParts = selectedPath.replace(/\]/g, '').split(/[.\[]/);
        for (const part of pathParts) {
            if (current && current[part]) {
                current = current[part];
            } else {
                return null;
            }
        }
        return current;
    }, [parsed, selectedPath]);

    const [dragOverPath, setDragOverPath] = useState<string | null>(null);

    const handleRemoveNode = () => {
        if (!selectedPath || selectedPath === 'layout') return; // Protect root
        
        
        const match = selectedPath.match(/(.*)\.children\[(\d+)\]$/);
        if (match) {
            const parentPath = match[1];
            const index = parseInt(match[2]);
            
            const newParsed = JSON.parse(JSON.stringify(parsed));
            let parent = newParsed;
            const parentParts = parentPath.replace(/\]/g, '').split(/[.\[]/);
             for (const part of parentParts) {
                if (parent && parent[part]) {
                    parent = parent[part];
                }
            }
            
            if (parent && parent.children) {
                parent.children.splice(index, 1);
                onUpdate(newParsed);
                setSelectedPath(null); // Deselect
            }
        }
    };

    const handleMoveNode = (direction: -1 | 1) => {
        if (!selectedPath || selectedPath === 'layout') return;

        const match = selectedPath.match(/(.*)\.children\[(\d+)\]$/);
        if (match) {
            const parentPath = match[1];
            const index = parseInt(match[2]);
            const newIndex = index + direction;

            const newParsed = JSON.parse(JSON.stringify(parsed));
            let parent = newParsed;
            const parentParts = parentPath.replace(/\]/g, '').split(/[.\[]/);
             for (const part of parentParts) {
                if (parent && parent[part]) {
                    parent = parent[part];
                }
            }

            if (parent && parent.children) {
                if (newIndex < 0 || newIndex >= parent.children.length) return;

                const temp = parent.children[index];
                parent.children[index] = parent.children[newIndex];
                parent.children[newIndex] = temp;

                onUpdate(newParsed);
                setSelectedPath(`${parentPath}.children[${newIndex}]`);
            }
        }
    };

    const handleAddChild = () => {
        if (!selectedPath) return;
        
        const newParsed = JSON.parse(JSON.stringify(parsed));
        let current = newParsed;
        const parts = selectedPath.replace(/\]/g, '').split(/[.\[]/);
         for (const part of parts) {
            if (current && current[part]) {
                current = current[part];
            }
        }
        
        if (current) {
            if (!current.children) current.children = [];
            current.children.push({ tag: 'div', className: 'w-10 h-10 bg-zinc-500', id: `new-${Date.now().toString().slice(-4)}` });
            onUpdate(newParsed);
        }
    };

    const handleDropNode = (sourcePath: string, targetPath: string) => {
        if (!sourcePath || !targetPath) return;
        if (sourcePath === targetPath) return;
        if (targetPath.startsWith(sourcePath)) return;

        const newParsed = JSON.parse(JSON.stringify(parsed));
        
        let sourceParent = newParsed;
        let sourceIndex = -1;
        
        const sourceMatch = sourcePath.match(/(.*)\.children\[(\d+)\]$/);
        if (sourceMatch) {
            const pPath = sourceMatch[1];
            sourceIndex = parseInt(sourceMatch[2]);
            const pParts = pPath.replace(/\]/g, '').split(/[.\[]/);
            for (const part of pParts) {
                if (sourceParent && sourceParent[part]) sourceParent = sourceParent[part];
            }
        }
        
        if (!sourceParent || !sourceParent.children) return;
        const nodeToMove = sourceParent.children[sourceIndex];
        
        
        
        
        let tNode = newParsed;
        const targetParts = targetPath.replace(/\]/g, '').split(/[.\[]/);
        for (const part of targetParts) {
            if (tNode && tNode[part]) tNode = tNode[part];
        }
        
        if (tNode) {
            if (!tNode.children) tNode.children = [];
            tNode.children.push(nodeToMove);
            
            
            
            
            let sParent = newParsed;
            const sMatch = sourcePath.match(/(.*)\.children\[(\d+)\]$/);
            if (sMatch) {
                const sParentPath = sMatch[1]; 
                const sIdx = parseInt(sMatch[2]);
                
                const sParts = sParentPath.replace(/\]/g, '').split(/[.\[]/);
                for (const part of sParts) {
                    if (sParent && sParent[part]) sParent = sParent[part];
                }
                
                if (sParent && sParent.children) {
                    
                    
                    sParent.children.splice(sIdx, 1);
                    onUpdate(newParsed);
                    setSelectedPath(null);
                }
            }
        }
    };

    const renderNode = (node: any, path: string) => {
        const isLeaf = !node.children || node.children.length === 0;
        const isSelected = path === selectedPath;
        const isDragOver = path === dragOverPath;

        return (
            <div className={`pl-3 border-l my-0.5 transition-colors duration-200 ${isDragOver ? 'border-green-500 bg-green-900/20' : 'border-zinc-800'}`}
                draggable={path !== 'layout'}
                onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('sourcePath', path);
                    e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (path !== 'layout' || true) { 
                         setDragOverPath(path);
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'copy';
                }}
                onDragEnd={(e) => {
                    setDragOverPath(null);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverPath(null);

                    const sourcePath = e.dataTransfer.getData('sourcePath');
                    if (sourcePath) {
                        handleDropNode(sourcePath, path);
                        return;
                    }

                    let remoteData = e.dataTransfer.getData('application/json');
                    if (!remoteData) remoteData = e.dataTransfer.getData('text/plain'); // Fallback

                    if (remoteData) {
                        try {
                            if (!remoteData.startsWith('{')) return;
                            
                            const data = JSON.parse(remoteData);
                            if (data.type === 'component') {
                                let newNode: any = { tag: 'div', className: 'p-4 bg-zinc-800', id: `el-${Date.now().toString().slice(-4)}` };
                                
                                switch (data.componentType) {
                                    case 'text':
                                    case 'headline':
                                    case 'subheadline':
                                        newNode = { tag: 'p', className: 'text-white', text: 'New Text', id: `txt-${Date.now().toString().slice(-4)}` };
                                        break;
                                    case 'image':
                                        newNode = { tag: 'img', props: { src: 'https://via.placeholder.com/150' }, className: 'rounded-xl', id: `img-${Date.now().toString().slice(-4)}` };
                                        break;
                                    case 'video':
                                        newNode = { tag: 'video', props: { src: '', autoPlay: true, muted: true }, className: 'rounded-xl', id: `vid-${Date.now().toString().slice(-4)}` };
                                        break;
                                    case 'shape':
                                        newNode = { tag: 'div', className: 'w-20 h-20 bg-purple-500 rounded-lg', id: `shape-${Date.now().toString().slice(-4)}` };
                                        break;
                                    case 'chart':
                                         newNode = { 
                                            tag: 'div', 
                                            className: 'w-full h-40 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center', 
                                            children: [{ tag: 'span', text: 'Chart Placeholder', className: 'text-xs text-zinc-500' }],
                                            id: `chart-${Date.now().toString().slice(-4)}`
                                         };
                                         break;
                                }

                                const newParsed = JSON.parse(JSON.stringify(parsed));
                                let tNode = newParsed;
                                const targetParts = path.replace(/\]/g, '').split(/[.\[]/);
                                for (const part of targetParts) {
                                    if (tNode && tNode[part]) tNode = tNode[part];
                                }

                                if (tNode) {
                                    if (!tNode.children) tNode.children = [];
                                    tNode.children.push(newNode);
                                    onUpdate(newParsed);
                                }
                            }
                        } catch (err) {
                            console.error("Failed to parse drop data", err);
                        }
                    }
                }}
            >
                <div 
                    onClick={(e) => { e.stopPropagation(); setSelectedPath(path); }}
                    className={`flex items-center space-x-2 cursor-pointer py-1.5 px-2 rounded transition-all ${isSelected ? 'bg-purple-600/20 border border-purple-500/50 shadow-sm shadow-purple-900/20' : 'hover:bg-zinc-800 border border-transparent opacity-80 hover:opacity-100'} ${isDragOver ? 'bg-green-500/10' : ''}`}
                >
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-purple-300 font-bold' : 'text-purple-400'}`}>{node.tag}</span>
                    {node.id && <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 rounded border border-zinc-700/50">#{node.id}</span>}
                    {node.text && <span className="text-[9px] text-zinc-500 truncate max-w-[100px] italic">"{node.text}"</span>}
                </div>

                {!isLeaf && (
                    <div className="ml-1">
                        {node.children.map((child: any, i: number) => (
                            <React.Fragment key={i}>
                                {renderNode(child, `${path}.children[${i}]`)}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const updateNode = (path: string, changes: any) => {
        const newParsed = JSON.parse(JSON.stringify(parsed));
        let current = newParsed;
        const pathParts = path.replace(/\]/g, '').split(/[.\[]/);
        
        for (let i = 0; i < pathParts.length; i++) {
            const key = pathParts[i];
            if (i === pathParts.length - 1) {
                 if (current[key]) {
                     current[key] = { ...current[key], ...changes };
                 }
            } else {
                current = current[key];
            }
        }
        onUpdate(newParsed);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs border-b border-zinc-900 bg-zinc-950/30">
                {parsed.layout ? renderNode(parsed.layout, 'layout') : <div className="text-zinc-500">No layout found</div>}
            </div>

            <div className="h-[220px] bg-zinc-900/80 backdrop-blur-sm p-3 border-t border-zinc-800 flex flex-col">
                {selectedNode && selectedPath ? (
                    <div className="flex-1 overflow-y-auto space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                             <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black uppercase text-zinc-500">Edit Node</span>
                                <span className="text-[9px] bg-zinc-800 px-1 rounded text-zinc-400 font-mono">{selectedNode.tag}</span>
                             </div>
                             <div className="flex space-x-1 items-center">
                                {selectedPath !== 'layout' && (
                                    <>
                                        <button onClick={() => handleMoveNode(-1)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="Move Up">
                                            <LucideIcons.ChevronUp size={14} />
                                        </button>
                                        <button onClick={() => handleMoveNode(1)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors" title="Move Down">
                                            <LucideIcons.ChevronDown size={14} />
                                        </button>
                                        <div className="w-px h-3 bg-zinc-700 mx-1"></div>
                                    </>
                                )}
                                <button onClick={handleAddChild} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-green-400 transition-colors" title="Add Child">
                                    <LucideIcons.Plus size={14} />
                                </button>
                                {selectedPath !== 'layout' && (
                                    <button onClick={handleRemoveNode} className="p-1 hover:bg-red-900/20 rounded text-zinc-400 hover:text-red-400 transition-colors" title="Delete Node">
                                        <LucideIcons.Trash2 size={14} />
                                    </button>
                                )}
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                             <div className="col-span-1">
                                 <label className="text-[8px] text-zinc-600 uppercase font-black mb-1 block">ID</label>
                                 <input className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-300 focus:border-purple-500 focus:outline-none focus:bg-zinc-900 transition-colors"
                                    placeholder="e.g. btn-login" value={selectedNode.id || ''} 
                                    onChange={(e) => updateNode(selectedPath, { id: e.target.value })} 
                                />
                             </div>
                             <div className="col-span-1">
                                 <label className="text-[8px] text-zinc-600 uppercase font-black mb-1 block">Content</label>
                                 <input className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-300 focus:border-purple-500 focus:outline-none focus:bg-zinc-900 transition-colors"
                                    placeholder="Inner Text..." value={selectedNode.text || ''} 
                                    onChange={(e) => updateNode(selectedPath, { text: e.target.value })} 
                                />
                             </div>
                             <div className="col-span-2">
                                <label className="text-[8px] text-zinc-600 uppercase font-black mb-1 block">Tailwind Classes</label>
                                 <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] text-green-300 font-mono resize-y min-h-[40px] focus:border-purple-500 focus:outline-none focus:bg-zinc-900 transition-colors"
                                    placeholder="flex items-center..." value={selectedNode.className || ''} 
                                    onChange={(e) => updateNode(selectedPath, { className: e.target.value })} 
                                />
                             </div>
                             <div className="col-span-2">
                                <label className="text-[8px] text-zinc-600 uppercase font-black mb-1 block flex justify-between">
                                    <span>Inner Style (JSON)</span>
                                    {selectedNode.className && selectedNode.style && Object.keys(selectedNode.style).length > 0 && (
                                        <span className="text-[7px] text-amber-500 font-bold animate-pulse flex items-center gap-0.5">
                                            <LucideIcons.AlertTriangle size={8} /> STYLE OVERRIDES CLASS
                                        </span>
                                    )}
                                </label>
                                 <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] text-yellow-300 font-mono resize-y min-h-[40px] focus:border-purple-500 focus:outline-none focus:bg-zinc-900 transition-colors"
                                    placeholder='{ "backgroundColor": "..." }' 
                                    value={JSON.stringify(selectedNode.style || {}, null, 0) === '{}' ? '' : JSON.stringify(selectedNode.style || {}, null, 1)} 
                                    onChange={(e) => {
                                        try {
                                            const val = e.target.value;
                                            if (!val.trim()) updateNode(selectedPath, { style: undefined });
                                            else updateNode(selectedPath, { style: JSON.parse(val) });
                                        } catch (err) {}
                                    }} 
                                />
                             </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 opacity-50">
                        <LucideIcons.MousePointerClick size={20} />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Select a node to edit</span>
                    </div>
                )}
            </div>
        </div>
    );
};
