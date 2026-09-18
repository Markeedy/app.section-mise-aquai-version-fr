import React from 'react';
import { Movement } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { CheckCircle2, Printer, FileText, Zap, X } from 'lucide-react';

interface FinalConfirmationModalProps {
  movement: Movement;
  onClose: () => void;
  onPrintCareening: () => void;
  onPrintElectricity: () => void;
}

export const FinalConfirmationModal: React.FC<FinalConfirmationModalProps> = ({
  movement,
  onClose,
  onPrintCareening,
  onPrintElectricity,
}) => {
  const fin = movement.financialSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with success badge */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Confirmation Système</span>
              <h2 className="text-xl font-extrabold text-slate-900">TRANSACTION ENREGISTRÉE</h2>
            </div>
          </div>
          <button
            id="btn-close-confirm-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Short summary required by spec */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 text-sm">
          <div className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-2.5 border-b border-slate-200 pb-1">
            Résumé du Mouvement Clôturé ({movement.id})
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-[11px]">Code client</span>
              <span className="font-bold text-slate-900 font-mono">{movement.clientCode}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nom propriétaire</span>
              <span className="font-bold text-slate-900">{movement.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nom embarcation</span>
              <span className="font-bold text-slate-900">{movement.boatName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Immatriculation</span>
              <span className="font-bold text-slate-900 font-mono">{movement.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Surface</span>
              <span className="font-bold text-slate-900">{movement.surface} m²</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nombre de jours</span>
              <span className="font-bold text-sky-700">{fin?.stayDays || '—'} jour(s)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Date mise à quai</span>
              <span className="font-medium text-slate-900">{formatDate(movement.arrivalDate)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Date mise à l'eau</span>
              <span className="font-medium text-slate-900">{formatDate(movement.departureDate)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Port d'attache</span>
              <span className="font-medium text-slate-900">{movement.port}</span>
            </div>
          </div>
        </div>

        {/* Compact final table */}
        {fin && (
          <div className="mb-4">
            <div className="text-xs font-bold text-slate-700 uppercase mb-1.5">
              Tableau Final d'Encaissement
            </div>
            <div className="border border-slate-300 rounded-lg overflow-x-auto text-xs sm:text-sm">
              <table className="w-full text-left min-w-[480px]">
                <thead className="bg-slate-800 text-white font-medium">
                  <tr>
                    <th className="p-2">Prestation</th>
                    <th className="p-2 text-right whitespace-nowrap">HT</th>
                    <th className="p-2 text-right whitespace-nowrap">TVA</th>
                    <th className="p-2 text-right whitespace-nowrap">Timbre</th>
                    <th className="p-2 text-right bg-slate-900 whitespace-nowrap">TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-white">
                    <td className="p-2 font-medium text-slate-800">Séjour carénage</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(fin.stayAmountHT)}</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(fin.stayTvaAmount)}</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(fin.stayStampAmount)} ({fin.stayStampRate * 100}&nbsp;%)</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900 bg-slate-50 whitespace-nowrap">{formatCurrency(fin.stayTotal)}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2 font-medium text-slate-800">Accès grue</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(fin.craneAmountHT)}</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(fin.craneTvaAmount)}</td>
                    <td className="p-2 text-right font-mono whitespace-nowrap">{fin.craneAccess ? `${formatCurrency(fin.craneStampAmount)} (1\u00A0%)` : `0,00\u00A0DA`}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900 bg-slate-100 whitespace-nowrap">{formatCurrency(fin.craneTotal)}</td>
                  </tr>
                  {fin.electricityTotal > 0 && (
                    <tr className="bg-white">
                      <td className="p-2 font-medium text-slate-800">Électricité</td>
                      <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(fin.electricityTotal)}</td>
                      <td className="p-2 text-right text-slate-400 whitespace-nowrap">—</td>
                      <td className="p-2 text-right text-slate-400 whitespace-nowrap">—</td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900 bg-slate-50 whitespace-nowrap">{formatCurrency(fin.electricityTotal)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total box */}
            <div className="mt-3 p-3 bg-slate-900 text-white rounded-lg flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                MONTANT GLOBAL À ENCAISSER
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono">
                {formatCurrency(fin.grandTotal)}
              </span>
            </div>
            
            <div className="mt-1.5 text-[11px] text-slate-500 italic">
              {fin.grandTotalInWords}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-200">
          <button
            id="btn-print-movement-modal"
            onClick={onPrintCareening}
            className="flex-1 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm"
          >
            <FileText className="h-4 w-4" />
            <span>Imprimer Fiche Carénage</span>
          </button>

          {movement.electricityEntries.length > 0 && (
            <button
              id="btn-print-elec-modal"
              onClick={onPrintElectricity}
              className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="h-4 w-4" />
              <span>Imprimer Fiche Électricité</span>
            </button>
          )}

          <button
            id="btn-done-modal"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
