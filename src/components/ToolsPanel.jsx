// src/components/ToolsPanel.jsx

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
  onSelectTarget,
  onAddTarget,
  onRemoveTarget,
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
      <CardContent className="space-y-6">
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
            {targets.filter(t => t.id !== 'empty').map(target => (
              <div key={target.id} className="flex items-center gap-2">
                <Button
                  variant={activeTargetId === target.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectTarget(target.id)}
                  className={`w-full justify-start ring-offset-background transition-all duration-150 ${activeTargetId === target.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: target.color }} />
                  <span className="truncate">{target.name}</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onRemoveTarget(target.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground"/>
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={onAddTarget}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar Alvo
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ações da Placa</Label>
          <Button variant="destructive" size="sm" className="w-full justify-start" onClick={onClearPlate}>
            <Trash2 className="h-4 w-4 mr-2" /> Limpar Placa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

