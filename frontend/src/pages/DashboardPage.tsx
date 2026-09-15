import React, { useEffect, useState } from 'react';
import { DashboardMetrics } from '../types';
import { api } from '../services/api';
import { LayoutDashboard, RefreshCw, Zap, CheckCircle2, Clock, PlayCircle, AlertCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.dashboard.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener métricas del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const total = metrics?.totalNotes || 0;
  const pendientes = metrics?.byStatus.PENDIENTE || 0;
  const enCurso = metrics?.byStatus.EN_CURSO || 0;
  const hechos = metrics?.byStatus.HECHO || 0;

  const pctPendientes = total > 0 ? Math.round((pendientes / total) * 100) : 0;
  const pctEnCurso = total > 0 ? Math.round((enCurso / total) * 100) : 0;
  const pctHechos = total > 0 ? Math.round((hechos / total) * 100) : 0;

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard de Actividad y Métricas</h1>
            <p className="text-xs text-slate-500">
              Monitoreo en tiempo real del tablero de notas del equipo FIXLAT.
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar Métricas</span>
        </button>
      </div>

      {/* Banner de Integración con AWS Lambda */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border border-sky-200/70 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-white shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Cálculo Procesado con AWS Lambda</h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                metrics?.source === 'AWS_LAMBDA'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-sky-100 text-sky-800 border border-sky-300'
              }`}>
                {metrics?.source || 'AWS_LAMBDA'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Requerimiento de la prueba técnica: El cálculo y la entrega de estas métricas se realiza mediante una función Serverless AWS Lambda.
            </p>
          </div>
        </div>

        {metrics?.timestamp && (
          <div className="text-right text-[11px] text-slate-500">
            <span>Último cálculo: </span>
            <span className="font-mono font-medium text-slate-700">
              {new Date(metrics.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de Métricas Principales */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Notas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Notas</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <LayoutDashboard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500 font-medium">en el tablero</span>
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Pendientes</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-900">{pendientes}</span>
            <span className="text-xs font-semibold text-amber-700">{pctPendientes}% del total</span>
          </div>
        </div>

        {/* En Curso */}
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">En Curso</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-blue-900">{enCurso}</span>
            <span className="text-xs font-semibold text-blue-700">{pctEnCurso}% del total</span>
          </div>
        </div>

        {/* Hecho */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Hecho</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-900">{hechos}</span>
            <span className="text-xs font-semibold text-emerald-700">{pctHechos}% del total</span>
          </div>
        </div>
      </div>

      {/* Barra de Distribución Visual */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-2">Distribución Visual de Notas por Estado</h3>
        <p className="text-xs text-slate-500 mb-4">
          Proporción porcentual calculada por la función analítica.
        </p>

        {total === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay notas en el tablero actualmente.</p>
        ) : (
          <div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${pctPendientes}%` }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`Pendientes: ${pctPendientes}%`}
              />
              <div
                style={{ width: `${pctEnCurso}%` }}
                className="bg-sky-500 h-full transition-all duration-500"
                title={`En curso: ${pctEnCurso}%`}
              />
              <div
                style={{ width: `${pctHechos}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Hecho: ${pctHechos}%`}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Pendientes: {pendientes} ({pctPendientes}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <span>En curso: {enCurso} ({pctEnCurso}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Hecho: {hechos} ({pctHechos}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
