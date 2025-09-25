// src/components/ToolsPanel.jsx - VERSÃO COM OPÇÃO DE REMOVER ALVO

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Settings, Plus, Trash2 } from 'lucide-react'

const PLATE_FORMATS = {
  '96': { name: '96 poços (8x12)' },
  '384': { name: '384 poços (16x24)' },
  '48': { name: '48 poços (6x8)' }
};

export function ToolsPanel({
  plateFormat,
  setPlateFormat,
  targets,
  activeTargetId,
  setActiveTargetId,
  onAddTarget,
  onDeleteTarget,
  onClearPlate
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          <span>Ferramentas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Formato da Placa</Label>
          <Select value={plateFormat} onValueChange={setPlateFormat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PLATE_FORMATS).map(([key, format]) => (
                <SelectItem key={key} value={key}>{format.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Alvos (Genes / Controlos)</Label>
          <div className="space-y-2">
            {targets.map((target) => (
              <div key={target.id} className="flex items-center gap-2">
                <Button
                  variant={activeTargetId === target.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTargetId(target.id)}
                  className="justify-start flex-grow"
                >
                  <div className={`w-3 h-3 rounded-full ${target.color} mr-2`} />
                  <span className="truncate">{target.name}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation(); // Impede que o alvo seja selecionado ao clicar na lixeira
                    onDeleteTarget(target.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full justify-center mt-2" onClick={onAddTarget}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Alvo
          </Button>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label>Ações da Placa</Label>
          <Button variant="destructive" size="sm" className="w-full justify-start" onClick={onClearPlate}>
            <Trash2 className="h-4 w-4 mr-2" /> Limpar Placa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

