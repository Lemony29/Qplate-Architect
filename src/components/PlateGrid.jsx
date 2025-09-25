// src/components/PlateGrid.jsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const WELL_TYPES = {
  sample: { name: 'Amostra', color: 'bg-blue-500', textColor: 'text-white' },
  standard: { name: 'Padrão', color: 'bg-green-500', textColor: 'text-white' },
  positive: { name: 'Controle +', color: 'bg-red-500', textColor: 'text-white' },
  negative: { name: 'Controle -', color: 'bg-yellow-500', textColor: 'text-black' },
  ntc: { name: 'NTC', color: 'bg-purple-500', textColor: 'text-white' },
  blank: { name: 'Branco', color: 'bg-gray-300', textColor: 'text-black' },
  empty: { name: 'Vazio', color: 'bg-white border-2 border-gray-300', textColor: 'text-gray-500' }
};

const PLATE_FORMATS = {
  '96': { rows: 8, cols: 12 },
  '384': { rows: 16, cols: 24 },
  '48': { rows: 6, cols: 8 }
};

const Well = ({ row, col, wellData, isSelected, onWellClick, onWellDoubleClick }) => {
  const wellId = `${String.fromCharCode(65 + row)}${col + 1}`;
  const wellTypeInfo = WELL_TYPES[wellData.type];
  
  return (
    <div
      className={`w-8 h-8 rounded-full cursor-pointer border-2 flex items-center justify-center text-xs font-medium select-none
        ${wellTypeInfo.color} ${wellTypeInfo.textColor}
        ${isSelected ? 'ring-4 ring-offset-1 ring-blue-400' : ''}
        hover:scale-110 transition-transform`}
      onClick={(e) => onWellClick(wellId, e.shiftKey)}
      onDoubleClick={() => onWellDoubleClick(wellId)}
      title={`${wellId}: ${wellData.label || wellTypeInfo.name}`}
    >
      {wellData.label ? wellData.label.substring(0, 3) : ''}
    </div>
  );
};

export function PlateGrid({
  plateFormat,
  plateData,
  selectedWells,
  onWellClick,
  onWellDoubleClick,
  totalReactions
}) {
  const format = PLATE_FORMATS[plateFormat];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização da Placa</CardTitle>
        <CardDescription>Clique para atribuir tipo, Shift+Clique para selecionar múltiplos, Duplo Clique para editar.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${format.cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: format.rows }, (_, row) =>
              Array.from({ length: format.cols }, (_, col) => {
                const wellId = `${String.fromCharCode(65 + row)}${col + 1}`;
                const wellData = plateData[wellId] || { type: 'empty', label: '' };
                return (
                  <Well
                    key={wellId} row={row} col={col}
                    wellData={wellData}
                    isSelected={selectedWells.includes(wellId)}
                    onWellClick={onWellClick}
                    onWellDoubleClick={onWellDoubleClick}
                  />
                );
              })
            )}
          </div>
          <div className="text-sm font-semibold text-gray-700">Total de reações: {totalReactions}</div>
        </div>
      </CardContent>
    </Card>
  );
}