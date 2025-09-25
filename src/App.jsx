// src/App.jsx - VERSÃO COM SUPORTE A MÚLTIPLOS ALVOS E SELEÇÃO POR ARRASTO

import { useState, useEffect, useRef } from 'react'
import { ToolsPanel } from './components/ToolsPanel'
import { PlateGrid } from './components/PlateGrid'
import { MasterMixCalculator } from './components/MasterMixCalculator'
import { Checklist } from './components/Checklist'
import { Button } from '@/components/ui/button.jsx'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Grid3X3, Calculator, CheckSquare, Upload, Download } from 'lucide-react'
import './App.css'

// Constantes e Dados Iniciais
const INITIAL_CHECKLIST = [ 'Degelar todos os reagentes e mantê-los no gelo', 'Vortexar e centrifugar brevemente todos os reagentes', 'Preparar o Master Mix na bancada conforme a calculadora', 'Homogeneizar o Master Mix e distribuir nos poços', 'Adicionar amostras/padrões/controles nos poços correspondentes', 'Selar a placa com filme adesivo óptico', 'Centrifugar a placa brevemente para remover bolhas', 'Colocar a placa no termociclador e iniciar a corrida' ];
const INITIAL_REAGENTS = [ { name: 'Taq DNA Polimerase', volumePerReaction: 0.2 }, { name: 'Buffer de Reação 10X', volumePerReaction: 2.0 }, { name: 'dNTPs (10mM)', volumePerReaction: 0.4 }, { name: 'Primer Forward (10µM)', volumePerReaction: 0.5 }, { name: 'Primer Reverse (10µM)', volumePerReaction: 0.5 }, { name: 'Água livre de nucleases', volumePerReaction: 16.4 } ];
const INITIAL_TARGETS = [
  { id: 'target-1', name: 'ACTB', color: 'bg-blue-500', textColor: 'text-white' },
  { id: 'target-2', name: 'GAPDH', color: 'bg-green-500', textColor: 'text-white' },
  { id: 'target-3', name: 'NTC', color: 'bg-purple-500', textColor: 'text-white' },
];
const AVAILABLE_COLORS = [
    { color: 'bg-blue-500', textColor: 'text-white' }, { color: 'bg-green-500', textColor: 'text-white' },
    { color: 'bg-red-500', textColor: 'text-white' }, { color: 'bg-yellow-500', textColor: 'text-black' },
    { color: 'bg-purple-500', textColor: 'text-white' }, { color: 'bg-indigo-500', textColor: 'text-white' },
    { color: 'bg-pink-500', textColor: 'text-white' }, { color: 'bg-teal-500', textColor: 'text-white' },
];

