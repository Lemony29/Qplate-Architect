// src/components/PlateGrid.jsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import tinycolor from 'tinycolor2';

// Constante que estava em falta
const PLATE_FORMATS = {
  '96': { rows: 8, cols: 12 },
  '384': { rows: 16, cols: 24 },
  '48': { rows: 6, cols: 8 }
};

const Well = ({ wellId, wellData, target, isBeingDraggedOver, onMouseDown, onMouseEnter, onDoubleClick }) => {
  const targetName = target?.name || '';
  const sampleName = wellData?.sampleName || '';
  const bgColor = target?.color || '#FFFFFF';
  const isLight = tinycolor(bgColor).isLight();

  return (
    <div
      onMouseDown={() => onMouseDown(wellId)}
      onMouseEnter={() => onMouseEnter(wellId)}
      onDoubleClick={() => onDoubleClick(wellId)}
      className={`relative rounded-lg border-2 flex flex-col items-center justify-center p-1 aspect-square cursor-pointer select-none transition-all duration-100
        ${isBeingDraggedOver ? 'ring-4 ring-blue-400 z-10 scale-105' : 'ring-2 ring-transparent'}
      `}
      style={{ 
        backgroundColor: bgColor,
        borderColor: bgColor === '#FFFFFF' ? '#E5E7EB' : tinycolor(bgColor).darken(10).toString(),
        color: isLight ? '#1f2937' : 'white',
      }}
      title={`Poço: ${wellId}\nAlvo: ${targetName}\nAmostra: ${sampleName}`}
    >
      {/* Exibe o wellId se o poço estiver vazio, ou as informações completas se estiver preenchido */}
      {targetName === 'Vazio' || !targetName ? (
        <span className="font-medium text-gray-400">{wellId}</span>
      ) : (
        <>
          <span className={`absolute top-0.5 left-1.5 text-[8px] ${isLight ? 'opacity-50' : 'opacity-70'}`}>{wellId}</span>
          <span className="font-bold text-xs truncate w-full text-center mt-1">{targetName}</span>
          <span className="text-[10px] opacity-80 truncate w-full text-center">{sampleName}</span>
        </>
      )}
    </div>
  );
};


export function PlateGrid({
  plateFormat,
  plateData,
  targets,
  draggedOverWells,
  onWellMouseDown,
  onWellMouseEnter,
  onWellMouseUp,
  onWellDoubleClick
}) {
  const format = PLATE_FORMATS[plateFormat];

  // Verificação de segurança para evitar que a aplicação quebre
  if (!format) {
    return (
        <Card>
            <CardContent className="p-4">
                <p>Formato de placa inválido. Por favor, recarregue a página ou selecione um formato válido.</p>
            </CardContent>
        </Card>
    );
  }

  const totalReactions = Object.values(plateData).filter(well => well.targetId && well.targetId !== 'empty').length;

  // Adicionando um alvo padrão para garantir que o componente não quebre visualmente
  const emptyTarget = { id: 'empty', name: 'Vazio', color: '#FFFFFF' };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Visualização da Placa</CardTitle>
        <CardDescription>Clique e arraste o rato para selecionar e preencher múltiplos poços. Duplo clique para editar.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center" onMouseLeave={onWellMouseUp}>
        <div 
          className="grid gap-2 p-2 bg-gray-100 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${format.cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: format.rows }, (_, row) =>
            Array.from({ length: format.cols }, (_, col) => {
              const wellId = `${String.fromCharCode(65 + row)}${col + 1}`;
              const wellData = plateData[wellId] || {};
              // Lógica de busca do alvo atualizada para usar o alvo padrão como fallback seguro
              const target = targets.find(t => t.id === wellData.targetId) || emptyTarget;
              
              return (
                <Well
                  key={wellId}
                  wellId={wellId}
                  wellData={wellData}
                  target={target}
                  isBeingDraggedOver={draggedOverWells.has(wellId)}
                  onMouseDown={onWellMouseDown}
                  onMouseEnter={onWellMouseEnter}
                  onDoubleClick={onWellDoubleClick}
                />
              );
            })
          )}
        </div>
         <div className="text-sm font-semibold text-gray-700 mt-4">Total de reações: {totalReactions}</div>
      </CardContent>
    </Card>
  );
}

