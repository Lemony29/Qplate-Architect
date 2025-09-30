// src/components/PrintLayout.jsx
import React from 'react';

// Função para verificar se uma cor HEX é escura
function isColorDark(hexColor) {
  if (!hexColor || hexColor.length < 4) return false;
  const color = hexColor.substring(1); // remove #
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < 140; // Limiar ajustado para bom contraste
}

export function PrintLayout({ 
  plateData, 
  targets, 
  plateFormat, 
  projectName, 
  calculatedMix, 
  totalMixVolume,
  marginType,
  extraSamples,
  extraPercentage
}) {
  const plateInfo = {
    '96': { rows: 8, cols: 12, name: '96 poços (8x12)' },
    '384': { rows: 16, cols: 24, name: '384 poços (16x24)' },
    '48': { rows: 6, cols: 8, name: '48 poços (6x8)' },
  }[plateFormat] || { rows: 0, cols: 0, name: 'Formato Desconhecido' };

  const getTargetById = (id) => targets.find(t => t.id === id);

  const baseReactions = Object.values(plateData).filter(well => well && well.targetId !== 'empty').length;
  let reactionCountText = '';
  if (baseReactions > 0) {
      if (marginType === 'extra') {
          const extra = parseInt(extraSamples || 0);
          const total = baseReactions + extra;
          reactionCountText = `(para ${total} reações = ${baseReactions} da placa + ${extra} extra)`;
      } else {
          const percentage = parseInt(extraPercentage || 0);
          const total = Math.ceil(baseReactions * (1 + (percentage / 100)));
          reactionCountText = `(para ${total} reações = ${baseReactions} da placa + ${percentage}% extra)`;
      }
  }

  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold mb-2">Projeto: {projectName}</h1>
      <h2 className="text-xl mb-2">Layout da Placa ({plateInfo.name})</h2>
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Legenda de Alvos:</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {targets.filter(t => t.id !== 'empty').map(target => (
            <div key={target.id} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2 border border-gray-500"
                style={{ backgroundColor: target.color }}
              />
              <span>{target.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div 
        className="grid" 
        style={{ 
          gridTemplateColumns: `repeat(${plateInfo.cols}, minmax(0, 1fr))`,
          borderTop: '1px solid black',
          borderLeft: '1px solid black',
        }}
      >
        {Array.from({ length: plateInfo.rows }, (_, row) =>
          Array.from({ length: plateInfo.cols }, (_, col) => {
            const wellId = `${String.fromCharCode(65 + row)}${col + 1}`;
            const well = plateData[wellId];
            const target = well ? getTargetById(well.targetId) : null;
            
            const bgColor = (target && target.id !== 'empty') ? target.color : '#FFFFFF';
            const textColor = isColorDark(bgColor) ? 'text-white' : 'text-black';

            return (
              <div
                key={wellId}
                className={`p-1 ${textColor} flex flex-col justify-between`}
                style={{ 
                  backgroundColor: bgColor, 
                  minHeight: '60px',
                  borderBottom: '1px solid black',
                  borderRight: '1px solid black',
                }}
              >
                <div className="flex justify-between items-start text-xs">
                  <span className="font-bold">{wellId}</span>
                </div>
                {target && target.id !== 'empty' && (
                  <div className="text-center">
                    <p className="font-bold text-sm truncate">{target.name}</p>
                    <p className="text-xs truncate">{well.sampleName || ''}</p>
                  </div>
                )}
                <div />
              </div>
            );
          })
        )}
      </div>

      {calculatedMix && calculatedMix.length > 0 && (
        <div className="mt-6 break-inside-avoid">
          <h3 className="text-lg font-bold mb-2">
            Cálculo do Master Mix:
            {reactionCountText && <span className="text-base font-normal ml-2">{reactionCountText}</span>}
          </h3>
          <table className="w-full text-sm border border-collapse border-gray-400">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-100">
                <th className="text-left p-2 border-r border-gray-400">Reagente</th>
                <th className="text-right p-2 border-r border-gray-400">Vol/Reação (µL)</th>
                <th className="text-right p-2">Vol Total (µL)</th>
              </tr>
            </thead>
            <tbody>
              {calculatedMix.map((reagent, index) => (
                <tr key={index} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{reagent.name}</td>
                  <td className="p-2 text-right border-r border-gray-400">{reagent.volumePerReaction}</td>
                  <td className="p-2 text-right font-bold">{reagent.totalVolume}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="2" className="p-2 text-right border-r border-gray-400">Volume Total Final:</td>
                <td className="p-2 text-right">{totalMixVolume} µL</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