function App() {
  // --- ESTADO DA APLICAÇÃO ---
  const [projectName, setProjectName] = useState(() => localStorage.getItem('projectName') || 'Novo Projeto');
  const [plateFormat, setPlateFormat] = useState(() => localStorage.getItem('plateFormat') || '96');
  const [plateData, setPlateData] = useState(() => JSON.parse(localStorage.getItem('plateData')) || {});
  const [currentTab, setCurrentTab] = useState('design');
  
  // Novos estados para gerenciamento de Alvos (Targets)
  const [targets, setTargets] = useState(() => JSON.parse(localStorage.getItem('targets')) || INITIAL_TARGETS);
  const [activeTargetId, setActiveTargetId] = useState(() => localStorage.getItem('activeTargetId') || INITIAL_TARGETS[0].id);

  // Estados para seleção por arrasto
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWells, setDraggedWells] = useState(new Set());

  // ... (resto dos estados que você já tinha)
  const [reagents, setReagents] = useState(() => JSON.parse(localStorage.getItem('reagents')) || INITIAL_REAGENTS);
  const [marginType, setMarginType] = useState(() => localStorage.getItem('marginType') || 'extra');
  const [extraSamples, setExtraSamples] = useState(() => parseInt(localStorage.getItem('extraSamples')) || 2);
  const [extraPercentage, setExtraPercentage] = useState(() => parseInt(localStorage.getItem('extraPercentage')) || 10);
  const [checklistItems, setChecklistItems] = useState(() => JSON.parse(localStorage.getItem('checklistItems')) || INITIAL_CHECKLIST);
  const [completedItems, setCompletedItems] = useState(() => JSON.parse(localStorage.getItem('completedItems')) || []);
  const [editingWellId, setEditingWellId] = useState(null);
  const [editingWellData, setEditingWellData] = useState({ sampleName: '', geneName: '' }); // Atualizado
  const fileInputRef = useRef(null);
  
  // --- EFEITOS (SALVAMENTO AUTOMÁTICO) ---
  useEffect(() => { localStorage.setItem('projectName', projectName); }, [projectName]);
  useEffect(() => { localStorage.setItem('plateFormat', plateFormat); }, [plateFormat]);
  useEffect(() => { localStorage.setItem('plateData', JSON.stringify(plateData)); }, [plateData]);
  useEffect(() => { localStorage.setItem('targets', JSON.stringify(targets)); }, [targets]);
  useEffect(() => { localStorage.setItem('activeTargetId', activeTargetId); }, [activeTargetId]);
  // ... (resto dos useEffects)
  useEffect(() => { localStorage.setItem('reagents', JSON.stringify(reagents)); }, [reagents]);
  useEffect(() => { localStorage.setItem('marginType', marginType); }, [marginType]);
  useEffect(() => { localStorage.setItem('extraSamples', String(extraSamples)); }, [extraSamples]);
  useEffect(() => { localStorage.setItem('extraPercentage', String(extraPercentage)); }, [extraPercentage]);
  useEffect(() => { localStorage.setItem('checklistItems', JSON.stringify(checklistItems)); }, [checklistItems]);
  useEffect(() => { localStorage.setItem('completedItems', JSON.stringify(completedItems)); }, [completedItems]);

  // --- FUNÇÕES DE MANIPULAÇÃO ---
  const getTotalReactions = () => Object.values(plateData).filter(well => well.targetId).length;

  const handleWellDoubleClick = (wellId) => {
    if (plateData[wellId]) {
      setEditingWellId(wellId);
      setEditingWellData({
        sampleName: plateData[wellId].sampleName || '',
      });
    }
  };

  const handleSaveWellDetails = () => {
    if (!editingWellId) return;
    setPlateData(prev => ({ ...prev, [editingWellId]: { ...prev[editingWellId], ...editingWellData }}));
    setEditingWellId(null);
  };
  
  const handleAddTarget = () => {
    const newName = prompt("Digite o nome do novo Gene/Alvo:", `Gene ${targets.length + 1}`);
    if (newName && newName.trim() !== "") {
      const nextColor = AVAILABLE_COLORS[targets.length % AVAILABLE_COLORS.length];
      const newTarget = {
        id: `target-${Date.now()}`,
        name: newName.trim(),
        ...nextColor
      };
      setTargets([...targets, newTarget]);
      setActiveTargetId(newTarget.id);
    }
  };

  // --- Funções para Seleção por Arraste ---
  const handleMouseDown = (wellId) => {
    setIsDragging(true);
    setDraggedWells(new Set([wellId]));
  };

  const handleMouseEnter = (wellId) => {
    if (isDragging) {
      setDraggedWells(prev => new Set(prev).add(wellId));
    }
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const newPlateData = { ...plateData };
    draggedWells.forEach(wellId => {
      newPlateData[wellId] = {
        ...newPlateData[wellId],
        targetId: activeTargetId,
      };
    });
    setPlateData(newPlateData);
    setDraggedWells(new Set());
  };

  // ... (resto das suas funções handle, calculate, import/export)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header> {/* ... seu header ... */} </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList> {/* ... seus Triggers ... */} </TabsList>
          
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ToolsPanel
                  plateFormat={plateFormat}
                  setPlateFormat={setPlateFormat}
                  targets={targets}
                  activeTargetId={activeTargetId}
                  setActiveTargetId={setActiveTargetId}
                  onAddTarget={handleAddTarget}
                  onClearPlate={() => setPlateData({})}
                />
              </div>
              <div className="lg:col-span-3">
                <PlateGrid
                  plateFormat={plateFormat}
                  plateData={plateData}
                  targets={targets}
                  draggedWells={draggedWells}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onMouseUp={handleMouseUp}
                  onWellDoubleClick={handleWellDoubleClick}
                  totalReactions={getTotalReactions()}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* O resto das suas abas (MasterMix, Checklist) continua aqui */}
          <TabsContent value="mastermix">
            {/* ...código da aba MasterMix ... */}
          </TabsContent>
          <TabsContent value="checklist">
            {/* ...código da aba Checklist ... */}
          </TabsContent>

        </Tabs>
      </main>

      {/* Dialog para editar detalhes do poço */}
      <Dialog open={!!editingWellId} onOpenChange={() => setEditingWellId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Poço {editingWellId}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="well-sampleName">Nome da Amostra</Label>
              <Input 
                id="well-sampleName" 
                value={editingWellData.sampleName} 
                onChange={(e) => setEditingWellData(d => ({ ...d, sampleName: e.target.value }))} 
              />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveWellDetails}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App

