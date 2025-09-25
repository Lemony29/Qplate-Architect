// src/components/Checklist.jsx

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CheckSquare, Edit, RotateCcw } from 'lucide-react'

export function Checklist({
  items,
  completedItems,
  onItemToggle,
  onEdit,
  onReset
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2"><CheckSquare className="h-5 w-5" />Checklist de Preparação (Mini-POP)</CardTitle>
        <CardDescription>Siga os passos abaixo para montar sua placa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              <input 
                type="checkbox" 
                id={`item-${index}`} 
                checked={completedItems.includes(index)} 
                onChange={() => onItemToggle(index)} 
                className="mt-1 h-4 w-4" 
              />
              <Label htmlFor={`item-${index}`} className={`flex-1 ${completedItems.includes(index) ? 'line-through text-gray-500' : ''}`}>{item}</Label>
            </div>
          ))}
        </div>
        <Separator className="my-6" />
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">Progresso: {completedItems.length}/{items.length} itens concluídos</div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Editar Checklist</Button>
            <Button variant="outline" size="sm" onClick={onReset}><RotateCcw className="h-4 w-4 mr-2" />Resetar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}