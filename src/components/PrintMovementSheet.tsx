import React from 'react';
import { Movement } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { Anchor, Printer, ArrowLeft } from 'lucide-react';

interface PrintMovementSheetProps {
  movement: Movement;
  onBack: () => void;
}

export const PrintMovementSheet: React.FC<PrintMovementSheetProps> = ({ movement, onBack }) => {
  const fin = movement.financialSummary;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-4 sm:p-6 bg-white border border-slate-300 shadow-lg rounded-lg text-slate-900 printable-document">
      {/* Non-printable action bar */}
      <div className="no-print mb-6 flex items-center justify-between border-b pb-4">
        <button
          id="btn-print-back"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-2 border border-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l'application</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Document A4 prêt à imprimer</span>
          <button
            id="btn-trigger-print"
            onClick={handlePrint}
            className="px-5 py-2 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-md flex items-center gap-2 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer la Fiche de Mouvement</span>
          </button>
        </div>
      </div>

      {/* Official Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded bg-slate-900 flex items-center justify-center text-white border border-slate-700 flex-shrink-0">
              <Anchor className="h-8 w-8 text-sky-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">République Algérienne Démocratique et Populaire</div>
              <h1 className="text-sm sm:text-base font-extrabold uppercase text-slate-900 tracking-tight">
                SOCIÉTÉ DE GESTION DES PORTS DE PÊCHE ET DE PLAISANCE
              </h1>
              <div className="text-xs sm:text-sm font-bold text-sky-800 tracking-wide">
                UNITÉ DE TIPAZA — PORT DE {movement.port.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700">N° Dossier : <span className="text-slate-950 font-mono text-sm">{movement.id}</span></div>
            <div className="text-[11px] text-slate-500">Date d'édition : {formatDate(new Date().toISOString().split('T')[0])}</div>
            <div className="text-[11px] font-semibold text-slate-600">Statut : {movement.status}</div>
          </div>
        </div>

        <div className="mt-4 text-center bg-slate-100 py-2 border border-slate-300 rounded">
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900">
            FICHE DE MOUVEMENT — CARÉNAGE
          </h2>
        </div>
      </div>

      {/* Client & Vessel Information in a 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Client / Owner Section */}
        <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase text-slate-700 border-b border-slate-200 pb-1 mb-2">
            1. Renseignements Propriétaire / Client
          </h3>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Code Client :</span>
              <span className="font-bold text-slate-900 font-mono">{movement.clientCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Nom du Propriétaire :</span>
              <span className="font-bold text-slate-900">{movement.ownerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">N° Téléphone :</span>
              <span className="font-semibold text-slate-900">{movement.phone || '—'}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-slate-600 font-medium">Adresse :</span>
              <span className="font-semibold text-slate-900 text-right max-w-[60%]">{movement.address || '—'}</span>
            </div>
          </div>
        </div>

        {/* Vessel Section */}
        <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase text-slate-700 border-b border-slate-200 pb-1 mb-2">
            2. Renseignements Embarcation
          </h3>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Nom Embarcation :</span>
              <span className="font-bold text-slate-900">{movement.boatName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Immatriculation :</span>
              <span className="font-bold text-slate-900 font-mono">{movement.registrationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Type / Catégorie :</span>
              <span className="font-semibold text-slate-900">{movement.boatType} ({movement.boatCategory})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Dimensions (L × l) :</span>
              <span className="font-semibold text-slate-900">{movement.length} m × {movement.width} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-medium">Surface Occupée :</span>
              <span className="font-bold text-sky-900">{movement.surface} m²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className="border border-slate-300 rounded p-3 mb-6 bg-slate-50/50">
        <h3 className="text-xs font-bold uppercase text-slate-700 border-b border-slate-200 pb-1 mb-2">
          3. Période de Séjour au Port
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
          <div className="p-2 bg-white rounded border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Date Mise à Quai</div>
            <div className="font-bold text-slate-900">{formatDate(movement.arrivalDate)}</div>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Date Mise à l'Eau</div>
            <div className="font-bold text-slate-900">{movement.departureDate ? formatDate(movement.departureDate) : 'EN COURS'}</div>
          </div>
          <div className="p-2 bg-white rounded border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Nombre de Jours</div>
            <div className="font-bold text-sky-900">{fin ? `${fin.stayDays} jour(s)` : '—'}</div>
          </div>
        </div>
      </div>

      {/* Financial Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase text-slate-700 mb-2">
          4. Décompte Financier des Prestations
        </h3>
        <div className="border border-slate-400 rounded overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800 text-white font-semibold">
              <tr>
                <th className="p-2.5">Prestation</th>
                <th className="p-2.5 text-right whitespace-nowrap">HT</th>
                <th className="p-2.5 text-right whitespace-nowrap">TVA (19%)</th>
                <th className="p-2.5 text-right whitespace-nowrap">Timbre</th>
                <th className="p-2.5 text-right bg-slate-900 whitespace-nowrap">TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {fin && (
                <>
                  <tr className="bg-white">
                    <td className="p-2.5 font-medium">
                      Séjour carénage ({fin.stayDays}&nbsp;j × {fin.surface}&nbsp;m² × 25&nbsp;DA)
                    </td>
                    <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(fin.stayAmountHT)}</td>
                    <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(fin.stayTvaAmount)}</td>
                    <td className="p-2.5 text-right font-mono whitespace-nowrap">
                      {formatCurrency(fin.stayStampAmount)} ({fin.stayStampRate * 100}&nbsp;%)
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold bg-slate-50 whitespace-nowrap">{formatCurrency(fin.stayTotal)}</td>
                  </tr>

                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium">
                      Accès Grue {fin.craneAccess ? '(Forfait standard)' : '(Non utilisé)'}
                    </td>
                    <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(fin.craneAmountHT)}</td>
                    <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(fin.craneTvaAmount)}</td>
                    <td className="p-2.5 text-right font-mono whitespace-nowrap">
                      {fin.craneAccess ? `${formatCurrency(fin.craneStampAmount)} (1\u00A0%)` : `0,00\u00A0DA`}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold bg-slate-100 whitespace-nowrap">{formatCurrency(fin.craneTotal)}</td>
                  </tr>

                  {fin.electricityTotal > 0 && (
                    <tr className="bg-white">
                      <td className="p-2.5 font-medium">
                        Consommation électrique ({movement.electricityEntries.length} branchement(s) — HT)
                      </td>
                      <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(fin.electricityTotal)}</td>
                      <td className="p-2.5 text-right text-slate-400 whitespace-nowrap">—</td>
                      <td className="p-2.5 text-right text-slate-400 whitespace-nowrap">—</td>
                      <td className="p-2.5 text-right font-mono font-bold bg-slate-50 whitespace-nowrap">{formatCurrency(fin.electricityTotal)}</td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Global Total Box */}
        {fin && (
          <div className="mt-4 p-3 bg-slate-900 text-white rounded border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-300">
              MONTANT GLOBAL À ENCAISSER
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-400">
              {formatCurrency(fin.grandTotal)}
            </div>
          </div>
        )}

        {/* In words */}
        {fin && (
          <div className="mt-2 text-xs text-slate-700 italic bg-slate-100 p-2.5 rounded border border-slate-300">
            <span className="font-bold not-italic">Arrêté la présente facture à la somme de : </span>
            {fin.grandTotalInWords}.
          </div>
        )}
      </div>

      {/* Signature & Validation Box */}
      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 mt-6 text-xs">
        <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between">
          <div className="font-bold text-slate-700 text-center uppercase">Visa de l'Agent Commercial / Caissier</div>
          <div className="text-center text-slate-400 text-[10px]">Date, signature & cachet</div>
        </div>
        <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between">
          <div className="font-bold text-slate-700 text-center uppercase">Signature du Propriétaire / Mandataire</div>
          <div className="text-center text-slate-400 text-[10px]">Mention « Lu et approuvé »</div>
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] text-slate-400 border-t pt-2">
        SGPP — Société de Gestion des Ports de Pêche et de Plaisance • Unité de Tipaza • Document Administratif Officiel
      </div>
    </div>
  );
};
