// src/components/PrintLayout.jsx

import React from 'react';

const PLATE_FORMATS = {
  '96': { rows: 8, cols: 12 },
  '384': { rows: 16, cols: 24 },
  '48': { rows: 6, cols: 8 }
};

export function PrintLayout({ projectName, plateFormat, plateData, targets }) {
  const format = PLATE_FORMATS[plateFormat];
  if (!format) return null;

  return (
    <div className="print-only">
      <h1 className="text-2xl font-bold mb-4">Projeto: {projectName}</h1>
      <h2 className="text-xl font-semibold mb-2">Layout da Placa ({format.rows}x{format.cols})</h2>
      
      {/* Legenda dos Alvos */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Legenda de Alvos:</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
          {targets.map(target => (
            <div key={target.id} className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: target.color }}></div>
              <span>{target.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grelha da Placa para Impressão */}
      <div className="grid border border-gray-400" style={{
        gridTemplateColumns: `repeat(${format.cols}, minmax(0, 1fr))`,
        width: '100%',
        aspectRatio: `${format.cols / format.rows}`
      }}>
        {Array.from({ length: format.rows }, (_, row) =>
          Array.from({ length: format.cols }, (_, col) => {
            const wellId = `${String.fromCharCode(65 + row)}${col + 1}`;
            const well = plateData[wellId];
            const target = well ? targets.find(t => t.id === well.targetId) : null;

            return (
              <div 
                key={wellId} 
                className="border border-gray-300 p-1 flex flex-col justify-between text-[8px] leading-tight"
                style={{ backgroundColor: target ? target.color : '#FFFFFF' }}
              >
                <div className="flex justify-between">
                  <span className="font-bold">{wellId}</span>
                  <span className="font-bold text-gray-600">{target ? target.name.substring(0, 4) : ''}</span>
                </div>
                <div className="text-center text-gray-700 break-words">
                  {well ? well.sampleName : ''}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
