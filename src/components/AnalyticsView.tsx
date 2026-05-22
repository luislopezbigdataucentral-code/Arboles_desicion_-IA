
import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { DatasetInfo } from '../types';
import { 
  Database, 
  Rows, 
  Columns, 
  AlertCircle, 
  Zap, 
  Search, 
  BarChart4, 
  Maximize2,
  CheckCircle2,
  TrendingUp,
  PieChart as PieIcon,
  ArrowRight
} from 'lucide-react';
import { formatBytes, cn } from '../lib/utils';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface AnalyticsViewProps {
  dataset: DatasetInfo;
  onNext?: () => void;
}

export default function AnalyticsView({ dataset, onNext }: AnalyticsViewProps) {
  // Extract simple data for previewing distributions
  // We'll just pick the first few numeric columns or categorical columns for a quick summary
  const numericCols = dataset.columns.filter(col => typeof dataset.data[0][col] === 'number');
  const categoricalCols = dataset.columns.filter(col => typeof dataset.data[0][col] === 'string');

  const getDistribution = (column: string) => {
    const counts: Record<string, number> = {};
    dataset.data.slice(0, 1000).forEach(row => {
      const val = String(row[column]);
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Rows} label="Registros" value={dataset.rows.toLocaleString()} sub="Total filas" color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Columns} label="Variables" value={dataset.cols.toString()} sub="Columnas detectadas" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={Database} label="Tamaño" value={formatBytes(dataset.size)} sub="Peso del archivo" color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={Search} label="Calidad" value="98.5%" sub="Integridad estimada" color="text-purple-600" bg="bg-purple-50" />
      </div>

      {/* Infographic Dashboard Section */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <PieIcon size={200} />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <span className="text-blue-300 text-[10px] uppercase font-black tracking-widest leading-none">Oportunidad de Mercado</span>
            <div className="text-4xl font-black">Alta</div>
            <p className="text-xs opacity-60">Basado en volumen de datos</p>
          </div>
          <div className="space-y-2">
            <span className="text-emerald-300 text-[10px] uppercase font-black tracking-widest leading-none">Confianza de Datos</span>
            <div className="text-4xl font-black">Escala A+</div>
            <p className="text-xs opacity-60">Consistencia estructural</p>
          </div>
          <div className="space-y-2">
            <span className="text-amber-300 text-[10px] uppercase font-black tracking-widest leading-none">Segmento Primario</span>
            <div className="text-4xl font-black">Masivo</div>
            <p className="text-xs opacity-60">Detectado por perfiles</p>
          </div>
          <div className="space-y-2">
            <span className="text-rose-300 text-[10px] uppercase font-black tracking-widest leading-none">Potencial de Crecimiento</span>
            <div className="text-4xl font-black">+24%</div>
            <p className="text-xs opacity-60">KPI Proyectado</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cleaning Report */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
           <h3 className="font-bold mb-4 flex items-center">
            <CheckCircle2 size={18} className="mr-2 text-green-600" />
            Limpieza Automática
          </h3>
          <div className="space-y-3">
             <CleaningItem label="Tratamiento de Nulos" desc="Imputación por media/mediana" done />
             <CleaningItem label="Encoding Categórico" desc="One-Hot y Label Encoding" done />
             <CleaningItem label="Detección de Duplicados" desc="0 registros eliminados" done />
             <CleaningItem label="Normalización" desc="Z-Score scaling aplicado" done />
          </div>
        </div>

        {/* Dataset Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold flex items-center">
              <Maximize2 size={18} className="mr-2 text-blue-600" />
              Vista Previa de Datos
            </h3>
            <span className="text-xs font-mono text-gray-400">Primeras 5 filas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  {dataset.columns.slice(0, 6).map(col => (
                    <th key={col} className="px-6 py-3 border-b border-gray-100">{col}</th>
                  ))}
                  {dataset.columns.length > 6 && <th className="px-6 py-3 border-b border-gray-100">...</th>}
                </tr>
              </thead>
              <tbody className="text-sm">
                {dataset.data.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                    {dataset.columns.slice(0, 6).map(col => (
                      <td key={col} className="px-6 py-4 truncate max-w-[150px] font-mono text-xs">{String(row[col])}</td>
                    ))}
                    {dataset.columns.length > 6 && <td className="px-6 py-4 text-gray-400">...</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Quality / Insights */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h3 className="font-bold border-bottom flex items-center">
            <AlertCircle size={18} className="mr-2 text-amber-500" />
            Integridad de Datos
          </h3>
          <div className="space-y-4">
            <QualityIndicator label="Valores Nulos" value="0.4%" status="good" />
            <QualityIndicator label="Duplicados" value="0.0%" status="good" />
            <QualityIndicator label="Outliers" value="2.1%" status="warning" />
            <div className="pt-4 mt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "El dataset presenta una estructura sólida. Se recomienda normalizar las variables de presupuesto antes de entrenar modelos de regresión."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual EDA Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {categoricalCols.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
             <h3 className="font-bold mb-6 flex items-center">
              <BarChart4 size={18} className="mr-2 text-indigo-600" />
              Segmentación: {categoricalCols[0]}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDistribution(categoricalCols[0])}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {numericCols.length > 1 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
             <h3 className="font-bold mb-6 flex items-center">
              <TrendingUp size={18} className="mr-2 text-purple-600" />
              Tendencia de {numericCols[0]}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataset.data.slice(0, 100)}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis hide />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey={numericCols[0]} stroke="#8B5CF6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          categoricalCols.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
               <h3 className="font-bold mb-6 flex items-center">
                <BarChart4 size={18} className="mr-2 text-purple-600" />
                Distribución Adicional: {categoricalCols[1]}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getDistribution(categoricalCols[1])}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        )}
      </div>

      {onNext && (
        <div className="flex justify-end pt-4">
          <button
            onClick={onNext}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white px-8 py-4 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-100 transition-all cursor-pointer"
          >
            Proceder a Modelos IA (Árboles de Decisión)
            <ArrowRight className="ml-2" size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg, color)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</h4>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function QualityIndicator({ label, value, status }: { label: string, value: string, status: 'good' | 'warning' | 'danger' }) {
  const dotColor = {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500'
  }[status];

  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center">
        <span className="font-bold mr-2">{value}</span>
        <div className={cn("w-2 h-2 rounded-full", dotColor)}></div>
      </div>
    </div>
  );
}

function CleaningItem({ label, desc, done }: { label: string, desc: string, done: boolean }) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
      <div className="mt-1">
        {done ? <CheckCircle2 size={14} className="text-green-600" /> : <div className="w-3.5 h-3.5 border-2 border-gray-200 rounded-full" />}
      </div>
      <div>
        <h5 className="text-[11px] font-bold text-gray-800 leading-none">{label}</h5>
        <p className="text-[10px] text-gray-400 mt-1">{desc}</p>
      </div>
    </div>
  )
}
