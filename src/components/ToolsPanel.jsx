import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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

  const geneTargets = targets.filter(t => t.id !== 'empty');
  const emptyTarget = targets.find(t => t.id === 'empty');

  return (
    <Card className="sticky top-24">
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
        
        <Separator />

        <div className="space-y-2">
          <Label>Alvos (Genes / Controlos)</Label>
          <div className="space-y-1">
            {/* Botão para Apagar (Vazio) */}
            {emptyTarget && (
              <Button
                variant={activeTargetId === emptyTarget.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start h-9 text-sm relative group ${activeTargetId === emptyTarget.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => onSelectTarget(emptyTarget.id)}
              >
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 mr-2 flex-shrink-0" />
                <span className="truncate">Apagar Poço (Vazio)</span>
              </Button>
            )}

            {/* Lista de Alvos */}
            {geneTargets.map((target) => (
              <div key={target.id} className="group flex items-center w-full">
                <Button
                  variant={activeTargetId === target.id ? 'secondary' : 'ghost'}
                  className={`flex-grow justify-start h-9 text-sm ${activeTargetId === target.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => onSelectTarget(target.id)}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2 flex-shrink-0" 
                    style={{ backgroundColor: target.color }}
                  />
                  <span className="truncate">{target.name}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-9 h-9 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    if(window.confirm(`Tem a certeza que quer remover o alvo "${target.name}"?`)) {
                      onRemoveTarget(target.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600"/>
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={onAddTarget}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Alvo
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
            <Label>Ações da Placa</Label>
            <Button variant="destructive" size="sm" className="w-full justify-start" onClick={onClearPlate}>
                <Trash2 className="h-4 w-4 mr-2" /> 
                Limpar Placa
            </Button>
        </div>

      </CardContent>
    </Card>
  );
}

