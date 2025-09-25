// src/components/PlateGrid.jsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const PLATE_FORMATS = {
  '96': { rows: 8, cols: 12 },
  '384': { rows: 16, cols: 24 },
  '48': { rows: 6, cols: 8 }
};

const Well = ({ wellId, wellData, targets, isDragged, onMouseDown, onMouseEnter, onDoubleClick }) => {
  const target = targets.find(t => t.id === wellData.targetId);
  const color = target ? target.color : 'bg-white border-2 border-gray-300';
  const textColor = target ? target.textColor : 'text-gray-500';

  return (
    <div
      className={`w-24 h-16 rounded-md border-2 flex flex-col items-center justify-center text-xs font-semibold select-none cursor-pointer transition-transform
        ${color} ${textColor}
        ${isDragged ? 'ring-4 ring-offset-1 ring-blue-400 scale-105' : ''}
      `}
      onMouseDown={() => onMouseDown(wellId)}
      onMouseEnter={() => onMouseEnter(wellId)}
      onDoubleClick={() => onDoubleClick(wellId)}
      title={`${wellId}: ${wellData.sampleName || ''} - ${target ? target.name : 'Vazio'}`}
    >
      <span className="font-bold text-sm">{wellData.sampleName?.substring(0, 8) || 'Vazio'}</span>
      <span className="opacity-80">{target ? target.name.substring(0, 8) : ''}</span>
    </div>
  );
};

export function PlateGrid({
  plateFormat,
  plateData,
  targets,
  draggedWells,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onWellDoubleClick,
  totalReactions
}) {
  const format = PLATE_FORMATS[plateFormat];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização da Placa</CardTitle>
        <CardDescription>Clique e arraste o mouse para selecionar e preencher múltiplos poços. Duplo clique para editar.</CardDescription>
      </CardHeader>
      <CardContent 
        className="flex justify-center"
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp} // Para o arraste se o mouse sair da área da placa
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${format.cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: format.rows }, (_, row) =>
              Array.from({ length: format.cols }, (_, col) => {
                const wellId = `${String.fromCharCode(65 + row)}${col + 1}`;
                const wellData = plateData[wellId] || {};
                return (
                  <Well
                    key={wellId}
                    wellId={wellId}
                    wellData={wellData}
                    targets={targets}
                    isDragged={draggedWells.has(wellId)}
                    onMouseDown={onMouseDown}
                    onMouseEnter={onMouseEnter}
                    onDoubleClick={onWellDoubleClick}
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

