// src/components/ToolsPanel.jsx

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Settings, Copy, Trash2 } from 'lucide-react'

const PLATE_FORMATS = {
  '96': { name: '96 poços (8x12)' },
  '384': { name: '384 poços (16x24)' },
  '48': { name: '48 poços (6x8)' }
};

const WELL_TYPES = {
  sample: { name: 'Amostra', color: 'bg-blue-500' },
  standard: { name: 'Padrão', color: 'bg-green-500' },
  positive: { name: 'Controle +', color: 'bg-red-500' },
  negative: { name: 'Controle -', color: 'bg-yellow-500' },
  ntc: { name: 'NTC', color: 'bg-purple-500' },
  blank: { name: 'Branco', color: 'bg-gray-300' },
};

export function ToolsPanel({
  plateFormat,
  setPlateFormat,
  selectedWellType,
  setSelectedWellType,
  onApplyReplicates,
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
          <Label>Tipo de Poço</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(WELL_TYPES).map(([key, type]) => (
              <Button key={key} variant={selectedWellType === key ? 'default' : 'outline'} size="sm" onClick={() => setSelectedWellType(key)} className="justify-start">
                <div className={`w-3 h-3 rounded-full ${type.color} mr-2`} />{type.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Preenchimento Rápido</Label>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onApplyReplicates(2)}><Copy className="h-4 w-4 mr-2" /> Duplicatas</Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onApplyReplicates(3)}><Copy className="h-4 w-4 mr-2" /> Triplicatas</Button>
            <Button variant="destructive" size="sm" className="w-full justify-start" onClick={onClearPlate}><Trash2 className="h-4 w-4 mr-2" /> Limpar Placa</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}