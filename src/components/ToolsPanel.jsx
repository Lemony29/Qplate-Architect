// src/components/ToolsPanel.jsx

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Settings, Trash2, Plus } from 'lucide-react'

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

        <div className="space-y-3">
          <Label className="text-base font-semibold">Alvos (Genes / Controles)</Label>
          <div className="space-y-2">
            {targets.map((target) => (
              <Button 
                key={target.id} 
                variant={activeTargetId === target.id ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveTargetId(target.id)} 
                className="w-full justify-start"
              >
                <div className={`w-4 h-4 rounded-full ${target.color} mr-2 border`} />
                <span>{target.name}</span>
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={onAddTarget}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Alvo
          </Button>
        </div>

        <div className="space-y-2">
           <Button variant="destructive" size="sm" className="w-full justify-start" onClick={onClearPlate}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Placa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

