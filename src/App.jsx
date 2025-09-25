// src/App.jsx - VERSÃO COMPLETA E CORRIGIDA

import { useState, useEffect, useRef } from 'react'
// Nossos novos componentes importados
import { ToolsPanel } from './components/ToolsPanel'
import { PlateGrid } from './components/PlateGrid'

// O resto das dependências de UI e ícones
import { Button } from '@/components/ui/button.jsx'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Grid3X3, Calculator, CheckSquare, Upload, Download, Edit, RotateCcw, Beaker, Plus, Trash2
} from 'lucide-react'
import './App.css'

// Constantes
const INITIAL_CHECKLIST = [
  'Degelar todos os reagentes e mantê-los no gelo', 'Vortexar e centrifugar brevemente todos os reagentes',
  'Preparar o Master Mix na bancada conforme a calculadora', 'Homogeneizar o Master Mix e distribuir nos poços',
  'Adicionar amostras/padrões/controles nos poços correspondentes', 'Selar o placa com filme adesivo óptico',
  'Centrifugar a placa brevemente para remover bolhas', 'Colocar a placa no termociclador e iniciar a corrida'
];
const INITIAL_REAGENTS = [
  { name: 'Taq DNA Polimerase', volumePerReaction: 0.2 }, { name: 'Buffer de Reação 10X', volumePerReaction: 2.0 },
  { name: 'dNTPs (10mM)', volumePerReaction: 0.4 }, { name: 'Primer Forward (10µM)', volumePerReaction: 0.5 },
  { name: 'Primer Reverse (10µM)', volumePerReaction: 0.5 }, { name: 'Água livre de nucleases', volumePerReaction: 16.4 }
];
const PLATE_FORMATS = {
  '96': { name: '96 poços (8x12)', rows: 8, cols: 12 },
  '384': { name: '384 poços (16x24)', rows: 16, cols: 24 },
  '48': { name: '48 poços (6x8)', rows: 6, cols: 8 }
};
const WELL_TYPES = {
  sample: { name: 'Amostra' }, standard: { name: 'Padrão' }, positive: { name: 'Controle +' },
  negative: { name: 'Controle -' }, ntc: { name: 'NTC' }, blank: { name: 'Branco' }
};

