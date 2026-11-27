// src/components/SamplesPanel.jsx — Lista de amostras editável (adicionar, renomear, remover) e pincel de amostra

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Eraser, Plus, Pencil, X, Check, Trash2 } from 'lucide-react';

/** Separa texto colado (uma amostra por linha; aceita colunas do Excel e pega a 1ª). */
function splitNames(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.split('\t')[0].trim())
    .filter(Boolean);
}

function SampleRow({ name, index, active, count, onSelect, onRename, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const startEdit = () => {
    setDraft(name);
    setEditing(true);
  };
  const save = () => {
    if (onRename(name, draft)) setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="h-8 text-sm"
          aria-label={`Novo nome para ${name}`}
        />
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={save} aria-label="Salvar nome"><Check className="h-4 w-4 text-green-600" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditing(false)} aria-label="Cancelar"><X className="h-4 w-4" /></Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center">
      <Button
        variant={active ? 'secondary' : 'ghost'}
        className={`flex-1 min-w-0 justify-between h-8 text-sm ${active ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => onSelect(name)}
        onDoubleClick={startEdit}
        title="Clique para usar como pincel · duplo clique para renomear"
      >
        <span className="truncate"><span className="text-gray-400 mr-2">{index + 1}</span>{name}</span>
        {count ? <span className="ml-1 shrink-0 rounded-full bg-green-100 px-1.5 text-[11px] text-green-800" title={`${count} poço(s) com esta amostra`}>{count}</span> : null}
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-60 group-hover:opacity-100" onClick={startEdit} aria-label={`Renomear ${name}`} title="Renomear (também nos poços)">
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-60 group-hover:opacity-100" onClick={() => onRemove(name)} aria-label={`Remover ${name}`} title="Remover da lista (os poços mantêm o nome)">
        <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
      </Button>
    </div>
  );
}

export function SamplesPanel({
  sampleList,
  activeSampleName,
  onSelectSample,
  onAddSamples,
  onRenameSample,
  onRemoveSample,
  onClearSamples,
  autoAdvance,
  setAutoAdvance,
  plateData,
}) {
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState('');

  // quantos poços já têm cada amostra
  const usage = Object.values(plateData).reduce((acc, well) => {
    if (well?.sampleName) acc[well.sampleName] = (acc[well.sampleName] || 0) + 1;
    return acc;
  }, {});

  const add = (names) => {
    const { added, duplicates } = onAddSamples(names);
    setMessage(duplicates.length ? `Já na lista: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '…' : ''}` : added > 1 ? `${added} amostras adicionadas` : '');
    if (added) setNewName('');
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text');
    if (!/\r?\n/.test(text.trim())) return; // um nome só: colagem normal
    e.preventDefault();
    add(splitNames(text));
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2"><Users className="h-4 w-4" />Amostras ({sampleList.length})</Label>

      <div className="flex gap-1">
        <Input
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setMessage(''); }}
          onKeyDown={(e) => e.key === 'Enter' && newName.trim() && add([newName])}
          onPaste={handlePaste}
          placeholder="Nova amostra"
          className="h-8 text-sm"
          aria-label="Nome da nova amostra"
        />
        <Button size="icon" className="h-8 w-8 shrink-0" onClick={() => newName.trim() && add([newName])} aria-label="Adicionar amostra">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {message && <p className="text-xs text-amber-700">{message}</p>}
      <p className="text-xs text-gray-500">Enter adiciona. Para várias, cole uma coluna do Excel no campo.</p>

      {sampleList.length === 0 ? (
        <p className="text-xs text-gray-500">
          Nenhuma amostra ainda. Adicione acima ou envie a lista pelo Lab MasterMix.
        </p>
      ) : (
        <>
          <p className="text-xs text-gray-500">Escolha uma amostra e clique/arraste nos poços. O lápis renomeia, inclusive nos poços; o número verde é quantos poços ela já tem.</p>
          <Button
            variant={activeSampleName === '' ? 'secondary' : 'ghost'}
            className={`w-full justify-start h-8 text-sm ${activeSampleName === '' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => onSelectSample('')}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Apagar nome da amostra
          </Button>
          <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
            {sampleList.map((name, index) => (
              <SampleRow
                key={name}
                name={name}
                index={index}
                active={activeSampleName === name}
                count={usage[name]}
                onSelect={onSelectSample}
                onRename={onRenameSample}
                onRemove={onRemoveSample}
              />
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />
            Ao soltar, selecionar a próxima amostra
          </label>
          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500" onClick={onClearSamples}>
            <Trash2 className="h-4 w-4 mr-2" /> Remover lista de amostras
          </Button>
        </>
      )}
    </div>
  );
}
