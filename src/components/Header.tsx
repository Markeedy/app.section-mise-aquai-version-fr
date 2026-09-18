import React from 'react';
import { Anchor, Waves } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeOperationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeOperationsCount,
}) => {
  return (
    <header className="app-header bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Official State Enterprise Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Entity Header */}
          <div className="flex items-center space-x-3.5 w-full md:w-auto">
            <div className="h-12 w-12 rounded-lg bg-sky-600 flex items-center justify-center shadow-inner border border-sky-400/30 flex-shrink-0">
              <Anchor className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sky-400 tracking-wider text-sm sm:text-base">SGPP</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-medium border border-sky-800/60">
                  UNITÉ DE TIPAZA
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-semibold text-slate-200 tracking-tight leading-snug uppercase">
                Société de Gestion des Ports de Pêche et de Plaisance
              </h1>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Waves className="h-3 w-3 text-sky-400" /> Ports : Tipaza • Cherchell • Bouharoun • Gouraya • Khemisti
              </p>
            </div>
          </div>

          {/* Document / Module Title */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-md px-4 py-2 text-center w-full md:w-auto shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Application Portuaire</div>
            <div className="text-sm sm:text-base font-bold text-white tracking-wide">
              FICHE DE MOUVEMENT — CARÉNAGE
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5" aria-label="Tabs">
            <button
              id="tab-movement"
              onClick={() => setActiveTab('movement')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'movement'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Fiche de mouvement</span>
            </button>

            <button
              id="tab-active-operations"
              onClick={() => setActiveTab('active_operations')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'active_operations'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Opérations en cours</span>
              {activeOperationsCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeOperationsCount}
                </span>
              )}
            </button>

            <button
              id="tab-electricity"
              onClick={() => setActiveTab('electricity')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'electricity'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Consommation électrique</span>
            </button>

            <button
              id="tab-history"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Historique</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
