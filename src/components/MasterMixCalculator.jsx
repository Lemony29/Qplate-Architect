// src/components/MasterMixCalculator.jsx

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Beaker, Calculator, Plus, Trash2 } from 'lucide-react'

export function MasterMixCalculator({
  reagents,
  setReagents,
  totalReactions,
  marginType,
  setMarginType,
  extraSamples,
  setExtraSamples,
  extraPercentage,
  setExtraPercentage,
  calculatedMix,
  totalMixVolume
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2"><Beaker className="h-5 w-5" />Reagentes do Master Mix</CardTitle>
          <CardDescription>Total de reações na placa: {totalReactions}</CardDescription>
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
                  {calculatedMix.map((reagent, index) => ( <tr key={index} className="border-b"><td className="p-2">{reagent.name}</td><td className="p-2 text-right">{reagent.volumePerReaction}</td><td className="p-2 text-right font-semibold">{reagent.totalVolume}</td></tr> ))}
                </tbody>
              </table>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900">Volume Total Final:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">{totalMixVolume} µL</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

