import React, { useEffect, useState, useRef } from 'react';
import { Note, NoteStatus } from '../types';
import { api } from '../services/api';
import { PostItNote } from '../components/PostItNote';
import { Plus, RefreshCw, Layers, AlertCircle } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Modal para nueva nota
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newStatus, setNewStatus] = useState<NoteStatus>('PENDIENTE');
  const [newColor, setNewColor] = useState('#FEF08A');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const fetchNotes = async () => {
    try {
      setError(null);
      const data = await api.notes.getAll();
      setNotes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las notas del tablero.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Actualizar contenido y estado de la nota
  const handleUpdateNote = async (
    id: number,
    data: { title: string; content: string; status: NoteStatus; color?: string }
  ) => {
    const updated = await api.notes.update(id, data);
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
  };

  // Guardado automático de la nueva posición al soltar la nota (Drag & Drop)
  const handlePositionChange = async (id: number, posX: number, posY: number) => {
    // Actualización optimista inmediata
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, posX, posY } : n)));
    try {
      await api.notes.updatePosition(id, posX, posY);
    } catch (err) {
      console.error('Error al persistir posición:', err);
    }
  };

  // Eliminar nota
  const handleDeleteNote = async (id: number) => {
    await api.notes.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Crear nueva nota
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      // Posición inteligente calculada según cantidad de notas existentes
      const count = notes.length;
      const calculatedX = 60 + ((count % 4) * 310);
      const calculatedY = 60 + (Math.floor(count / 4) * 260);

      const created = await api.notes.create({
        title: newTitle.trim(),
        content: newContent.trim(),
        status: newStatus,
        posX: calculatedX,
        posY: calculatedY,
        color: newColor,
      });

      setNotes((prev) => [...prev, created]);
      setNewTitle('');
      setNewContent('');
      setNewStatus('PENDIENTE');
      setShowCreateModal(false);
    } catch (err: any) {
      alert(err.message || 'Error al crear la nota');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-200">
      {/* Barra de Control Superior */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Lienzo Libre Compartido</h1>
            <p className="text-xs text-slate-500">
              Arrastra y suelta las notas para organizarlas. Las posiciones se guardan automáticamente.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotes}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition-colors shadow-xs"
            title="Recargar notas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Nota Post-it</span>
          </button>
        </div>
      </div>

      {/* Alerta de error si ocurre */}
      {error && (
        <div className="m-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Contenedor del Lienzo Libre con Scroll */}
      <div className="flex-1 overflow-auto p-6 relative">
        <div
          ref={canvasRef}
          className="relative rounded-2xl canvas-grid border border-slate-300 shadow-inner"
          style={{
            minWidth: '1600px',
            minHeight: '1400px',
            width: '100%',
          }}
        >
          {isLoading && notes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium text-slate-500">Cargando tablero...</span>
              </div>
            </div>
          ) : (
            notes.map((note) => (
              <PostItNote
                key={note.id}
                note={note}
                onUpdate={handleUpdateNote}
                onPositionChange={handlePositionChange}
                onDelete={handleDeleteNote}
                canvasRef={canvasRef}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal de Creación de Nueva Nota */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Crear Nueva Nota</h2>
            <p className="text-xs text-slate-500 mb-4">
              La nueva nota se agregará al lienzo libre y podrás moverla a tu gusto.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Título de la Nota
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Calibrar sensores LoRaWAN"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Descripción o Texto
                </label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Detalles sobre la actividad o tarea..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as NoteStatus)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="PENDIENTE">⏳ Pendiente</option>
                    <option value="EN_CURSO">🚀 En curso</option>
                    <option value="HECHO">✅ Hecho</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Color Post-it
                  </label>
                  <div className="flex items-center gap-1.5 mt-2">
                    {['#FEF08A', '#BAE6FD', '#BBF7D0', '#FED7AA', '#FBCFE8', '#E9D5FF'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border border-black/20 transition-transform ${
                          newColor === c ? 'scale-115 ring-2 ring-sky-600' : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creando...' : 'Crear Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
