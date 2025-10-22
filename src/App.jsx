import { useState, useEffect, useRef } from 'react'; // Removido useCallback
import { ToolsPanel } from './components/ToolsPanel';
import { PlateGrid } from './components/PlateGrid';
import { MasterMixCalculator } from './components/MasterMixCalculator';
import { Checklist } from './components/Checklist';
import { PrintLayout } from './components/PrintLayout';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Grid3X3, Calculator, CheckSquare, Upload, Download, Edit, RotateCcw, Printer } from 'lucide-react'; // Adicionado Printer
import { customAlphabet } from 'nanoid';
import { HexColorPicker } from 'react-colorful';
import './App.css';

const nanoid = customAlphabet('1234567890abcdef', 10);

// ... (Constantes INITIAL_CHECKLIST, INITIAL_REAGENTS, defaultTargets permanecem as mesmas) ...
const INITIAL_CHECKLIST = [
  'Degelar todos os reagentes e mantê-los no gelo', 'Vortexar e centrifugar brevemente todos os reagentes',
  'Preparar o Master Mix na bancada conforme a calculadora', 'Homogeneizar o Master Mix e distribuir nos poços',
  'Adicionar amostras/padrões/controles nos poços correspondentes', 'Selar a placa com filme adesivo óptico',
  'Centrifugar a placa brevemente para remover bolhas', 'Colocar a placa no termociclador e iniciar a corrida'
];
const INITIAL_REAGENTS = [
  { name: 'Taq DNA Polimerase', volumePerReaction: 0.2 }, { name: 'Buffer de Reação 10X', volumePerReaction: 2.0 },
  { name: 'dNTPs (10mM)', volumePerReaction: 0.4 }, { name: 'Primer Forward (10µM)', volumePerReaction: 0.5 },
  { name: 'Primer Reverse (10µM)', volumePerReaction: 0.5 }, { name: 'Água livre de nucleases', volumePerReaction: 16.4 }
];
const defaultTargets = [
    { id: 'empty', name: 'Vazio', color: '#FFFFFF' }, // Ferramenta Vazio/Apagar
    { id: nanoid(), name: 'ACTB', color: '#3b82f6' },
    { id: nanoid(), name: 'GAPDH', color: '#22c55e' },
];


