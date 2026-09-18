/**
 * SGPP — Société de Gestion des Ports de Pêche et de Plaisance
 * Unité de Tipaza
 * Mini-Application de Gestion des Mouvements de Carénage, Grue et Électricité
 */

import React, { useState, useEffect } from 'react';
import { Movement, ClientProfile, ActiveTab, ElectricityEntry } from './types';
import { getStoredMovements, saveMovements, getClientProfiles } from './utils/storage';
import { calculateFinancialSummary } from './utils/calculations';
import { Header } from './components/Header';
import { MovementForm } from './components/MovementForm';
import { ActiveOperations } from './components/ActiveOperations';
import { ElectricityRegistry } from './components/ElectricityRegistry';
import { MovementHistory } from './components/MovementHistory';
import { PrintMovementSheet } from './components/PrintMovementSheet';
import { PrintElectricitySheet } from './components/PrintElectricitySheet';
import { FinalConfirmationModal } from './components/FinalConfirmationModal';

export default function App() {
  const [movements, setMovements] = useState<Movement[]>(() => getStoredMovements());
  const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>(() => getClientProfiles());
  const [activeTab, setActiveTab] = useState<ActiveTab>('movement');

  // Currently active movement in form
  const [currentMovement, setCurrentMovement] = useState<Movement | null>(null);

  // Selected movement for electricity tab
  const [selectedElecMovementId, setSelectedElecMovementId] = useState<string | null>(null);

  // Print view state
  const [printCareeningMovement, setPrintCareeningMovement] = useState<Movement | null>(null);
  const [printElectricityMovement, setPrintElectricityMovement] = useState<Movement | null>(null);

  // Final confirmation modal
  const [confirmedMovement, setConfirmedMovement] = useState<Movement | null>(null);

  // Sync to storage on movement changes
  useEffect(() => {
    saveMovements(movements);
    setClientProfiles(getClientProfiles());
  }, [movements]);

  // Handle Save Movement
  const handleSaveMovement = (movement: Movement) => {
    const isNew = !movements.some((m) => m.id === movement.id);
    let updated: Movement[];

    if (isNew) {
      updated = [movement, ...movements];
    } else {
      updated = movements.map((m) => (m.id === movement.id ? movement : m));
    }

    setMovements(updated);
    setCurrentMovement(movement);

    // If movement was just finalized (TERMINÉE), trigger the confirmation modal
    if (movement.status === 'TERMINÉE' && movement.departureDate) {
      setConfirmedMovement(movement);
    }
  };

  // Handle Delete Movement
  const handleDeleteMovement = (movementId: string) => {
    const updated = movements.filter((m) => m.id !== movementId);
    setMovements(updated);
    if (currentMovement?.id === movementId) {
      setCurrentMovement(null);
    }
  };

  // Handle Electricity Updates
  const handleUpdateMovementElectricity = (movementId: string, updatedEntries: ElectricityEntry[]) => {
    const updated = movements.map((m) => {
      if (m.id === movementId) {
        const recalculateFin = calculateFinancialSummary(
          m.surface,
          m.arrivalDate,
          m.departureDate,
          m.craneAccess,
          updatedEntries
        );
        return {
          ...m,
          electricityEntries: updatedEntries,
          financialSummary: recalculateFin,
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });

    setMovements(updated);

    // Update currentMovement if it's the same
    if (currentMovement?.id === movementId) {
      const updatedCurr = updated.find((m) => m.id === movementId);
      if (updatedCurr) setCurrentMovement(updatedCurr);
    }
  };

  // Open from Active operations or search
  const handleOpenMovement = (m: Movement) => {
    setCurrentMovement(m);
    setActiveTab('movement');
  };

  // Quick Finalize from active operations table
  const handleQuickFinalize = (m: Movement) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedM: Movement = {
      ...m,
      departureDate: today,
    };
    setCurrentMovement(updatedM);
    setActiveTab('movement');
  };

  // Navigate to Electricity tab with specific movement selected
  const handleNavigateToElectricity = (m: Movement) => {
    setSelectedElecMovementId(m.id);
    setActiveTab('electricity');
  };

  // Active operations count
  const activeCount = movements.filter((m) => m.status === 'EN COURS').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      
      {/* Permanent Official SGPP Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeOperationsCount={activeCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Printable View 1: Fiche de mouvement Carénage */}
        {printCareeningMovement ? (
          <PrintMovementSheet
            movement={printCareeningMovement}
            onBack={() => setPrintCareeningMovement(null)}
          />
        ) : printElectricityMovement ? (
          /* Printable View 2: Fiche de Consommation Électrique */
          <PrintElectricitySheet
            movement={printElectricityMovement}
            onBack={() => setPrintElectricityMovement(null)}
          />
        ) : (
          /* Normal Tab Content */
          <>
            {activeTab === 'movement' && (
              <MovementForm
                currentMovement={currentMovement}
                clientProfiles={clientProfiles}
                onSaveMovement={handleSaveMovement}
                onDeleteMovement={handleDeleteMovement}
                onNewMovement={() => setCurrentMovement(null)}
                onPrintCareening={(m) => setPrintCareeningMovement(m)}
                onPrintElectricity={(m) => setPrintElectricityMovement(m)}
                onNavigateToElectricity={handleNavigateToElectricity}
                allMovements={movements}
                onSelectExistingMovement={handleOpenMovement}
              />
            )}

            {activeTab === 'active_operations' && (
              <ActiveOperations
                movements={movements}
                onOpenMovement={handleOpenMovement}
                onOpenElectricity={handleNavigateToElectricity}
                onNewMovement={() => {
                  setCurrentMovement(null);
                  setActiveTab('movement');
                }}
                onQuickFinalize={handleQuickFinalize}
              />
            )}

            {activeTab === 'electricity' && (
              <ElectricityRegistry
                movements={movements}
                selectedMovementId={selectedElecMovementId || (currentMovement ? currentMovement.id : null)}
                onSelectMovement={(id) => setSelectedElecMovementId(id)}
                onUpdateMovementElectricity={handleUpdateMovementElectricity}
                onPrintElectricitySheet={(m) => setPrintElectricityMovement(m)}
              />
            )}

            {activeTab === 'history' && (
              <MovementHistory
                movements={movements}
                onConsultMovement={handleOpenMovement}
                onEditMovement={handleOpenMovement}
                onPrintCareening={(m) => setPrintCareeningMovement(m)}
                onPrintElectricity={(m) => setPrintElectricityMovement(m)}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 py-3 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            SGPP — Société de Gestion des Ports de Pêche et de Plaisance • Unité de Tipaza
          </div>
          <div className="text-slate-500">
            Gestion Carénage • Accès Grue • Énergie Quai • Système Portuaire
          </div>
        </div>
      </footer>

      {/* Confirmation Modal when a movement is finalized */}
      {confirmedMovement && (
        <FinalConfirmationModal
          movement={confirmedMovement}
          onClose={() => setConfirmedMovement(null)}
          onPrintCareening={() => {
            setPrintCareeningMovement(confirmedMovement);
            setConfirmedMovement(null);
          }}
          onPrintElectricity={() => {
            setPrintElectricityMovement(confirmedMovement);
            setConfirmedMovement(null);
          }}
        />
      )}

    </div>
  );
}
