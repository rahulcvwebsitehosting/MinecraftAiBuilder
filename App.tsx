
import React, { useState, useRef } from 'react';
import { generateBlueprint, adjustBlueprint, optimizePrompt } from './services/gemini';
import { buildVoxels } from './utils/structureEngine';
import { StructureBlueprint, GeneratedStructure, StructureSize, MinecraftEdition, OptimizedPromptData } from './types';
import { EXAMPLE_PROMPTS } from './constants';
import ThreeScene from './components/ThreeScene';
import MaterialList from './components/MaterialList';
import BuildTutorial from './components/BuildTutorial';
import { generateCommandFile, generatePackMcMeta, downloadFile } from './utils/exportUtils';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [adjustmentPrompt, setAdjustmentPrompt] = useState('');
  const [size, setSize] = useState<StructureSize>(StructureSize.MEDIUM);
  const [edition, setEdition] = useState<MinecraftEdition>(MinecraftEdition.JAVA);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState<OptimizedPromptData | null>(null);
  const [structure, setStructure] = useState<GeneratedStructure | null>(null);
  const [copiedMcmeta, setCopiedMcmeta] = useState(false);
  
  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    setIsOptimizing(true);
    setOptimizedData(null);
    try {
      const data = await optimizePrompt(prompt, { size, edition });
      setOptimizedData(data);
    } catch (error) {
      console.error(error);
      alert('Review failed. Check your API key or connection.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerate = async (finalPrompt: string = prompt) => {
    setLoading(true);
    setStructure(null);
    try {
      setLoadingStep('Designing architecture...');
      const blueprint = await generateBlueprint(finalPrompt, size);
      setLoadingStep('Simulating voxels...');
      const { voxels, materials } = buildVoxels(blueprint);
      setStructure({
        blueprint,
        voxels,
        materials,
        estimatedBuildTime: blueprint.tutorial?.totalEstimatedTime || '2-4 Hours'
      });
      setOptimizedData(null);
    } catch (error) {
      console.error(error);
      alert('Generation failed. Please try a different description.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentPrompt.trim() || !structure) return;
    setIsAdjusting(true);
    try {
      const updatedBlueprint = await adjustBlueprint(structure.blueprint, adjustmentPrompt);
      const { voxels, materials } = buildVoxels(updatedBlueprint);
      setStructure({
        blueprint: updatedBlueprint,
        voxels,
        materials,
        estimatedBuildTime: updatedBlueprint.tutorial?.totalEstimatedTime || '2-4 Hours'
      });
      setAdjustmentPrompt('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleDownload = (format: string) => {
    if (!structure) return;
    const safeName = (structure.blueprint.name || 'structure').toLowerCase().replace(/\s+/g, '_');
    
    if (format === 'txt') {
      const content = generateCommandFile(structure);
      downloadFile(content, `${safeName}.mcfunction`, 'text/plain');
    } else if (format === 'mcmeta') {
      const content = generatePackMcMeta();
      downloadFile(content, 'pack.mcmeta', 'application/json');
    }
  };

  const copyMcmeta = () => {
    navigator.clipboard.writeText(generatePackMcMeta());
    setCopiedMcmeta(true);
    setTimeout(() => setCopiedMcmeta(false), 2000);
  };

  const structureFileName = structure?.blueprint.name.toLowerCase().replace(/\s+/g, '_') || 'structure';

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200">
      <header className="border-b border-slate-800 p-4 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight italic">BLOCK ARCHITECT</h1>
          </div>
          <div className="flex gap-4">
             <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">v3.2 Final</span>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!structure && !loading ? (
          <div className="max-w-4xl mx-auto mt-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight text-white tracking-tighter">
              Build your <span className="text-emerald-400 text-glow">Masterpiece.</span>
            </h2>
            
            <div className="bg-slate-800/40 p-6 md:p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl backdrop-blur-sm">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A luxury cliffside villa with an infinity pool..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-3xl p-6 h-48 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none text-lg md:text-xl text-white placeholder:text-slate-700 shadow-inner"
              />
              
              <div className="mt-6">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-[0.2em] ml-2">Quick Recommendations</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((ex) => (
                    <button 
                      key={ex} 
                      onClick={() => setPrompt(ex)} 
                      className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 hover:text-emerald-400 px-4 py-3 rounded-2xl text-slate-400 border border-slate-800 hover:border-emerald-500/50 transition-all text-left max-w-xs"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 border-t border-slate-700/50 pt-8">
                <div className="flex flex-col justify-center">
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-widest ml-1">Scale / Effort</label>
                  <select value={size} onChange={(e) => setSize(e.target.value as StructureSize)} className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm outline-none text-white font-bold cursor-pointer hover:bg-slate-800 transition-colors">
                    <option value={StructureSize.SMALL}>Small Build (~1-2 hrs)</option>
                    <option value={StructureSize.MEDIUM}>Medium Build (~3-5 hrs)</option>
                    <option value={StructureSize.LARGE}>Mega Build (Epic)</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-stretch gap-4">
                  <button 
                    onClick={handleOptimize} 
                    disabled={!prompt.trim() || isOptimizing} 
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl border border-slate-700 transition-all shadow-lg active:scale-95"
                  >
                    {isOptimizing ? 'Analyzing...' : 'Technical Review'}
                  </button>
                  <button 
                    onClick={() => handleGenerate()} 
                    disabled={!prompt.trim() || loading} 
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xs uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    Generate Blueprint
                  </button>
                </div>
              </div>
            </div>

            {optimizedData && (
              <div className="mt-8 bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] animate-in fade-in slide-in-from-top-4 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-emerald-400 tracking-tight">Architect's Refinement</h3>
                    <p className="text-slate-400 text-xs font-medium">Gemini has optimized your build specifications.</p>
                  </div>
                  <button onClick={() => handleGenerate(optimizedData.refined_user_description)} className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Execute Project</button>
                </div>
                
                <div className="mb-8 p-6 bg-slate-950/50 rounded-2xl border border-slate-800 relative z-10">
                  <p className="text-slate-300 text-base italic leading-relaxed">"{optimizedData.refined_user_description}"</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold mb-1 tracking-widest">Levels</span>
                    <span className="text-white font-bold text-lg">{optimizedData.structure_metadata.levels} Stories</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold mb-1 tracking-widest">Style</span>
                    <span className="text-white font-bold text-lg">{optimizedData.structure_metadata.style}</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold mb-1 tracking-widest">Footprint</span>
                    <span className="text-white font-bold text-lg">{optimizedData.structure_metadata.overall_footprint.width}x{optimizedData.structure_metadata.overall_footprint.depth}</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-sm">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold mb-1 tracking-widest">Blocks</span>
                    <span className="text-emerald-400 font-bold text-lg">~{optimizedData.structure_metadata.estimated_block_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-8" />
            <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">{loadingStep}</h3>
            <p className="text-slate-500 text-sm animate-pulse font-mono tracking-[0.3em] uppercase">Simulating Environment...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Visual Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="h-[65vh] rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950">
                <ThreeScene voxels={structure!.voxels} dimensions={structure!.blueprint.dimensions} />
                
                {isAdjusting && (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center z-30">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <span className="text-white font-bold text-xs tracking-widest uppercase">Regenerating Architecture...</span>
                  </div>
                )}

                <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                  <form onSubmit={handleAdjust} className="flex-grow flex gap-2">
                    <input
                      type="text"
                      value={adjustmentPrompt}
                      onChange={(e) => setAdjustmentPrompt(e.target.value)}
                      placeholder="Modify the build (e.g. 'Add more windows', 'Make it taller')"
                      className="flex-grow bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-2xl text-white placeholder:text-slate-600"
                    />
                    <button type="submit" disabled={!adjustmentPrompt.trim() || isAdjusting} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02]">Apply</button>
                  </form>
                  <button onClick={() => setStructure(null)} className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-2xl border border-slate-700">New</button>
                </div>
              </div>

              {/* Guide Area */}
              <div className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-700 shadow-xl">
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <h3 className="text-3xl font-black text-white tracking-tight">Automation Engine</h3>
                      <p className="text-slate-500 text-sm mt-1 font-medium">Export this build directly to your Minecraft world.</p>
                   </div>
                   <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-2xl shadow-inner">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Validated v1.21.x</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                   {/* Visual Folder Tree */}
                   <div className="bg-slate-950/80 p-8 rounded-3xl border border-slate-800 font-mono text-[11px] leading-relaxed shadow-inner">
                      <h4 className="text-slate-500 font-bold mb-6 uppercase tracking-widest text-[9px] border-b border-slate-800/50 pb-3 flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        FileSystem Blueprint
                      </h4>
                      <div className="text-slate-400 space-y-1">
                        <div className="text-slate-600">📂 saves/[YourWorld]</div>
                        <div className="pl-4 text-slate-600">📂 datapacks</div>
                        <div className="pl-8 border-l border-slate-800/80 ml-4 py-3 space-y-2">
                           <div className="flex items-center gap-2">
                             <span className="text-amber-500 font-bold">📂 build_ai</span> 
                             <span className="text-[7px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Root Datapack</span>
                           </div>
                           <div className="pl-6 flex items-center gap-3 py-1">
                              <span className="text-emerald-400">📄 pack.mcmeta</span>
                              <button onClick={copyMcmeta} className="bg-slate-800 px-2 py-1 rounded-md text-[8px] hover:bg-slate-700 border border-slate-700 transition-colors uppercase font-bold tracking-widest">Copy</button>
                           </div>
                           <div className="pl-6 text-slate-500">📂 data</div>
                           <div className="pl-10">
                             📂 <span className="text-blue-400">mybuilds</span>
                             <div className="pl-6">
                               📂 functions
                               <div className="pl-6 text-emerald-400 font-bold animate-pulse mt-1">
                                 📄 {structureFileName}.mcfunction
                               </div>
                             </div>
                           </div>
                        </div>
                      </div>
                   </div>

                   {/* Verification Steps */}
                   <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 gap-4">
                         <button onClick={() => handleDownload('txt')} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xs py-5 rounded-2xl uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Get Function Script
                         </button>
                         <button onClick={() => handleDownload('mcmeta')} className="bg-slate-800 hover:bg-slate-700 text-white font-black text-xs py-5 rounded-2xl uppercase tracking-widest border border-slate-700 transition-all active:scale-95">
                            Get pack.mcmeta
                         </button>
                      </div>

                      <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2rem]">
                         <h5 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                           Troubleshooting
                         </h5>
                         <ul className="space-y-4 text-[11px] text-slate-400 font-medium">
                            <li className="flex gap-3">
                              <span className="text-emerald-500 font-bold">01</span>
                              <span><code className="text-slate-300">pack.mcmeta</code> must be in the <code className="text-amber-500">build_ai</code> folder.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-emerald-500 font-bold">02</span>
                              <span>File must be <code className="text-emerald-400">.mcfunction</code> (not .txt).</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-emerald-500 font-bold">03</span>
                              <span className="text-white">Commands: <code className="bg-black/50 px-2 rounded-md text-emerald-400">/reload</code> & <code className="bg-black/50 px-2 rounded-md text-emerald-400">/function mybuilds:{structureFileName}</code></span>
                            </li>
                         </ul>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar Container */}
            <div className="lg:col-span-4 sticky top-24 flex flex-col gap-6 max-h-[calc(100vh-8rem)] overflow-hidden">
              <div className="flex-1 min-h-0">
                <BuildTutorial tutorial={structure!.blueprint.tutorial} structureName={structure!.blueprint.name} />
              </div>
              <div className="flex-1 min-h-0">
                <MaterialList materials={structure!.materials} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-12 border-t border-slate-800 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-600">Hybrid Procedural Architecture Engine v3.2 • Powered by Gemini 3.0</p>
      </footer>
    </div>
  );
};

export default App;
