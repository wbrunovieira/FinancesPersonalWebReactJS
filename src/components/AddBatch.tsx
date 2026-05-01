import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { isValidDateTime } from '../utils/dateUtils';

interface Category {
  id: number;
  name: string;
}

interface BatchRow {
  id: string;
  date: string;
  description: string;
  amount: string;
}

type FieldName = 'date' | 'description' | 'amount';
const FIELDS: FieldName[] = ['date', 'description', 'amount'];

function getCurrentDateTime(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${d}/${m}/${now.getFullYear()} ${h}:${min}`;
}

function toISOString(dateStr: string): string {
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('/');
  return new Date(`${year}-${month}-${day}T${timePart}`).toISOString();
}

function newRow(date: string): BatchRow {
  return { id: crypto.randomUUID(), date, description: '', amount: '' };
}

export function AddBatch() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<BatchRow[]>(() => [newRow(getCurrentDateTime())]);
  const [submitting, setSubmitting] = useState(false);

  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/categories?category_type=${type}`
        );
        if (res.ok) setCategories(await res.json());
      } catch {
        // silently fail — user will see empty select
      }
    };
    fetchCats();
    setCategoryId('');
  }, [type]);

  // Auto-focus first date field when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const firstRow = rows[0];
      cellRefs.current.get(`${firstRow.id}-date`)?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const setRef = (rowId: string, field: FieldName) => (el: HTMLInputElement | null) => {
    const key = `${rowId}-${field}`;
    if (el) cellRefs.current.set(key, el);
    else cellRefs.current.delete(key);
  };

  const focusCell = (rowId: string, field: FieldName) => {
    cellRefs.current.get(`${rowId}-${field}`)?.focus();
  };

  const updateCell = (rowId: string, field: FieldName, value: string) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
  };

  const addRowAfter = (rowIndex: number) => {
    const date = rows[rowIndex].date;
    const next = newRow(date);
    setRows(prev => {
      const copy = [...prev];
      copy.splice(rowIndex + 1, 0, next);
      return copy;
    });
    // focus new row's date after render
    setTimeout(() => focusCell(next.id, 'date'), 0);
  };

  const deleteRow = (rowId: string) => {
    setRows(prev => {
      if (prev.length === 1) return prev;
      const idx = prev.findIndex(r => r.id === rowId);
      const next = prev.filter(r => r.id !== rowId);
      // focus nearest surviving row
      const targetIdx = Math.min(idx, next.length - 1);
      setTimeout(() => focusCell(next[targetIdx].id, 'amount'), 0);
      return next;
    });
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: FieldName
  ) => {
    const fieldIndex = FIELDS.indexOf(field);

    // ↑ — row above, same field
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) focusCell(rows[rowIndex - 1].id, field);
      return;
    }

    // ↓ — row below, same field
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < rows.length - 1) focusCell(rows[rowIndex + 1].id, field);
      return;
    }

    // Enter: advance field or create new row
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'amount') {
        addRowAfter(rowIndex);
      } else {
        focusCell(rows[rowIndex].id, FIELDS[fieldIndex + 1]);
      }
      return;
    }

    // Delete row shortcut: Ctrl+Backspace or Ctrl+Delete on any empty row
    if ((e.key === 'Backspace' || e.key === 'Delete') && e.ctrlKey) {
      e.preventDefault();
      deleteRow(rows[rowIndex].id);
      return;
    }
  };

  const handleSubmit = async () => {
    const valid = rows.filter(r => r.amount && r.date && isValidDateTime(r.date));
    if (!valid.length || !categoryId) {
      alert('Selecione a categoria e preencha ao menos um valor com data válida.');
      return;
    }

    setSubmitting(true);
    try {
      const results = await Promise.allSettled(
        valid.map(row =>
          fetch(`${import.meta.env.VITE_API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: 1,
              amount: parseFloat(row.amount),
              description: row.description,
              category_id: parseInt(categoryId, 10),
              type,
              date: toISOString(row.date),
            }),
          })
        )
      );

      const failed = results.filter(r => r.status === 'rejected').length;
      const sent = valid.length - failed;
      alert(
        failed
          ? `${sent} enviado(s), ${failed} falharam.`
          : `${sent} lançamento(s) enviados com sucesso!`
      );

      if (!failed) {
        setRows([newRow(getCurrentDateTime())]);
        setCategoryId('');
        setIsOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setRows([newRow(getCurrentDateTime())]);
    setCategoryId('');
  };

  const validCount = rows.filter(r => r.amount && r.date).length;

  return (
    <div className="py-4 flex items-center justify-center">
      <button
        className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition duration-300"
        onClick={() => setIsOpen(true)}
      >
        Lançamento em Lote
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onKeyDown={e => e.key === 'Escape' && close()}
        >
          <div className="bg-white rounded-lg p-6 w-[760px] max-h-[85vh] flex flex-col shadow-lg">
            <h4 className="text-lg font-bold mb-4">Lançamento em Lote</h4>

            {/* Header: tipo + categoria */}
            <div className="flex gap-3 mb-5">
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="expense">Despesa</option>
                <option value="income">Renda</option>
                <option value="investment">Investimento</option>
              </select>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Selecione a categoria</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[160px_1fr_130px_28px] gap-2 px-1 mb-1">
              <span className="text-xs text-gray-400 font-semibold uppercase">Data</span>
              <span className="text-xs text-gray-400 font-semibold uppercase">Descrição</span>
              <span className="text-xs text-gray-400 font-semibold uppercase">Valor (R$)</span>
              <span />
            </div>

            {/* Editable rows */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {rows.map((row, rowIndex) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[160px_1fr_130px_28px] gap-2 items-center"
                >
                  <input
                    ref={setRef(row.id, 'date')}
                    type="text"
                    placeholder="DD/MM/AAAA HH:mm"
                    value={row.date}
                    onChange={e => updateCell(row.id, 'date', e.target.value)}
                    onKeyDown={e => handleKeyDown(e, rowIndex, 'date')}
                    className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <input
                    ref={setRef(row.id, 'description')}
                    type="text"
                    placeholder="Descrição"
                    value={row.description}
                    onChange={e => updateCell(row.id, 'description', e.target.value)}
                    onKeyDown={e => handleKeyDown(e, rowIndex, 'description')}
                    className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <input
                    ref={setRef(row.id, 'amount')}
                    type="number"
                    placeholder="0,00"
                    value={row.amount}
                    onChange={e => updateCell(row.id, 'amount', e.target.value)}
                    onKeyDown={e => handleKeyDown(e, rowIndex, 'amount')}
                    className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                  <button
                    tabIndex={-1}
                    onClick={() => deleteRow(row.id)}
                    className="text-gray-300 hover:text-red-400 text-xl leading-none pb-0.5"
                    title="Remover linha"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-gray-400 mt-3">
              <kbd className="bg-gray-100 px-1 rounded">↑</kbd>
              <kbd className="bg-gray-100 px-1 rounded ml-1">↓</kbd> navegar entre linhas &nbsp;·&nbsp;
              <kbd className="bg-gray-100 px-1 rounded">Enter</kbd> avançar campo / nova linha &nbsp;·&nbsp;
              <kbd className="bg-gray-100 px-1 rounded">Ctrl+Backspace</kbd> remover linha &nbsp;·&nbsp;
              <kbd className="bg-gray-100 px-1 rounded">Esc</kbd> fechar
            </p>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">{validCount} lançamento(s) prontos</span>
              <div className="flex gap-3">
                <button
                  className="bg-gray-200 text-black px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                  onClick={close}
                >
                  Cancelar
                </button>
                <button
                  disabled={submitting || validCount === 0 || !categoryId}
                  className="bg-neutral-800 text-neutral-100 px-4 py-2 rounded-md hover:bg-neutral-700 disabled:opacity-40 text-sm"
                  onClick={handleSubmit}
                >
                  {submitting ? 'Enviando...' : `Enviar ${validCount} lançamento(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
