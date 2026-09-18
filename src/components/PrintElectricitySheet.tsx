import React from 'react';
import { Movement } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { Zap, Printer, ArrowLeft, Anchor } from 'lucide-react';

interface PrintElectricitySheetProps {
  movement: Movement;
  onBack: () => void;
}

export const PrintElectricitySheet: React.FC<PrintElectricitySheetProps> = ({ movement, onBack }) => {
  const electricityTotal = movement.electricityEntries.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-4 sm:p-6 bg-white border border-slate-300 shadow-lg rounded-lg text-slate-900 printable-document">
      {/* Non-printable action bar */}
      <div className="no-print mb-6 flex items-center justify-between border-b pb-4">
        <button
          id="btn-elec-print-back"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-2 border border-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l'application</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Document A4 prêt à imprimer</span>
          <button
            id="btn-trigger-elec-print"
            onClick={handlePrint}
            className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md flex items-center gap-2 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer la Fiche Électricité</span>
          </button>
        </div>
      </div>

      {/* Official SGPP Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded bg-slate-900 flex items-center justify-center text-white border border-slate-700 flex-shrink-0">
              <Anchor className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">République Algérienne Démocratique et Populaire</div>
              <h1 className="text-sm sm:text-base font-extrabold uppercase text-slate-900 tracking-tight">
                SOCIÉTÉ DE GESTION DES PORTS DE PÊCHE ET DE PLAISANCE
              </h1>
              <div className="text-xs sm:text-sm font-bold text-amber-700 tracking-wide">
                UNITÉ DE TIPAZA — PORT DE {movement.port.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700">Réf Dossier : <span className="text-slate-950 font-mono text-sm">{movement.id}</span></div>
            <div className="text-[11px] text-slate-500">Date d'édition : {formatDate(new Date().toISOString().split('T')[0])}</div>
            <div className="text-[11px] font-semibold text-amber-800 flex items-center justify-end gap-1">
              <Zap className="h-3 w-3" /> Service Énergie Quai
            </div>
          </div>
        </div>

        <div className="mt-4 text-center bg-amber-50 py-2 border border-amber-300 rounded">
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900">
            FICHE DE CONSOMMATION D’ÉNERGIE ÉLECTRIQUE
          </h2>
        </div>
      </div>

      {/* Client & Vessel Information */}
      <div className="grid grid-cols-2 gap-4 mb-6 border border-slate-300 rounded p-3.5 bg-slate-50 text-xs sm:text-sm">
        <div className="space-y-1.5 border-r border-slate-200 pr-3">
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Code Client :</span>
            <span className="font-bold text-slate-900 font-mono">{movement.clientCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Propriétaire :</span>
            <span className="font-bold text-slate-900">{movement.ownerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Téléphone :</span>
            <span className="font-semibold text-slate-900">{movement.phone || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Adresse :</span>
            <span className="font-semibold text-slate-900">{movement.address || '—'}</span>
          </div>
        </div>

        <div className="space-y-1.5 pl-2">
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Embarcation :</span>
            <span className="font-bold text-slate-900">{movement.boatName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Immatriculation :</span>
            <span className="font-bold text-slate-900 font-mono">{movement.registrationNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Port d'attache :</span>
            <span className="font-semibold text-slate-900">{movement.port}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 font-medium">Période séjour :</span>
            <span className="font-semibold text-slate-900">
              Du {formatDate(movement.arrivalDate)} au {movement.departureDate ? formatDate(movement.departureDate) : 'EN COURS'}
            </span>
          </div>
        </div>
      </div>

      {/* Electricity Register Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center justify-between">
          <span>Registre des Branchements Électriques Effectués</span>
          <span className="text-slate-500 font-normal normal-case">
            {movement.electricityEntries.length} branchement(s) enregistré(s)
          </span>
        </h3>

        <div className="border border-slate-400 rounded overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800 text-white font-semibold">
              <tr>
                <th className="p-2.5">N° Bon</th>
                <th className="p-2.5">Date</th>
                <th className="p-2.5 text-center">Heure Br.</th>
                <th className="p-2.5 text-center">Heure Débr.</th>
                <th className="p-2.5 text-center">Durée</th>
                <th className="p-2.5">Type de Formule</th>
                <th className="p-2.5 text-right">Montant (DA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {movement.electricityEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                    Aucune consommation d'énergie électrique enregistrée pour cette embarcation.
                  </td>
                </tr>
              ) : (
                movement.electricityEntries.map((entry, idx) => (
                  <tr key={entry.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2.5 font-mono font-medium text-slate-800">{entry.voucherNumber || `BE-${idx + 1}`}</td>
                    <td className="p-2.5">{formatDate(entry.date)}</td>
                    <td className="p-2.5 text-center">{entry.plugTime || '—'}</td>
                    <td className="p-2.5 text-center">{entry.unplugTime || '—'}</td>
                    <td className="p-2.5 text-center font-medium">
                      {entry.durationHours ? `${entry.durationHours} h` : '—'}
                    </td>
                    <td className="p-2.5">
                      <span className="font-semibold">{entry.type}</span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Electricity Box */}
        <div className="mt-4 p-3.5 bg-amber-500 text-slate-950 rounded border border-amber-600 flex justify-between items-center shadow-sm">
          <div className="text-xs uppercase font-extrabold tracking-wider">
            TOTAL ÉLECTRICITÉ (HORS TAXES)
          </div>
          <div className="text-xl font-black font-mono">
            {formatCurrency(electricityTotal)}
          </div>
        </div>

        {/* Mandatory Legal Exemption Mention */}
        <div className="mt-3 p-2.5 bg-slate-100 border border-slate-300 rounded text-center text-xs font-semibold text-slate-800">
          « Facturation hors taxes — TVA et timbre non applicables. »
        </div>
      </div>

      {/* Signature & Validation Box */}
      <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 mt-6 text-xs">
        <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between">
          <div className="font-bold text-slate-700 text-center uppercase">Visa de l'Agent Technique / Électricien Portuaire</div>
          <div className="text-center text-slate-400 text-[10px]">Date, visa & signature</div>
        </div>
        <div className="border border-slate-300 rounded p-3 h-28 flex flex-col justify-between">
          <div className="font-bold text-slate-700 text-center uppercase">Émargement du Client / Propriétaire</div>
          <div className="text-center text-slate-400 text-[10px]">Bon pour accord consommation</div>
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] text-slate-400 border-t pt-2">
        SGPP — Société de Gestion des Ports de Pêche et de Plaisance • Unité de Tipaza • Registre Énergie Quai
      </div>
    </div>
  );
};
