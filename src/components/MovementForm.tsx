import React, { useState, useEffect } from 'react';
import { Movement, BoatType, BoatCategory, Port, ClientProfile } from '../types';
import {
  calculateSurface,
  calculateDaysBetween,
  calculateFinancialSummary,
  formatCurrency,
  formatDate,
} from '../utils/calculations';
import { generateMovementId } from '../utils/storage';
import {
  Anchor,
  Save,
  RotateCcw,
  Printer,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Ship,
  Zap,
  Info,
  Check,
} from 'lucide-react';

interface MovementFormProps {
  currentMovement: Movement | null;
  clientProfiles: ClientProfile[];
  onSaveMovement: (movement: Movement) => void;
  onDeleteMovement: (movementId: string) => void;
  onNewMovement: () => void;
  onPrintCareening: (movement: Movement) => void;
  onPrintElectricity: (movement: Movement) => void;
  onNavigateToElectricity: (movement: Movement) => void;
  allMovements: Movement[];
  onSelectExistingMovement: (movement: Movement) => void;
}

export const MovementForm: React.FC<MovementFormProps> = ({
  currentMovement,
  clientProfiles,
  onSaveMovement,
  onDeleteMovement,
  onNewMovement,
  onPrintCareening,
  onPrintElectricity,
  onNavigateToElectricity,
  allMovements,
  onSelectExistingMovement,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Form Fields
  const [movementId, setMovementId] = useState('');
  const [clientCode, setClientCode] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [boatName, setBoatName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [boatType, setBoatType] = useState<BoatType>('Sardinier');
  const [boatCategory, setBoatCategory] = useState<BoatCategory>('Bois');
  const [port, setPort] = useState<Port>('Tipaza');
  const [length, setLength] = useState<number | string>(10.0);
  const [width, setWidth] = useState<number | string>(3.5);

  const [arrivalDate, setArrivalDate] = useState(today);
  const [departureDate, setDepartureDate] = useState<string>('');
  const [status, setStatus] = useState<'EN COURS' | 'TERMINÉE'>('EN COURS');
  const [craneAccess, setCraneAccess] = useState<boolean>(true);
  const [electricityEntries, setElectricityEntries] = useState(currentMovement?.electricityEntries || []);

  const [quickSearchTerm, setQuickSearchTerm] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing movement when changed
  useEffect(() => {
    if (currentMovement) {
      setMovementId(currentMovement.id);
      setClientCode(currentMovement.clientCode);
      setOwnerName(currentMovement.ownerName);
      setPhone(currentMovement.phone || '');
      setAddress(currentMovement.address || '');

      setBoatName(currentMovement.boatName);
      setRegistrationNumber(currentMovement.registrationNumber);
      setBoatType(currentMovement.boatType);
      setBoatCategory(currentMovement.boatCategory);
      setPort(currentMovement.port);
      setLength(currentMovement.length);
      setWidth(currentMovement.width);

      setArrivalDate(currentMovement.arrivalDate);
      setDepartureDate(currentMovement.departureDate || '');
      setStatus(currentMovement.status);
      setCraneAccess(currentMovement.craneAccess);
      setElectricityEntries(currentMovement.electricityEntries || []);
      setErrorMessage('');
      setSuccessMessage('');
    } else {
      resetFormToNew();
    }
  }, [currentMovement]);

  const resetFormToNew = () => {
    setMovementId(generateMovementId());
    setClientCode(`CL-${Math.floor(100 + Math.random() * 900)}`);
    setOwnerName('');
    setPhone('');
    setAddress('');
    setBoatName('');
    setRegistrationNumber('');
    setBoatType('Sardinier');
    setBoatCategory('Bois');
    setPort('Tipaza');
    setLength(10.0);
    setWidth(3.5);
    setArrivalDate(today);
    setDepartureDate('');
    setStatus('EN COURS');
    setCraneAccess(true);
    setElectricityEntries([]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Surface calculation
  const parsedLength = typeof length === 'number' ? length : parseFloat(length) || 0;
  const parsedWidth = typeof width === 'number' ? width : parseFloat(width) || 0;
  const surface = calculateSurface(parsedLength, parsedWidth);

  // Financial summary live computation
  const financialSummary = calculateFinancialSummary(
    surface,
    arrivalDate,
    departureDate || null,
    craneAccess,
    electricityEntries
  );

  // Auto-fill when typing client code or selecting existing client
  const handleClientCodeChange = (code: string) => {
    setClientCode(code);
    const existing = clientProfiles.find(
      (c) => c.clientCode.toLowerCase().trim() === code.toLowerCase().trim()
    );
    if (existing) {
      setOwnerName(existing.ownerName);
      setPhone(existing.phone);
      setAddress(existing.address);
      if (existing.boats.length > 0) {
        const primaryBoat = existing.boats[0];
        setBoatName(primaryBoat.boatName);
        setRegistrationNumber(primaryBoat.registrationNumber);
        setBoatType(primaryBoat.boatType);
        setBoatCategory(primaryBoat.boatCategory);
        setPort(primaryBoat.port);
        setLength(primaryBoat.length);
        setWidth(primaryBoat.width);
      }
    }
  };

  const handleSelectClientProfile = (client: ClientProfile) => {
    setClientCode(client.clientCode);
    setOwnerName(client.ownerName);
    setPhone(client.phone);
    setAddress(client.address);
    if (client.boats && client.boats.length > 0) {
      const b = client.boats[0];
      setBoatName(b.boatName);
      setRegistrationNumber(b.registrationNumber);
      setBoatType(b.boatType);
      setBoatCategory(b.boatCategory);
      setPort(b.port);
      setLength(b.length);
      setWidth(b.width);
    }
  };

  // Validation
  const validateForm = (isFinalizing: boolean = false): boolean => {
    setErrorMessage('');
    if (!clientCode.trim()) {
      setErrorMessage('Le code client est obligatoire.');
      return false;
    }
    if (!ownerName.trim()) {
      setErrorMessage('Le nom du propriétaire est obligatoire.');
      return false;
    }
    if (!phone.trim()) {
      setErrorMessage('Le numéro de téléphone est obligatoire.');
      return false;
    }
    if (!address.trim()) {
      setErrorMessage("L'adresse du propriétaire est obligatoire.");
      return false;
    }
    if (!boatName.trim()) {
      setErrorMessage("Le nom de l'embarcation est obligatoire.");
      return false;
    }
    if (!registrationNumber.trim()) {
      setErrorMessage("L'immatriculation de l'embarcation est obligatoire.");
      return false;
    }
    if (parsedLength <= 0 || parsedWidth <= 0) {
      setErrorMessage('La longueur et la largeur doivent être strictement supérieures à zéro.');
      return false;
    }
    if (!arrivalDate) {
      setErrorMessage('La date de mise à quai est obligatoire.');
      return false;
    }

    if (isFinalizing) {
      if (!departureDate) {
        setErrorMessage("La date de mise à l'eau est obligatoire pour finaliser le dossier.");
        return false;
      }
      if (new Date(departureDate) < new Date(arrivalDate)) {
        setErrorMessage("La date de mise à l'eau ne peut pas être antérieure à la date de mise à quai.");
        return false;
      }
    }

    return true;
  };

  const handleSaveQuayArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    const id = movementId || generateMovementId();
    const newMovement: Movement = {
      id,
      clientCode: clientCode.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      boatName: boatName.trim(),
      registrationNumber: registrationNumber.trim(),
      boatType,
      boatCategory,
      port,
      length: parsedLength,
      width: parsedWidth,
      surface,
      arrivalDate,
      departureDate: departureDate || null,
      status: departureDate ? 'TERMINÉE' : 'EN COURS',
      craneAccess,
      electricityEntries,
      financialSummary: calculateFinancialSummary(
        surface,
        arrivalDate,
        departureDate || null,
        craneAccess,
        electricityEntries
      ),
      createdAt: currentMovement?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveMovement(newMovement);
    setSuccessMessage('Mise à quai enregistrée avec succès sous le statut EN COURS.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleFinalizeAndPay = () => {
    if (!departureDate) {
      setDepartureDate(today);
    }
    if (!validateForm(true)) return;

    const id = movementId || generateMovementId();
    const finalizedSummary = calculateFinancialSummary(
      surface,
      arrivalDate,
      departureDate || today,
      craneAccess,
      electricityEntries
    );

    const finalizedMovement: Movement = {
      id,
      clientCode: clientCode.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      boatName: boatName.trim(),
      registrationNumber: registrationNumber.trim(),
      boatType,
      boatCategory,
      port,
      length: parsedLength,
      width: parsedWidth,
      surface,
      arrivalDate,
      departureDate: departureDate || today,
      status: 'TERMINÉE',
      craneAccess,
      electricityEntries,
      financialSummary: finalizedSummary,
      createdAt: currentMovement?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveMovement(finalizedMovement);
  };

  const handleDelete = () => {
    if (!movementId) return;
    if (window.confirm(`Confirmez-vous la suppression définitive du dossier ${movementId} ?`)) {
      onDeleteMovement(movementId);
      resetFormToNew();
    }
  };

  // Filter search results
  const searchResults = allMovements.filter((m) => {
    if (!quickSearchTerm.trim()) return false;
    const term = quickSearchTerm.toLowerCase();
    return (
      m.clientCode.toLowerCase().includes(term) ||
      m.ownerName.toLowerCase().includes(term) ||
      m.boatName.toLowerCase().includes(term) ||
      m.registrationNumber.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Action Buttons Bar */}
      <div className="action-bar bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-action-new"
            type="button"
            onClick={() => {
              resetFormToNew();
              onNewMovement();
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4 text-sky-400" />
            <span>Nouveau</span>
          </button>

          <button
            id="btn-action-save-quai"
            type="button"
            onClick={handleSaveQuayArrival}
            className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer Mise à Quai</span>
          </button>

          <button
            id="btn-action-reset"
            type="button"
            onClick={resetFormToNew}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 border border-slate-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Réinitialiser</span>
          </button>

          {currentMovement && (
            <button
              id="btn-action-delete"
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 border border-red-200 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Supprimer</span>
            </button>
          )}
        </div>

        {/* Right: Print & Quick Search */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {currentMovement && (
            <div className="flex items-center gap-1.5">
              <button
                id="btn-action-print-careen"
                type="button"
                onClick={() => onPrintCareening(currentMovement)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                title="Imprimer la Fiche de Mouvement Carénage"
              >
                <Printer className="h-3.5 w-3.5 text-sky-300" />
                <span className="hidden sm:inline">Imprimer Fiche Carénage</span>
                <span className="sm:hidden">Carénage</span>
              </button>

              <button
                id="btn-action-print-elec"
                type="button"
                onClick={() => onPrintElectricity(currentMovement)}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs"
                title="Imprimer la Fiche de Consommation Électrique"
              >
                <Zap className="h-3.5 w-3.5 text-amber-200" />
                <span className="hidden sm:inline">Fiche Électricité</span>
                <span className="sm:hidden">Élec.</span>
              </button>
            </div>
          )}

          {/* Search Dropdown */}
          <div className="relative">
            <div className="flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                id="quick-search-dossier"
                type="text"
                placeholder="Rechercher dossier / client..."
                value={quickSearchTerm}
                onChange={(e) => {
                  setQuickSearchTerm(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                onFocus={() => setIsSearchDropdownOpen(true)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 w-44 sm:w-56"
              />
            </div>

            {isSearchDropdownOpen && quickSearchTerm.trim() && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40 max-h-60 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b">
                  Dossiers correspondants ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">Aucun résultat</div>
                ) : (
                  searchResults.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectExistingMovement(m);
                        setIsSearchDropdownOpen(false);
                        setQuickSearchTerm('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-sky-50 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-900 font-mono">{m.clientCode}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          m.status === 'EN COURS' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-medium">{m.ownerName}</div>
                      <div className="text-[11px] text-slate-500">{m.boatName} • {m.registrationNumber} • {m.port}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Form Sections */}
      <form onSubmit={handleSaveQuayArrival} className="space-y-4">
        
        {/* Section 1 & 2: Client Info & Boat Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* SECTION 1: INFORMATIONS DU CLIENT / PROPRIÉTAIRE */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-wide flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
                <span>Informations du Client / Propriétaire</span>
              </h2>
              {clientProfiles.length > 0 && (
                <div className="text-[11px] text-slate-500">
                  <select
                    id="select-known-client"
                    onChange={(e) => {
                      const found = clientProfiles.find((c) => c.clientCode === e.target.value);
                      if (found) handleSelectClientProfile(found);
                    }}
                    className="text-[11px] p-1 border border-slate-300 rounded bg-slate-50"
                  >
                    <option value="">Rappeler client existant...</option>
                    {clientProfiles.map((c) => (
                      <option key={c.clientCode} value={c.clientCode}>
                        {c.clientCode} — {c.ownerName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Code Client */}
              <div>
                <label htmlFor="input-client-code" className="block text-xs font-bold text-slate-700 mb-1">
                  Code Client <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-client-code"
                  type="text"
                  placeholder="Ex: CL-001"
                  value={clientCode}
                  onChange={(e) => handleClientCodeChange(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-mono font-bold"
                  required
                />
              </div>

              {/* Nom du propriétaire */}
              <div>
                <label htmlFor="input-owner-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nom du propriétaire <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-owner-name"
                  type="text"
                  placeholder="Nom et prénom du propriétaire"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-semibold"
                  required
                />
              </div>

              {/* N° Telephone (DIRECTEMENT sous le nom du propriétaire) */}
              <div>
                <label htmlFor="input-phone" className="block text-xs font-bold text-slate-700 mb-1">
                  N° Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-phone"
                  type="tel"
                  placeholder="Ex: 0550 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                />
              </div>

              {/* Adresse (champ clairement visible et prioritaire) */}
              <div>
                <label htmlFor="input-address" className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse (Prioritaire) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="input-address"
                  rows={2}
                  placeholder="Adresse complète du propriétaire / domicile ou siège"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: INFORMATIONS DE L’EMBARCATION */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-wide flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
                <span>Informations de l’Embarcation</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Spécifications techniques</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nom de l'embarcation */}
              <div>
                <label htmlFor="input-boat-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de l'embarcation <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-boat-name"
                  type="text"
                  placeholder="Ex: El Manar II"
                  value={boatName}
                  onChange={(e) => setBoatName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-bold"
                  required
                />
              </div>

              {/* Immatriculation */}
              <div>
                <label htmlFor="input-registration" className="block text-xs font-bold text-slate-700 mb-1">
                  Immatriculation <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-registration"
                  type="text"
                  placeholder="Ex: TIP-4521"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white font-mono uppercase"
                  required
                />
              </div>

              {/* Type d'embarcation */}
              <div>
                <label htmlFor="select-boat-type" className="block text-xs font-bold text-slate-700 mb-1">
                  Type d'embarcation
                </label>
                <select
                  id="select-boat-type"
                  value={boatType}
                  onChange={(e) => setBoatType(e.target.value as BoatType)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Sardinier">Sardinier</option>
                  <option value="Petit métier">Petit métier</option>
                  <option value="Plaisance">Plaisance</option>
                  <option value="Pêche">Pêche</option>
                  <option value="Chalutier">Chalutier</option>
                </select>
              </div>

              {/* Catégorie */}
              <div>
                <label htmlFor="select-boat-category" className="block text-xs font-bold text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  id="select-boat-category"
                  value={boatCategory}
                  onChange={(e) => setBoatCategory(e.target.value as BoatCategory)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Acier">Acier</option>
                  <option value="Bois">Bois</option>
                  <option value="Polyester">Polyester</option>
                </select>
              </div>

              {/* Port */}
              <div className="sm:col-span-2">
                <label htmlFor="select-port" className="block text-xs font-bold text-slate-700 mb-1">
                  Port d'attache
                </label>
                <select
                  id="select-port"
                  value={port}
                  onChange={(e) => setPort(e.target.value as Port)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-sky-50/50 font-semibold"
                >
                  <option value="Tipaza">Port de Tipaza</option>
                  <option value="Cherchell">Port de Cherchell</option>
                  <option value="Bouharoun">Port de Bouharoun</option>
                  <option value="Gouraya">Port de Gouraya</option>
                  <option value="Khemisti">Port de Khemisti</option>
                </select>
              </div>

              {/* Longueur */}
              <div>
                <label htmlFor="input-length" className="block text-xs font-bold text-slate-700 mb-1">
                  Longueur (m) <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-length"
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                />
              </div>

              {/* Largeur */}
              <div>
                <label htmlFor="input-width" className="block text-xs font-bold text-slate-700 mb-1">
                  Largeur (m) <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-width"
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                />
              </div>
            </div>

            {/* Surface occupée calculée automatiquement */}
            <div className="mt-3 p-2.5 bg-sky-50 border border-sky-200 rounded-lg flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900">
                Surface occupée calculée (L × l) :
              </span>
              <span className="text-sm font-extrabold text-sky-950 font-mono">
                {surface} m²
              </span>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: Dates, Séjour, Accès Grue & Électricité (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* SECTION 3: MISE À QUAI & SÉJOUR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">3</span>
              <span>Mise à Quai & Séjour</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="input-arrival-date" className="block text-xs font-bold text-slate-700 mb-1">
                  Date de mise à quai <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-arrival-date"
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label htmlFor="input-departure-date" className="block text-xs font-bold text-slate-700 mb-1">
                  Date de mise à l'eau (Pour clôture)
                </label>
                <input
                  id="input-departure-date"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Laisser vide pour enregistrer en « EN COURS ».
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                <span className="font-semibold text-slate-600">Nombre de jours calculé :</span>
                <span className="font-bold text-slate-900 font-mono text-sm whitespace-nowrap">
                  {financialSummary.stayDays} jour(s)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-slate-600">Statut du dossier :</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                  departureDate ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {departureDate ? 'TERMINÉE' : 'EN COURS'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: PRESTATIONS ANNEXES (GRUE & ÉLECTRICITÉ) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">4</span>
              <span>Prestations Annexes</span>
            </h2>

            {/* Accès Grue Switch */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="crane-toggle" className="text-xs font-bold text-slate-800">
                  ACCÈS GRUE :
                </label>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-crane-no"
                    type="button"
                    onClick={() => setCraneAccess(false)}
                    className={`px-3 py-1 text-xs font-bold rounded ${
                      !craneAccess ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    NON
                  </button>
                  <button
                    id="btn-crane-yes"
                    type="button"
                    onClick={() => setCraneAccess(true)}
                    className={`px-3 py-1 text-xs font-bold rounded ${
                      craneAccess ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    OUI
                  </button>
                </div>
              </div>

              {craneAccess ? (
                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200 font-mono">
                  <div className="flex justify-between"><span>HT :</span><span className="whitespace-nowrap">4 201,68 DA</span></div>
                  <div className="flex justify-between"><span>TVA (19%) :</span><span className="whitespace-nowrap">798,32 DA</span></div>
                  <div className="flex justify-between"><span>Timbre (1%) :</span><span className="whitespace-nowrap">50,00 DA</span></div>
                  <div className="flex justify-between font-bold text-slate-900 pt-0.5 border-t border-slate-200">
                    <span>Total Grue :</span><span className="whitespace-nowrap">5 050,00 DA</span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">Prestation grue désactivée (0,00 DA)</div>
              )}
            </div>

            {/* Consommation Électrique Summary */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-600" /> Électricité
                </span>
                <span className="text-xs font-bold text-amber-900 font-mono whitespace-nowrap">
                  {formatCurrency(financialSummary.electricityTotal)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {electricityEntries.length} branchement(s) enregistré(s) • Facturation Hors Taxes
              </p>
              
              {currentMovement && (
                <button
                  id="btn-goto-elec-from-form"
                  type="button"
                  onClick={() => onNavigateToElectricity(currentMovement)}
                  className="w-full mt-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Zap className="h-3 w-3" />
                  <span>Gérer les branchements</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* SECTION 5: TABLEAU FINAL D’ENCAISSEMENT COMPACT */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-wide flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">5</span>
              <span>Tableau Final d'Encaissement</span>
            </h2>
            <span className="text-[11px] text-slate-500">Tarifs réglementaires SGPP</span>
          </div>

          <div className="border border-slate-300 rounded-lg overflow-x-auto text-xs sm:text-sm">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-slate-800 text-white font-semibold">
                <tr>
                  <th className="p-2.5">Prestation</th>
                  <th className="p-2.5 text-right whitespace-nowrap">HT</th>
                  <th className="p-2.5 text-right whitespace-nowrap">TVA</th>
                  <th className="p-2.5 text-right whitespace-nowrap">Timbre</th>
                  <th className="p-2.5 text-right bg-slate-900 whitespace-nowrap">TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Séjour carénage */}
                <tr className="bg-white">
                  <td className="p-2.5 font-medium text-slate-900">
                    Séjour carénage ({financialSummary.stayDays}&nbsp;j × {financialSummary.surface}&nbsp;m² × 25&nbsp;DA)
                  </td>
                  <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(financialSummary.stayAmountHT)}</td>
                  <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(financialSummary.stayTvaAmount)}</td>
                  <td className="p-2.5 text-right font-mono whitespace-nowrap">
                    {formatCurrency(financialSummary.stayStampAmount)} ({financialSummary.stayStampRate * 100}&nbsp;%)
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                    {formatCurrency(financialSummary.stayTotal)}
                  </td>
                </tr>

                {/* Accès grue */}
                <tr className="bg-slate-50/60">
                  <td className="p-2.5 font-medium text-slate-900">
                    Accès grue {craneAccess ? '(Forfait OUI)' : '(NON)'}
                  </td>
                  <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(financialSummary.craneAmountHT)}</td>
                  <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(financialSummary.craneTvaAmount)}</td>
                  <td className="p-2.5 text-right font-mono whitespace-nowrap">
                    {craneAccess ? `${formatCurrency(financialSummary.craneStampAmount)} (1\u00A0%)` : `0,00\u00A0DA`}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 bg-slate-100 whitespace-nowrap">
                    {formatCurrency(financialSummary.craneTotal)}
                  </td>
                </tr>

                {/* Électricité */}
                <tr className="bg-white">
                  <td className="p-2.5 font-medium text-slate-900">
                    Électricité ({electricityEntries.length} branchement(s) — HT)
                  </td>
                  <td className="p-2.5 text-right font-mono whitespace-nowrap">{formatCurrency(financialSummary.electricityTotal)}</td>
                  <td className="p-2.5 text-right text-slate-400 font-semibold whitespace-nowrap">— TVA</td>
                  <td className="p-2.5 text-right text-slate-400 font-semibold whitespace-nowrap">— Timbre</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900 bg-slate-50 whitespace-nowrap">
                    {formatCurrency(financialSummary.electricityTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-700">
              MONTANT GLOBAL À ENCAISSER :
            </span>
            <span className="text-base sm:text-lg font-black text-slate-950 font-mono whitespace-nowrap">
              {formatCurrency(financialSummary.grandTotal)}
            </span>
          </div>
        </div>

        {/* SECTION 6 (EN DERNIER): CALCUL FINAL DU DOSSIER & ACTIONS D'ENCAISSEMENT */}
        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                CALCUL FINAL DU DOSSIER
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight whitespace-nowrap mt-0.5">
                {formatCurrency(financialSummary.grandTotal)}
              </div>
            </div>
            <div className="text-right sm:max-w-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">En toutes lettres :</span>
              <p className="text-xs text-slate-200 italic font-medium">
                {financialSummary.grandTotalInWords}.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              id="btn-submit-finalize-pay"
              type="button"
              onClick={handleFinalizeAndPay}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>FINALISER & ENCAISSER</span>
            </button>

            <button
              id="btn-submit-save-quay"
              type="submit"
              className="w-full py-3.5 px-4 bg-sky-700 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <Save className="h-4 w-4" />
              <span>ENREGISTRER MISE À QUAI (EN COURS)</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
