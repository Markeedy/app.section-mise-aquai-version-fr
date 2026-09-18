import React, { useState } from 'react';
import { Movement } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import { Search, Eye, Edit2, Printer, FileText, Zap, History, MapPin, CheckCircle, Ship, Calendar, X } from 'lucide-react';

interface MovementHistoryProps {
  movements: Movement[];
  onConsultMovement: (movement: Movement) => void;
  onEditMovement: (movement: Movement) => void;
  onPrintCareening: (movement: Movement) => void;
  onPrintElectricity: (movement: Movement) => void;
}

export const MovementHistory: React.FC<MovementHistoryProps> = ({
  movements,
  onConsultMovement,
  onEditMovement,
  onPrintCareening,
  onPrintElectricity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TERMINÉE' | 'EN COURS'>('ALL');
  const [portFilter, setPortFilter] = useState('ALL');
  const [selectedForDetail, setSelectedForDetail] = useState<Movement | null>(null);

  const filteredMovements = movements.filter((m) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      m.clientCode.toLowerCase().includes(term) ||
      m.ownerName.toLowerCase().includes(term) ||
      m.boatName.toLowerCase().includes(term) ||
      m.registrationNumber.toLowerCase().includes(term) ||
      m.port.toLowerCase().includes(term) ||
      m.phone.includes(term);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesPort = portFilter === 'ALL' || m.port === portFilter;

    return matchesSearch && matchesStatus && matchesPort;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-900 flex items-center justify-center text-white">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              HISTORIQUE DES MOUVEMENTS & FACTURATIONS
            </h2>
            <p className="text-xs text-slate-500">
              Registre des dossiers de carénage, grue et électricité de l'Unité de Tipaza
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start md:self-auto">
          Total archivé : <span className="font-bold text-slate-900">{movements.length}</span> dossier(s)
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="search-history-input"
            type="text"
            placeholder="Rechercher un client, propriétaire, embarcation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <select
            id="filter-history-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full py-2 px-3 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="TERMINÉE">Clôturés / Terminés</option>
            <option value="EN COURS">En cours</option>
          </select>
        </div>

        <div>
          <select
            id="filter-history-port"
            value={portFilter}
            onChange={(e) => setPortFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="ALL">Tous les ports</option>
            <option value="Tipaza">Tipaza</option>
            <option value="Cherchell">Cherchell</option>
            <option value="Bouharoun">Bouharoun</option>
            <option value="Gouraya">Gouraya</option>
            <option value="Khemisti">Khemisti</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-800 text-slate-200 font-semibold text-[11px] sm:text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Code Client</th>
                <th className="p-3">Propriétaire</th>
                <th className="p-3">Embarcation</th>
                <th className="p-3">Immatriculation</th>
                <th className="p-3 text-center">Surface</th>
                <th className="p-3 text-center">Mise à quai</th>
                <th className="p-3 text-center">Mise à l'eau</th>
                <th className="p-3 text-center">Jours</th>
                <th className="p-3 text-center">Grue</th>
                <th className="p-3 text-center">Électricité</th>
                <th className="p-3 text-right">Montant Global</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400">
                    <Ship className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    Aucun mouvement trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const fin = m.financialSummary;
                  const elecTotal = m.electricityEntries.reduce((s, e) => s + (e.amount || 0), 0);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {m.clientCode}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{m.ownerName}</div>
                        <div className="text-[11px] text-slate-500">{m.phone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{m.boatName}</div>
                        <div className="text-[10px] text-slate-500">{m.port} • {m.boatType}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {m.registrationNumber}
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-800">
                        {m.surface} m²
                      </td>
                      <td className="p-3 text-center whitespace-nowrap text-slate-700">
                        {formatDate(m.arrivalDate)}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {m.departureDate ? (
                          <span className="font-medium text-slate-900">{formatDate(m.departureDate)}</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-900">
                            EN COURS
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-800">
                        {fin?.stayDays || '—'}
                      </td>
                      <td className="p-3 text-center">
                        {m.craneAccess ? (
                          <span className="text-emerald-700 font-bold text-xs">OUI</span>
                        ) : (
                          <span className="text-slate-400 text-xs">NON</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {elecTotal > 0 ? (
                          <span className="text-amber-800 font-semibold">{formatCurrency(elecTotal)}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-slate-950">
                        {fin ? formatCurrency(fin.grandTotal) : '—'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            id={`btn-consult-${m.id}`}
                            onClick={() => setSelectedForDetail(m)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 rounded hover:bg-slate-100"
                            title="Consulter le détail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            id={`btn-edit-${m.id}`}
                            onClick={() => onEditMovement(m)}
                            className="p-1.5 text-slate-600 hover:text-amber-700 rounded hover:bg-slate-100"
                            title="Modifier"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            id={`btn-print-careen-${m.id}`}
                            onClick={() => onPrintCareening(m)}
                            className="p-1.5 text-slate-600 hover:text-sky-700 rounded hover:bg-slate-100"
                            title="Imprimer Fiche Carénage"
                          >
                            <Printer className="h-4 w-4 text-sky-700" />
                          </button>

                          {m.electricityEntries.length > 0 && (
                            <button
                              id={`btn-print-elec-${m.id}`}
                              onClick={() => onPrintElectricity(m)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 rounded hover:bg-slate-100"
                              title="Imprimer Fiche Électricité"
                            >
                              <Zap className="h-4 w-4 text-amber-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consultation Modal */}
      {selectedForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full p-6 my-8 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">
                  SGPP • UNITÉ DE TIPAZA • PORT DE {selectedForDetail.port.toUpperCase()}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Dossier Mouvement N° {selectedForDetail.id}
                </h3>
              </div>
              <button
                id="btn-close-detail-modal"
                onClick={() => setSelectedForDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Vessel & Client info summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <div><span className="text-slate-500">Code Client :</span> <span className="font-bold font-mono text-slate-900">{selectedForDetail.clientCode}</span></div>
                <div><span className="text-slate-500">Propriétaire :</span> <span className="font-bold text-slate-900">{selectedForDetail.ownerName}</span></div>
                <div><span className="text-slate-500">Téléphone :</span> <span className="font-medium text-slate-900">{selectedForDetail.phone}</span></div>
                <div><span className="text-slate-500">Adresse :</span> <span className="font-medium text-slate-900">{selectedForDetail.address}</span></div>
              </div>
              <div className="space-y-1">
                <div><span className="text-slate-500">Embarcation :</span> <span className="font-bold text-slate-900">{selectedForDetail.boatName}</span></div>
                <div><span className="text-slate-500">Immatriculation :</span> <span className="font-bold font-mono text-slate-900">{selectedForDetail.registrationNumber}</span></div>
                <div><span className="text-slate-500">Type / Matériau :</span> <span className="text-slate-900">{selectedForDetail.boatType} ({selectedForDetail.boatCategory})</span></div>
                <div><span className="text-slate-500">Surface Occupée :</span> <span className="font-bold text-sky-900">{selectedForDetail.surface} m² ({selectedForDetail.length}m × {selectedForDetail.width}m)</span></div>
              </div>
            </div>

            {/* Dates & Billing */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white border rounded">
                <div className="text-slate-500">Mise à quai</div>
                <div className="font-bold text-slate-900">{formatDate(selectedForDetail.arrivalDate)}</div>
              </div>
              <div className="p-2 bg-white border rounded">
                <div className="text-slate-500">Mise à l'eau</div>
                <div className="font-bold text-slate-900">{selectedForDetail.departureDate ? formatDate(selectedForDetail.departureDate) : 'EN COURS'}</div>
              </div>
              <div className="p-2 bg-white border rounded">
                <div className="text-slate-500">Nombre de jours</div>
                <div className="font-bold text-sky-800">{selectedForDetail.financialSummary?.stayDays || '—'} j</div>
              </div>
            </div>

            {/* Financial Details */}
            {selectedForDetail.financialSummary && (
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
                      <td className="p-2 font-medium">Séjour carénage</td>
                      <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.stayAmountHT)}</td>
                      <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.stayTvaAmount)}</td>
                      <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.stayStampAmount)}</td>
                      <td className="p-2 text-right font-mono font-bold bg-slate-50 whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.stayTotal)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2 font-medium">Accès grue</td>
                      <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.craneAmountHT)}</td>
                      <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.craneTvaAmount)}</td>
                      <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.craneStampAmount)}</td>
                      <td className="p-2 text-right font-mono font-bold bg-slate-100 whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.craneTotal)}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2 font-medium">Électricité ({selectedForDetail.electricityEntries.length} branchement(s))</td>
                      <td className="p-2 text-right font-mono whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.electricityTotal)}</td>
                      <td className="p-2 text-right text-slate-400 whitespace-nowrap">—</td>
                      <td className="p-2 text-right text-slate-400 whitespace-nowrap">—</td>
                      <td className="p-2 text-right font-mono font-bold bg-slate-50 whitespace-nowrap">{formatCurrency(selectedForDetail.financialSummary.electricityTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Total and In words */}
            {selectedForDetail.financialSummary && (
              <div className="space-y-1.5">
                <div className="p-3 bg-slate-900 text-white rounded-lg flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                    MONTANT GLOBAL ENCAISSÉ
                  </span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {formatCurrency(selectedForDetail.financialSummary.grandTotal)}
                  </span>
                </div>
                <div className="text-xs text-slate-600 italic bg-slate-100 p-2 rounded border border-slate-200">
                  <span className="font-bold not-italic">En toutes lettres : </span>
                  {selectedForDetail.financialSummary.grandTotalInWords}.
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
              <button
                id="btn-print-careen-from-detail"
                onClick={() => {
                  onPrintCareening(selectedForDetail);
                  setSelectedForDetail(null);
                }}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4" />
                <span>Imprimer Fiche Carénage</span>
              </button>

              {selectedForDetail.electricityEntries.length > 0 && (
                <button
                  id="btn-print-elec-from-detail"
                  onClick={() => {
                    onPrintElectricity(selectedForDetail);
                    setSelectedForDetail(null);
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Zap className="h-4 w-4" />
                  <span>Imprimer Fiche Électricité</span>
                </button>
              )}

              <button
                id="btn-close-detail"
                onClick={() => setSelectedForDetail(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