function App() {
  // --- ESTADO DA APLICAÇÃO (O CÉREBRO) ---
  const [projectName, setProjectName] = useState(() => localStorage.getItem('projectName') || 'Novo Projeto');
  const [plateFormat, setPlateFormat] = useState(() => localStorage.getItem('plateFormat') || '96');
  const [plateData, setPlateData] = useState(() => JSON.parse(localStorage.getItem('plateData')) || {});
  const [selectedWellType, setSelectedWellType] = useState('sample');
  const [selectedWells, setSelectedWells] = useState([]);
  const [currentTab, setCurrentTab] = useState('design');
  
  const [reagents, setReagents] = useState(() => JSON.parse(localStorage.getItem('reagents')) || INITIAL_REAGENTS);
  const [marginType, setMarginType] = useState(() => localStorage.getItem('marginType') || 'extra');
  const [extraSamples, setExtraSamples] = useState(() => parseInt(localStorage.getItem('extraSamples')) || 2);
  const [extraPercentage, setExtraPercentage] = useState(() => parseInt(localStorage.getItem('extraPercentage')) || 10);
  
  const [checklistItems, setChecklistItems] = useState(() => JSON.parse(localStorage.getItem('checklistItems')) || INITIAL_CHECKLIST);
  const [completedItems, setCompletedItems] = useState(() => JSON.parse(localStorage.getItem('completedItems')) || []);
  
  const [editingWellId, setEditingWellId] = useState(null);
  const [editingWellData, setEditingWellData] = useState({ label: '', concentration: '' });
  const [isChecklistEditorOpen, setChecklistEditorOpen] = useState(false);
  const [checklistText, setChecklistText] = useState(checklistItems.join('\n'));
  
  const fileInputRef = useRef(null);

  // --- EFEITOS (SALVAMENTO AUTOMÁTICO) ---
  useEffect(() => { localStorage.setItem('projectName', projectName); }, [projectName]);
  useEffect(() => { localStorage.setItem('plateFormat', plateFormat); }, [plateFormat]);
  useEffect(() => { localStorage.setItem('plateData', JSON.stringify(plateData)); }, [plateData]);
  useEffect(() => { localStorage.setItem('reagents', JSON.stringify(reagents)); }, [reagents]);
  useEffect(() => { localStorage.setItem('marginType', marginType); }, [marginType]);
  useEffect(() => { localStorage.setItem('extraSamples', String(extraSamples)); }, [extraSamples]);
  useEffect(() => { localStorage.setItem('extraPercentage', String(extraPercentage)); }, [extraPercentage]);
  useEffect(() => { localStorage.setItem('checklistItems', JSON.stringify(checklistItems)); }, [checklistItems]);
  useEffect(() => { localStorage.setItem('completedItems', JSON.stringify(completedItems)); }, [completedItems]);

  // --- FUNÇÕES DE MANIPULAÇÃO (AÇÕES) ---
  const getTotalReactions = () => Object.values(plateData).filter(well => well.type !== 'empty').length;

  const handleWellClick = (wellId, isShiftHeld) => {
    const newPlateData = { ...plateData };
    const targets = isShiftHeld ? (selectedWells.includes(wellId) ? [...selectedWells] : [...selectedWells, wellId]) : [wellId];

    if (!isShiftHeld) setSelectedWells([wellId]);
    else setSelectedWells(targets);

    targets.forEach(id => {
      const currentWell = newPlateData[id] || {};
      newPlateData[id] = { ...currentWell, type: selectedWellType, label: currentWell.label || `${WELL_TYPES[selectedWellType].name}` };
    });
    setPlateData(newPlateData);
  };

  const handleWellDoubleClick = (wellId) => {
    if (plateData[wellId] && plateData[wellId].type !== 'empty') {
      setEditingWellId(wellId);
      setEditingWellData({ label: plateData[wellId].label || '', concentration: plateData[wellId].concentration || '' });
    }
  };

  const handleSaveWellDetails = () => {
    if (!editingWellId) return;
    setPlateData(prev => ({ ...prev, [editingWellId]: { ...prev[editingWellId], ...editingWellData }}));
    setEditingWellId(null);
  };

  const handleClearPlate = () => {
    if (window.confirm('Tem certeza que deseja limpar toda a placa?')) {
      setPlateData({});
      setSelectedWells([]);
    }
  };

  const handleApplyReplicates = (count) => {
    if (selectedWells.length === 0) {
      alert("Por favor, selecione pelo menos um poço para aplicar as replicatas.");
      return;
    }
    const newPlateData = { ...plateData };
    const format = PLATE_FORMATS[plateFormat];
    
    selectedWells.forEach(startWellId => {
      const startRow = startWellId.charCodeAt(0) - 65;
      const startCol = parseInt(startWellId.substring(1)) - 1;
      const startWellData = newPlateData[startWellId];
      
      for (let i = 0; i < count; i++) {
        const targetCol = startCol + i;
        if (targetCol < format.cols) {
          const wellId = `${String.fromCharCode(65 + startRow)}${targetCol + 1}`;
          newPlateData[wellId] = { ...startWellData };
        }
      }
    });
    setPlateData(newPlateData);
  };

  const handleSaveChecklist = () => {
    const newItems = checklistText.split('\n').filter(item => item.trim() !== '');
    setChecklistItems(newItems);
    setChecklistEditorOpen(false);
  };

  const calculateMasterMix = () => {
    const totalReactions = getTotalReactions();
    if (totalReactions === 0) return [];
    const factor = marginType === 'extra' ? totalReactions + parseInt(extraSamples || 0) : totalReactions * (1 + (parseInt(extraPercentage || 0) / 100));
    return reagents.map(reagent => ({ ...reagent, totalVolume: (reagent.volumePerReaction * factor).toFixed(2) }));
  };
  
  const getTotalMasterMixVolume = () => calculateMasterMix().reduce((sum, reagent) => sum + parseFloat(reagent.totalVolume), 0).toFixed(2);
  
  const handleExport = () => {
    const stateToExport = { projectName, plateFormat, plateData, reagents, checklistItems, marginType, extraSamples, extraPercentage };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${projectName.replace(/\s+/g, '_')}.qplate.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const handleImportClick = () => fileInputRef.current.click();

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
          setReagents(importedState.reagents || INITIAL_REAGENTS);
          setChecklistItems(importedState.checklistItems || INITIAL_CHECKLIST);
          setMarginType(importedState.marginType || 'extra');
          setExtraSamples(importedState.extraSamples || 2);
          setExtraPercentage(importedState.extraPercentage || 10);
          alert('Projeto importado com sucesso!');
        } catch (error) {
          alert('Erro ao ler o arquivo. Verifique se o formato é JSON válido.');
        }
      };
      reader.readAsText(file);
      event.target.value = null;
    }
  };

  // --- JSX (INTERFACE) ---
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">QPlate Architect</h1>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Label htmlFor="project-name" className="text-sm font-medium">Projeto:</Label>
                <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-48"/>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".json"/>
              <Button variant="outline" size="sm" onClick={handleImportClick}><Upload className="h-4 w-4 mr-2" /> Importar</Button>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Exportar</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design" className="flex items-center gap-2"><Grid3X3 className="h-4 w-4" /> Design da Placa</TabsTrigger>
            <TabsTrigger value="mastermix" className="flex items-center gap-2"><Calculator className="h-4 w-4" /> Master Mix</TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Mini-POP</TabsTrigger>
          </TabsList>
          
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ToolsPanel
                  plateFormat={plateFormat}
                  setPlateFormat={setPlateFormat}
                  selectedWellType={selectedWellType}
                  setSelectedWellType={setSelectedWellType}
                  onApplyReplicates={handleApplyReplicates}
                  onClearPlate={handleClearPlate}
                />
              </div>
              <div className="lg:col-span-3">
                <PlateGrid
                  plateFormat={plateFormat}
                  plateData={plateData}
                  selectedWells={selectedWells}
                  onWellClick={handleWellClick}
                  onWellDoubleClick={handleWellDoubleClick}
                  totalReactions={getTotalReactions()}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mastermix">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2"><Beaker className="h-5 w-5" />Reagentes do Master Mix</CardTitle>
                  <CardDescription>Total de reações na placa: {getTotalReactions()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {reagents.map((reagent, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input value={reagent.name} onChange={(e) => { const newReagents = [...reagents]; newReagents[index].name = e.target.value; setReagents(newReagents); }} className="flex-1" placeholder="Nome do reagente" />
                        <Input type="number" step="0.1" value={reagent.volumePerReaction} onChange={(e) => { const newReagents = [...reagents]; newReagents[index].volumePerReaction = parseFloat(e.target.value) || 0; setReagents(newReagents); }} className="w-20" placeholder="µL" />
                        <Button variant="outline" size="icon" onClick={() => { setReagents(reagents.filter((_, i) => i !== index)); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => setReagents([...reagents, { name: '', volumePerReaction: 0 }])} className="w-full"><Plus className="h-4 w-4 mr-2" />Adicionar Reagente</Button>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Margem de Segurança</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2"><input type="radio" id="extra-samples" name="margin" checked={marginType === 'extra'} onChange={() => setMarginType('extra')} /><Label htmlFor="extra-samples">Amostras Extras</Label>{marginType === 'extra' && <Input type="number" value={extraSamples} onChange={(e) => setExtraSamples(parseInt(e.target.value) || 0)} className="w-20" min="0" />}</div>
                      <div className="flex items-center space-x-2"><input type="radio" id="extra-percentage" name="margin" checked={marginType === 'percentage'} onChange={() => setMarginType('percentage')} /><Label htmlFor="extra-percentage">Porcentagem Extra (%)</Label>{marginType === 'percentage' && <Input type="number" value={extraPercentage} onChange={(e) => setExtraPercentage(parseInt(e.target.value) || 0)} className="w-20" min="0" max="100" />}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center space-x-2"><Calculator className="h-5 w-5" />Resultados do Master Mix</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left p-2">Reagente</th><th className="text-right p-2">Vol/Reação (µL)</th><th className="text-right p-2">Vol Total (µL)</th></tr></thead>
                        <tbody>
                          {calculateMasterMix().map((reagent, index) => ( <tr key={index} className="border-b"><td className="p-2">{reagent.name}</td><td className="p-2 text-right">{reagent.volumePerReaction}</td><td className="p-2 text-right font-semibold">{reagent.totalVolume}</td></tr> ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-900">Volume Total Final:</span>
                        <Badge variant="secondary" className="text-lg px-3 py-1">{getTotalMasterMixVolume()} µL</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="checklist">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><CheckSquare className="h-5 w-5" />Checklist de Preparação (Mini-POP)</CardTitle>
                <CardDescription>Siga os passos abaixo para montar sua placa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <input type="checkbox" id={`item-${index}`} checked={completedItems.includes(index)} onChange={(e) => { setCompletedItems(prev => e.target.checked ? [...prev, index] : prev.filter(i => i !== index)) }} className="mt-1 h-4 w-4" />
                      <Label htmlFor={`item-${index}`} className={`flex-1 ${completedItems.includes(index) ? 'line-through text-gray-500' : ''}`}>{item}</Label>
                    </div>
                  ))}
                </div>
                <Separator className="my-6" />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Progresso: {completedItems.length}/{checklistItems.length} itens concluídos</div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setChecklistEditorOpen(true)}><Edit className="h-4 w-4 mr-2" />Editar Checklist</Button>
                    <Button variant="outline" size="sm" onClick={() => setCompletedItems([])}><RotateCcw className="h-4 w-4 mr-2" />Resetar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!editingWellId} onOpenChange={() => setEditingWellId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Poço {editingWellId}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label htmlFor="well-label">Rótulo</Label><Input id="well-label" value={editingWellData.label} onChange={(e) => setEditingWellData(d => ({ ...d, label: e.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="well-concentration">Concentração</Label><Input id="well-concentration" value={editingWellData.concentration} onChange={(e) => setEditingWellData(d => ({ ...d, concentration: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveWellDetails}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isChecklistEditorOpen} onOpenChange={setChecklistEditorOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Editar Checklist</DialogTitle><DialogDescription>Edite os passos do protocolo. Um passo por linha.</DialogDescription></DialogHeader>
          <div className="py-4"><Textarea value={checklistText} onChange={(e) => setChecklistText(e.target.value)} rows={10} /></div>
          <DialogFooter><Button onClick={handleSaveChecklist}>Salvar Checklist</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App