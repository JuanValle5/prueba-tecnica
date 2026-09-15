import React, { useState, useRef, useEffect } from 'react';
import { Note, NoteStatus } from '../types';
import { GripVertical, Trash2, Check, Save } from 'lucide-react';

interface PostItNoteProps {
  note: Note;
  onUpdate: (id: number, data: { title: string; content: string; status: NoteStatus; color?: string }) => Promise<void>;
  onPositionChange: (id: number, posX: number, posY: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const STATUS_CONFIG: Record<NoteStatus, { label: string; badgeClass: string }> = {
  PENDIENTE: {
    label: 'Pendiente',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  EN_CURSO: {
    label: 'En curso',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  HECHO: {
    label: 'Hecho',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
};

const COLOR_PALETTE = [
  '#FEF08A', // Amarillo clásico
  '#BAE6FD', // Azul cielo
  '#BBF7D0', // Verde menta
  '#FED7AA', // Naranja suave
  '#FBCFE8', // Rosa suave
  '#E9D5FF', // Púrpura suave
];

export const PostItNote: React.FC<PostItNoteProps> = ({
  note,
  onUpdate,
  onPositionChange,
  onDelete,
  canvasRef,
}) => {
  // Estado local editable in-situ
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || '');
  const [status, setStatus] = useState<NoteStatus>(note.status);
  const [color, setColor] = useState(note.color || '#FEF08A');

  // Estado de posición y arrastre
  const [pos, setPos] = useState({ x: note.posX, y: note.posY });
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number } | null>(null);

  // Sincronizar si cambia desde props
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content || '');
    setStatus(note.status);
    setColor(note.color || '#FEF08A');
    setPos({ x: note.posX, y: note.posY });
  }, [note]);

  // Manejo de Arrastrar y Soltar libre (Drag and Drop)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Si el clic fue en un input, textarea, select o botón, no iniciar arrastre
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SVG', 'PATH'].includes(target.tagName)) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: pos.x,
      initialPosY: pos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;

      const maxW = (canvasRef.current?.offsetWidth || 1600) - 300;
      const maxH = (canvasRef.current?.offsetHeight || 1400) - 260;

      const newX = Math.max(10, Math.min(maxW, Math.round(dragStartRef.current.initialPosX + dx)));
      const newY = Math.max(10, Math.min(maxH, Math.round(dragStartRef.current.initialPosY + dy)));

      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = async (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);

      if (!dragStartRef.current) return;
      const dx = upEvent.clientX - dragStartRef.current.startX;
      const dy = upEvent.clientY - dragStartRef.current.startY;

      // Si hubo movimiento efectivo, guardar automáticamente la nueva posición
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        const maxW = (canvasRef.current?.offsetWidth || 1600) - 300;
        const maxH = (canvasRef.current?.offsetHeight || 1400) - 260;
        const finalX = Math.max(10, Math.min(maxW, Math.round(dragStartRef.current.initialPosX + dx)));
        const finalY = Math.max(10, Math.min(maxH, Math.round(dragStartRef.current.initialPosY + dy)));
        await onPositionChange(note.id, finalX, finalY);
      }
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Guardar cambios de título, contenido y estado
  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(note.id, {
        title: title.trim(),
        content: content.trim(),
        status,
        color,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Error al guardar nota:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar la nota "${title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(note.id);
      } catch (err) {
        console.error('Error al eliminar nota:', err);
        setIsDeleting(false);
      }
    }
  };

  const hasUnsavedChanges =
    title !== note.title ||
    content !== (note.content || '') ||
    status !== note.status ||
    color !== (note.color || '#FEF08A');

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        backgroundColor: color,
        width: '290px',
      }}
      className={`absolute top-0 left-0 p-4 rounded-xl post-it-shadow transition-shadow select-none ${
        isDragging ? 'post-it-dragging' : ''
      }`}
    >
      {/* Cabecera del post-it: Agarre, Estado y Eliminar */}
      <div className="flex items-center justify-between gap-1 pb-2 border-b border-black/10 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-1 text-slate-700">
          <GripVertical className="w-4 h-4 text-slate-500 opacity-60" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Nota #{note.id}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Selector de color rápido */}
          <div className="flex items-center gap-0.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-3.5 h-3.5 rounded-full border border-black/20 transition-transform ${
                  color === c ? 'scale-125 ring-1 ring-slate-700' : 'hover:scale-110'
                }`}
              />
            ))}
          </div>

          {/* Botón eliminar */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Eliminar nota"
            className="p-1 rounded text-slate-600 hover:text-red-700 hover:bg-black/10 transition-colors ml-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Título editable in-situ */}
      <div className="mt-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la nota..."
          className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-black/20 rounded px-1.5 py-0.5 placeholder:text-slate-500 border border-transparent hover:border-black/10 transition-colors"
        />
      </div>

      {/* Contenido / Texto editable in-situ */}
      <div className="mt-2">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe el texto de la nota..."
          className="w-full bg-transparent text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-black/20 rounded p-1.5 placeholder:text-slate-500 resize-none border border-transparent hover:border-black/10 transition-colors"
        />
      </div>

      {/* Pie del Post-it: Selector de Estado y Botón de Guardar */}
      <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between gap-2">
        {/* Selector de estado */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as NoteStatus)}
          className={`text-xs font-semibold px-2 py-1 rounded-md border shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-700 ${STATUS_CONFIG[status].badgeClass}`}
        >
          <option value="PENDIENTE">⏳ Pendiente</option>
          <option value="EN_CURSO">🚀 En curso</option>
          <option value="HECHO">✅ Hecho</option>
        </select>

        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold shadow-xs transition-all ${
            savedSuccess
              ? 'bg-emerald-600 text-white'
              : hasUnsavedChanges
              ? 'bg-slate-900 text-white hover:bg-slate-800 ring-2 ring-amber-400 animate-pulse'
              : 'bg-slate-800/80 text-white hover:bg-slate-900'
          }`}
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>¡Listo!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
