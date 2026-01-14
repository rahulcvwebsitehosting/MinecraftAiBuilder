
import React from 'react';
import { BlockData } from '../types';

interface MaterialListProps {
  materials: BlockData[];
}

const MaterialList: React.FC<MaterialListProps> = ({ materials }) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl h-full flex flex-col overflow-hidden">
      <div className="shrink-0 mb-6">
        <h3 className="text-xl font-black mb-1 flex items-center gap-3 text-emerald-400 tracking-tight">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Inventory
        </h3>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Required Resources</p>
      </div>

      <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-grow">
        {materials.map((m) => (
          <div key={m.id} className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800/50 hover:bg-slate-900 transition-all">
            <div className="flex flex-col">
              <span className="font-bold text-slate-200 text-xs tracking-tight">{m.name}</span>
              <span className="text-[9px] text-slate-600 font-mono font-bold truncate max-w-[120px]">{m.id}</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-black text-lg block leading-none">{m.count.toLocaleString()}</span>
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mt-1">
                {Math.ceil(m.count / 64)} Stacks
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-5 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] shrink-0">
        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.884 6.68a1 1 0 10-1.415-1.414l.707-.707a1 1 0 001.415 1.415l-.707.707zM14.829 5.266a1 1 0 10-1.415 1.414l.707.707a1 1 0 101.415-1.415l-.707-.707zM18 10a1 1 0 10-2 0v1a1 1 0 102 0v-1zM4 10a1 1 0 10-2 0v1a1 1 0 102 0v-1zM5.884 14.32a1 1 0 10-1.415 1.414l.707.707a1 1 0 101.415-1.415l-.707-.707zM14.829 15.734a1 1 0 10-1.415-1.414l.707-.707a1 1 0 101.415 1.415l-.707.707z"/></svg>
           Logistics Tip
        </h4>
        <p className="text-[10px] text-amber-200/60 font-medium leading-relaxed">
          For large scale builds, use <span className="text-amber-400 font-bold">Silk Touch</span> and <span className="text-amber-400 font-bold">Shulker Boxes</span> to organize your inventory by phase.
        </p>
      </div>
    </div>
  );
};

export default MaterialList;