function App() {
  // --- ESTADO DA APLICAÇÃO ---
  const [projectName, setProjectName] = useState(() => localStorage.getItem('projectName') || 'Novo Projeto');
  const [plateFormat, setPlateFormat] = useState(() => localStorage.getItem('plateFormat') || '96');
  const [plateData, setPlateData] = useState(() => JSON.parse(localStorage.getItem('plateData')) || {});
  const [currentTab, setCurrentTab] = useState('design');
  
  const [targets, setTargets] = useState(() => {
    const savedTargets = localStorage.getItem('targets');
    if (savedTargets) {
      const parsed = JSON.parse(savedTargets);
      if (!parsed.find(t => t.id === 'empty')) {
        return [{ id: 'empty', name: 'Vazio', color: '#FFFFFF' }, ...parsed];
      }
      return parsed;
    }
    return defaultTargets;
  });
  
  const [activeTargetId, setActiveTargetId] = useState(() => localStorage.getItem('activeTargetId') || targets.find(t => t.id !== 'empty')?.id || 'empty');

  const [isDragging, setIsDragging] = useState(false);
  const [draggedOverWells, setDraggedOverWells] = useState(new Set());
  
  const [reagents, setReagents] = useState(() => JSON.parse(localStorage.getItem('reagents')) || INITIAL_REAGENTS);
  const [marginType, setMarginType] = useState(() => localStorage.getItem('marginType') || 'extra');
  const [extraSamples, setExtraSamples] = useState(() => parseInt(localStorage.getItem('extraSamples')) || 2);
  const [extraPercentage, setExtraPercentage] = useState(() => parseInt(localStorage.getItem('extraPercentage')) || 10);
  const [manualReactionCount, setManualReactionCount] = useState(() => {
      const savedCount = localStorage.getItem('manualReactionCount');
      return savedCount !== null ? parseInt(savedCount) : Object.values(JSON.parse(localStorage.getItem('plateData')) || {}).filter(well => well && well.targetId !== 'empty').length;
  });

  const [checklistItems, setChecklistItems] = useState(() => JSON.parse(localStorage.getItem('checklistItems')) || INITIAL_CHECKLIST);
  const [completedItems, setCompletedItems] = useState(() => JSON.parse(localStorage.getItem('completedItems')) || []);
  
  const [editingWellId, setEditingWellId] = useState(null);
  const [editingWellData, setEditingWellData] = useState({ sampleName: '' });
  
  const [isAddTargetDialogOpen, setIsAddTargetDialogOpen] = useState(false);
  const [newTarget, setNewTarget] = useState({ name: '', color: '#aabbcc' });

  const [isChecklistEditorOpen, setChecklistEditorOpen] = useState(false);
  const [checklistText, setChecklistText] = useState(checklistItems.join('\n'));
  
  const fileInputRef = useRef(null);

  // --- EFEITOS (SALVAMENTO AUTOMÁTICO) ---
  useEffect(() => { localStorage.setItem('projectName', projectName); }, [projectName]);
  useEffect(() => { localStorage.setItem('plateFormat', plateFormat); }, [plateFormat]);
  useEffect(() => { localStorage.setItem('plateData', JSON.stringify(plateData)); }, [plateData]);
  useEffect(() => { localStorage.setItem('targets', JSON.stringify(targets)); }, [targets]);
  useEffect(() => { localStorage.setItem('activeTargetId', activeTargetId); }, [activeTargetId]);
  useEffect(() => { localStorage.setItem('reagents', JSON.stringify(reagents)); }, [reagents]);
  useEffect(() => { localStorage.setItem('marginType', marginType); }, [marginType]);
  useEffect(() => { localStorage.setItem('extraSamples', String(extraSamples)); }, [extraSamples]);
  useEffect(() => { localStorage.setItem('extraPercentage', String(extraPercentage)); }, [extraPercentage]);
  useEffect(() => { localStorage.setItem('manualReactionCount', String(manualReactionCount)); }, [manualReactionCount]);
  useEffect(() => { localStorage.setItem('checklistItems', JSON.stringify(checklistItems)); }, [checklistItems]);
  useEffect(() => { localStorage.setItem('completedItems', JSON.stringify(completedItems)); }, [completedItems]);

  useEffect(() => {
      const currentPlateReactions = Object.values(plateData).filter(well => well && well.targetId !== 'empty').length;
      if (manualReactionCount === 0 && currentPlateReactions > 0) {
          setManualReactionCount(currentPlateReactions);
      }
  }, [plateData, manualReactionCount]);

  // --- FUNÇÕES DE MANIPULAÇÃO (SEM useCallback) ---
  const handleAddTarget = () => {
    setNewTarget({ name: '', color: `#${Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0')}` });
    setIsAddTargetDialogOpen(true);
  };

  const handleSaveNewTarget = () => {
    if (newTarget.name.trim() === '') {
        alert('O nome do alvo não pode estar vazio.');
        return;
    }
    const finalTarget = { id: nanoid(), name: newTarget.name.trim(), color: newTarget.color };
    setTargets(prev => [...prev, finalTarget]);
    setActiveTargetId(finalTarget.id);
    setIsAddTargetDialogOpen(false);
  };

  const handleRemoveTarget = (targetIdToRemove) => {
    if (targetIdToRemove === 'empty') return;
    setTargets(prev => prev.filter(t => t.id !== targetIdToRemove));
    setPlateData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(wellId => {
            if (newData[wellId].targetId === targetIdToRemove) {
                delete newData[wellId];
            }
        });
        return newData;
    });
    if (activeTargetId === targetIdToRemove) {
        setActiveTargetId(targets.find(t => t.id !== 'empty' && t.id !== targetIdToRemove)?.id || 'empty');
    }
  };
  
  const updateWells = (wellsToUpdate) => {
    setPlateData(prev => {
      const newData = { ...prev };
      wellsToUpdate.forEach(wellId => {
        if (activeTargetId === 'empty') {
          delete newData[wellId];
        } else {
          const existingSampleName = newData[wellId]?.sampleName;
          newData[wellId] = { 
              ...newData[wellId], 
              targetId: activeTargetId, 
              sampleName: existingSampleName || '' 
          };
        }
      });
      return newData;
    });
  };

  const handleWellMouseDown = (wellId) => {
    setIsDragging(true);
    const newDraggedOverWells = new Set([wellId]);
    setDraggedOverWells(newDraggedOverWells);
    updateWells(newDraggedOverWells); // Apply immediately on single click/drag start
  };
  
  const handleWellMouseEnter = (wellId) => {
    if (isDragging) {
      const newDraggedOverWells = new Set(draggedOverWells).add(wellId);
      setDraggedOverWells(newDraggedOverWells);
      updateWells(newDraggedOverWells); // Apply immediately while dragging
    }
  };
  
  const handleWellMouseUp = () => {
    if(isDragging) {
      // updateWells is already called during drag, just reset state
      setIsDragging(false);
      setDraggedOverWells(new Set());
    }
  };

  const handleWellDoubleClick = (wellId) => {
    if (plateData[wellId] && plateData[wellId].targetId !== 'empty') {
        setEditingWellId(wellId);
        setEditingWellData({ sampleName: plateData[wellId]?.sampleName || '' });
    }
  };
  
  const handleSaveWellDetails = () => {
    if (!editingWellId) return;
    setPlateData(prev => ({
      ...prev,
      [editingWellId]: { ...prev[editingWellId], ...editingWellData }
    }));
    setEditingWellId(null);
  };

  const handleClearPlate = () => {
    if (window.confirm('Tem certeza que deseja limpar toda a placa?')) {
      setPlateData({});
      setManualReactionCount(0);
    }
  };

  const handleSaveChecklist = () => {
    const newItems = checklistText.split('\n').filter(item => item.trim() !== '');
    setChecklistItems(newItems);
    setChecklistEditorOpen(false);
  };

  const handleItemToggle = (index) => {
    setCompletedItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const calculateMasterMix = () => {
    const baseReactions = parseInt(manualReactionCount || 0);
    if (baseReactions === 0) return [];
    const factor = marginType === 'extra' ? baseReactions + parseInt(extraSamples || 0) : baseReactions * (1 + (parseInt(extraPercentage || 0) / 100));
    return reagents.map(reagent => ({ ...reagent, totalVolume: (reagent.volumePerReaction * factor).toFixed(2) }));
  };
  
  const getTotalMasterMixVolume = () => calculateMasterMix().reduce((sum, reagent) => sum + parseFloat(reagent.totalVolume), 0).toFixed(2);
  
  const handleExport = () => {
     const stateToExport = {
      projectName, plateFormat, plateData, targets, checklistItems, reagents,
      marginType, extraSamples, extraPercentage, activeTargetId, manualReactionCount, completedItems
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${projectName.replace(/\s+/g, '_')}.qplate.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedState = JSON.parse(e.target.result);
          setProjectName(importedState.projectName || 'Projeto Importado');
          setPlateFormat(importedState.plateFormat || '96');
          setPlateData(importedState.plateData || {});
          
          // Garante que a ferramenta 'empty' existe nos alvos importados
          let importedTargets = importedState.targets || defaultTargets;
          if (!importedTargets.find(t => t.id === 'empty')) {
              importedTargets = [{ id: 'empty', name: 'Vazio', color: '#FFFFFF' }, ...importedTargets];
          }
          setTargets(importedTargets);

          setChecklistItems(importedState.checklistItems || INITIAL_CHECKLIST);
          setReagents(importedState.reagents || INITIAL_REAGENTS);
          setMarginType(importedState.marginType || 'extra');
          setExtraSamples(importedState.extraSamples || 2);
          setExtraPercentage(importedState.extraPercentage || 10);
          setManualReactionCount(importedState.manualReactionCount !== undefined ? importedState.manualReactionCount : Object.values(importedState.plateData || {}).filter(well => well && well.targetId !== 'empty').length);
          setActiveTargetId(importedState.activeTargetId || importedTargets.find(t => t.id !== 'empty')?.id || 'empty');
          setCompletedItems(importedState.completedItems || []);
          alert('Projeto importado com sucesso!');
        } catch (error) {
          console.error("Erro ao importar:", error);
          alert('Erro ao ler o ficheiro. Verifique se o formato é JSON válido.');
        }
      };
      reader.readAsText(file);
      event.target.value = null;
    }
  };

  // --- JSX ---
  return (
    <>
      <div className="print-only">
        <PrintLayout 
          plateData={plateData} 
          targets={targets} 
          plateFormat={plateFormat} 
          projectName={projectName}
          calculatedMix={calculateMasterMix()}
          totalMixVolume={getTotalMasterMixVolume()}
          marginType={marginType}
          extraSamples={extraSamples}
          extraPercentage={extraPercentage}
          manualReactionCount={manualReactionCount}
        />
      </div>
      <div className="min-h-screen bg-gray-50 no-print">
        <header className="bg-white shadow-sm border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-4">
                <Grid3X3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">QPlate Architect</h1>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <Label htmlFor="project-name" className="text-sm font-medium">Projeto:</Label>
                  <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-48 h-8"/>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".json"/>
                <Button variant="outline" size="sm" onClick={handleImportClick}><Upload className="h-4 w-4 mr-2" /> Importar</Button>
                <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Exportar</Button>
                {/* Botão Imprimir corrigido */}
                <Button variant="default" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Imprimir</Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design" className="flex items-center gap-2"><Grid3X3 className="h-4 w-4" /> Design da Placa</TabsTrigger>
              <TabsTrigger value="mastermix" className="flex items-center gap-2"><Calculator className="h-4 w-4" /> Master Mix</TabsTrigger>
              <TabsTrigger value="checklist" className="flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Mini-POP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="design">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" onMouseUp={handleWellMouseUp}>
                <div className="lg:col-span-1">
                  <ToolsPanel
                    targets={targets}
                    activeTargetId={activeTargetId}
                    onSelectTarget={setActiveTargetId}
                    onAddTarget={handleAddTarget}
                    onRemoveTarget={handleRemoveTarget}
                    onClearPlate={handleClearPlate}
                  />
                </div>
                <div className="lg:col-span-3">
                  <PlateGrid
                    plateFormat={plateFormat}
                    plateData={plateData}
                    targets={targets}
                    draggedOverWells={draggedOverWells}
                    onWellMouseDown={handleWellMouseDown}
                    onWellMouseEnter={handleWellMouseEnter}
                    onWellMouseUp={handleWellMouseUp} // Passado aqui, mas a lógica agora é no mouse up do container
                    onWellDoubleClick={handleWellDoubleClick}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="mastermix">
              <MasterMixCalculator
                reagents={reagents}
                setReagents={setReagents}
                manualReactionCount={manualReactionCount}
                setManualReactionCount={setManualReactionCount}
                marginType={marginType}
                setMarginType={setMarginType}
                extraSamples={extraSamples}
                setExtraSamples={setExtraSamples}
                extraPercentage={extraPercentage}
                setExtraPercentage={setExtraPercentage}
                calculatedMix={calculateMasterMix()}
                totalMixVolume={getTotalMasterMixVolume()}
              />
            </TabsContent>
            
            <TabsContent value="checklist">
              <Checklist
                items={checklistItems}
                completedItems={completedItems}
                onItemToggle={handleItemToggle}
                onEdit={() => setChecklistEditorOpen(true)}
                onReset={() => setCompletedItems([])}
              />
            </TabsContent>
          </Tabs>
        </main>

        <Dialog open={!!editingWellId} onOpenChange={() => setEditingWellId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Poço {editingWellId}</DialogTitle>
              <DialogDescription>Adicione um nome de amostra a este poço.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="well-sample-name">Nome da Amostra</Label>
                <Input id="well-sample-name" value={editingWellData.sampleName} onChange={(e) => setEditingWellData({ ...editingWellData, sampleName: e.target.value })} />
              </div>
            </div>
            <DialogFooter><Button onClick={handleSaveWellDetails}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isChecklistEditorOpen} onOpenChange={setChecklistEditorOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Checklist</DialogTitle>
              <DialogDescription>Edite os passos do protocolo. Um passo por linha.</DialogDescription>
            </DialogHeader>
            <div className="py-4"><Textarea value={checklistText} onChange={(e) => setChecklistText(e.target.value)} rows={10} /></div>
            <DialogFooter><Button onClick={handleSaveChecklist}>Salvar Checklist</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddTargetDialogOpen} onOpenChange={setIsAddTargetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Alvo</DialogTitle>
              <DialogDescription>
                Dê um nome e escolha uma cor para o seu novo gene ou controlo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="target-name">Nome do Alvo</Label>
                <Input 
                  id="target-name" 
                  value={newTarget.name} 
                  onChange={(e) => setNewTarget(prev => ({ ...prev, name: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Cor do Alvo</Label>
                <div className="flex justify-center items-center py-2">
                  <HexColorPicker 
                    color={newTarget.color} 
                    onChange={(color) => setNewTarget(prev => ({ ...prev, color }))} 
                  />
                </div>
                <Input 
                    value={newTarget.color}
                    onChange={(e) => setNewTarget(prev => ({...prev, color: e.target.value}))}
                    className="mt-2 w-full font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveNewTarget}>Salvar Alvo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default App

