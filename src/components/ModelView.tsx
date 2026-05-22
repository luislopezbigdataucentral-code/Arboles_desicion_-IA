import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Play, 
  BarChart2, 
  Cpu, 
  Trophy, 
  GitBranch, 
  Settings2, 
  Download, 
  Flame, 
  Sliders, 
  TrendingUp, 
  Gauge,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Activity,
  ArrowRight,
  GitCommit,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { DatasetInfo } from '../types';
import { trainPredictiveModel } from '../lib/gemini';
import { cn } from '../lib/utils';

interface ModelViewProps {
  dataset: DatasetInfo;
  onNext?: () => void;
}

// Tree node definition for visualizer
interface ModelTreeNode {
  name: string;
  type: 'split' | 'leaf';
  condition?: string;
  value?: string;
  pct: string;
  prob: string;
  color?: string;
  yes?: ModelTreeNode;
  no?: ModelTreeNode;
}

export default function ModelView({ dataset, onNext }: ModelViewProps) {
  const [training, setTraining] = useState(false);
  const [modelResult, setModelResult] = useState<any | null>(null);
  const [targetVar, setTargetVar] = useState<string>('');

  // Tree interactive parameters
  const [criterion, setCriterion] = useState<'gini' | 'entropy'>('gini');
  const [maxDepth, setMaxDepth] = useState<number>(4);
  const [selectedNodePath, setSelectedNodePath] = useState<string[]>([]);

  // Simulation parameters for current interactive prediction path
  const [simP1, setSimP1] = useState<boolean>(true);
  const [simP2, setSimP2] = useState<boolean>(true);
  const [simP3, setSimP3] = useState<boolean>(true);
  const [simP4, setSimP4] = useState<boolean>(true);

  // Dynamically set first target variable on dataset load
  useEffect(() => {
    if (dataset && dataset.columns.length > 0) {
      if (dataset.columns.includes('desayuno')) {
        setTargetVar('desayuno');
      } else if (dataset.columns.includes('Compra_Convertida')) {
        setTargetVar('Compra_Convertida');
      } else {
        setTargetVar(dataset.columns[dataset.columns.length - 1]);
      }
    }
  }, [dataset]);

  // Run predictive model training simulator
  const runSimulation = async () => {
    if (!targetVar) return;
    setTraining(true);
    try {
      const sample = dataset.data.slice(0, 100);
      const result = await trainPredictiveModel(sample, targetVar);
      await new Promise(r => setTimeout(r, 1450));
      setModelResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setTraining(false);
    }
  };

  // Build simulated classification tree based on active dataset columns and depth
  const getDecisionTree = (): ModelTreeNode => {
    const predictors = dataset.columns.filter(c => c !== targetVar);
    const p1 = predictors[0] || 'V1';
    const p2 = predictors[1] || 'V2';
    const p3 = predictors[2] || 'V3';
    const p4 = predictors[3] || 'V4';

    return {
      name: p1,
      type: 'split',
      condition: `¿${p1} por encima de la media de comportamiento?`,
      pct: '100%',
      prob: criterion === 'gini' ? '0.52' : '1.24',
      yes: {
        name: p2,
        type: 'split',
        condition: `¿${p2} tiene tendencia alta/frecuente?`,
        pct: '64%',
        prob: criterion === 'gini' ? '0.78' : '0.45',
        yes: {
          name: p3,
          type: maxDepth >= 3 ? 'split' : 'leaf',
          condition: maxDepth >= 3 ? `¿${p3} es superior al promedio?` : undefined,
          value: maxDepth >= 3 ? undefined : 'Óptima fidelidad con recompra continua',
          pct: '42%',
          prob: criterion === 'gini' ? '0.88' : '0.22',
          yes: {
            name: p4,
            type: maxDepth >= 4 ? 'split' : 'leaf',
            condition: maxDepth >= 4 ? `¿${p4} tiene interacción digital premium?` : undefined,
            value: maxDepth >= 4 ? undefined : 'Cliente Embajador de Marca',
            pct: '28%',
            prob: criterion === 'gini' ? '0.96' : '0.10',
            yes: {
              name: 'SÚPER PROMOTOR',
              type: 'leaf',
              value: 'Afinidad máxima. Comportamiento estrella y LTV más alto proyectado en desayuno.',
              pct: '18%',
              prob: criterion === 'gini' ? '0.99' : '0.04',
              color: 'emerald'
            },
            no: {
              name: 'CLIENTE ESTABLE',
              type: 'leaf',
              value: 'Conversión segura con recompra de desayuno predecible. Requiere pauta recurrente.',
              pct: '10%',
              prob: criterion === 'gini' ? '0.82' : '0.24',
              color: 'teal'
            }
          },
          no: {
            name: 'SENSIBLE A PRECIO',
            type: maxDepth >= 4 ? 'split' : 'leaf',
            condition: maxDepth >= 4 ? '¿Reacciona favorablemente a descuentos?' : undefined,
            value: maxDepth >= 4 ? undefined : 'Propensión moderada condicional',
            pct: '14%',
            prob: criterion === 'gini' ? '0.62' : '0.58',
            yes: {
              name: 'CAZADOR DE DE DEALS',
              type: 'leaf',
              value: 'Adquiere desayuno únicamente con cupones o reducciones tarifas.',
              pct: '9%',
              prob: criterion === 'gini' ? '0.74' : '0.36',
              color: 'blue'
            },
            no: {
              name: 'CLIENTE CASUAL',
              type: 'leaf',
              value: 'Baja afinidad. Compra orgánica esporádica sin retención directa.',
              pct: '5%',
              prob: criterion === 'gini' ? '0.40' : '0.85',
              color: 'amber'
            }
          }
        },
        no: {
          name: 'ADOPTANTE TARDÍO',
          type: maxDepth >= 3 ? 'split' : 'leaf',
          condition: maxDepth >= 3 ? `¿${p3} es baja frecuencia?` : undefined,
          value: maxDepth >= 3 ? undefined : 'Comprador esporádico con ticket moderado',
          pct: '22%',
          prob: criterion === 'gini' ? '0.44' : '0.88',
          yes: {
            name: 'INTERACCIÓN TRADICIONAL',
            type: 'leaf',
            value: 'Conversión lenta. Necesita canales de cercanía ó físicos.',
            pct: '15%',
            prob: criterion === 'gini' ? '0.51' : '0.70',
            color: 'amber'
          },
          no: {
            name: 'RIESGO DE CHURN LENTO',
            type: 'leaf',
            value: 'Nivel medio de abandono. Implementar plan de alertas promocionales.',
            pct: '7%',
            prob: criterion === 'gini' ? '0.29' : '0.94',
            color: 'rose'
          }
        }
      },
      no: {
        name: p2,
        type: maxDepth >= 3 ? 'split' : 'leaf',
        condition: maxDepth >= 3 ? `¿${p2} presenta interacción omnicanal?` : undefined,
        value: maxDepth >= 3 ? undefined : 'Sin respuesta favorable sin campañas directas',
        pct: '36%',
        prob: criterion === 'gini' ? '0.18' : '1.80',
        yes: {
          name: p3,
          type: maxDepth >= 4 ? 'split' : 'leaf',
          condition: maxDepth >= 4 ? `¿${p3} es reactivo a Email?` : undefined,
          value: maxDepth >= 4 ? undefined : 'Afinidad lenta en madurez alta',
          pct: '20%',
          prob: criterion === 'gini' ? '0.28' : '1.45',
          yes: {
            name: 'CLIENTE EDUCADO',
            type: 'leaf',
            value: 'Fiel tras ciclos informativos o talleres de nutrición.',
            pct: '12%',
            prob: criterion === 'gini' ? '0.45' : '0.92',
            color: 'teal'
          },
          no: {
            name: 'LEAD FRÍO DORMIDO',
            type: 'leaf',
            value: 'Interés inicial nulo. Priorizar otras audiencias.',
            pct: '8%',
            prob: criterion === 'gini' ? '0.12' : '1.92',
            color: 'rose'
          }
        },
        no: {
          name: 'RECHAZO U OPT-OUT',
          type: 'leaf',
          value: 'Probabilidad nula. Descartar del plan publicitario para mejorar costos.',
          pct: '16%',
          prob: criterion === 'gini' ? '0.04' : '1.98',
          color: 'rose'
        }
      }
    };
  };

  const activeTree = getDecisionTree();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20 text-gray-800"
    >
      {/* Target variable selection header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold flex items-center text-gray-900 tracking-tight">
            <BrainCircuit className="mr-3 text-blue-600 animate-pulse" />
            Entrenamiento Predictivo & Aprendizaje Supervisado
          </h2>
          <p className="text-gray-500 text-xs">Ajusta hiperparámetros, entrena tus clasificadores y visualiza los Árboles de Decisión totalmente en español.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Variable Objetivo</span>
            <select 
              value={targetVar} 
              onChange={(e) => {
                setTargetVar(e.target.value);
                setModelResult(null); 
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {dataset.columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={runSimulation}
            disabled={training || !targetVar}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-100 mt-5 md:mt-0"
          >
            {training ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Play className="mr-2" size={16} />}
            {training ? 'Entrenando...' : 'Entrenar Modelos'}
          </button>
        </div>
      </div>

      {/* Main State Views */}
      <AnimatePresence mode="wait">
        {training && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-lg">Ajustando Hiperparámetros...</h4>
              <p className="text-gray-400 text-sm">Entrenando Árboles de Clasificación (rpart, ctree, randomForest) y estimando métricas.</p>
            </div>
          </motion.div>
        )}

        {/* Initial Welcome/Preparation state */}
        {!training && !modelResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Listos para Entrenar</span>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Construye tus Algoritmos Predictivos</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  MarketPredict procesará las correlaciones de <strong className="text-gray-800 font-semibold">"{targetVar}"</strong> en relación a otras variables disponibles de tu archivo ({dataset.columns.filter(c => c !== targetVar).join(', ')}).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="font-bold text-sm text-gray-800 block">Validación Cruzada Automática</span>
                  <span className="text-xs text-gray-400">Dividiremos el dataset en 80% entrenamiento y 20% test de forma dinámica para estimar la exactitud real.</span>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="font-bold text-sm text-gray-800 block">Extracción de Reglas Lógicas</span>
                  <span className="text-xs text-gray-400">Generaremos árboles interactivos listos para exportar y analizar en tu negocio.</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button 
                  onClick={runSimulation}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl text-sm font-bold flex items-center transition-all shadow-md"
                >
                  Confirmar e Iniciar Entrenamiento
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <h4 className="font-black text-sm text-gray-800 uppercase tracking-wider mb-4">Detalles de las Variables</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-400 font-medium">Predictores Totales</span>
                    <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                      {dataset.columns.length - 1} columnas
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-400 font-medium font-sans">Variable Destino</span>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                      {targetVar}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-400 font-medium">Filas de Datos</span>
                    <span className="text-xs font-bold text-gray-800">
                      {dataset.rows}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-[11px] text-blue-800 leading-normal flex items-start">
                <Activity size={14} className="mr-2 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Los árboles condicionales usan comparaciones de significancia estadística para dividir las muestras sin sobreajustar.
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Model Output Result with Interactive Tree Viewer */}
        {modelResult && !training && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Mejor Exactitud (Accuracy)</span>
                  <h3 className="text-3xl font-black text-blue-600 mt-1">
                    {(modelResult.models.find((m: any) => m.best)?.metrics.accuracy * 100).toFixed(1)}%
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">Óptimo calculado</span>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Trophy size={22} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Métricas F1 Balanced</span>
                  <h3 className="text-3xl font-black text-emerald-600 mt-1">
                    {(modelResult.models.find((m: any) => m.best)?.metrics.f1 || 0.81).toFixed(3)}
                  </h3>
                  <span className="text-[10px] text-gray-400 mt-1 inline-block">Armónica de Precisión/Exhaustividad</span>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Activity size={22} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Muestra de Entrenamiento</span>
                  <h3 className="text-3xl font-black text-indigo-600 mt-1">
                    {Math.round(dataset.rows * 0.8)} <span className="text-sm text-gray-400 font-normal">filas</span>
                  </h3>
                  <span className="text-[10px] text-indigo-500 mt-1 inline-block">Estructura de validación 80/20</span>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Cpu size={22} />
                </div>
              </div>
            </div>

            {/* INTERACTIVE DECISION TREE VISUALIZER */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-gray-900 flex items-center">
                    <GitBranch className="mr-2 text-indigo-600 animate-bounce" size={20} />
                    Visualizador Interactivo de Árbol de Decisión Avanzado
                  </h3>
                  <p className="text-xs text-gray-400">
                    Modifica la profundidad del árbol hasta <span className="text-indigo-600 font-bold">nivel 4</span>, entrena con criterios dinámicos y simula rutas de conversión.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
                    <span className="text-gray-400 font-bold">Profundidad Máxima:</span>
                    <button 
                      onClick={() => setMaxDepth(2)}
                      className={cn("px-2.5 py-1 rounded-lg font-bold transition-all", maxDepth === 2 ? "bg-white shadow text-indigo-600 border border-indigo-100" : "text-gray-500 hover:text-gray-700")}
                    >
                      2 Niveles
                    </button>
                    <button 
                      onClick={() => setMaxDepth(3)}
                      className={cn("px-2.5 py-1 rounded-lg font-bold transition-all", maxDepth === 3 ? "bg-white shadow text-indigo-600 border border-indigo-100" : "text-gray-500 hover:text-gray-700")}
                    >
                      3 Niveles
                    </button>
                    <button 
                      onClick={() => setMaxDepth(4)}
                      className={cn("px-2.5 py-1 rounded-lg font-bold transition-all", maxDepth === 4 ? "bg-white shadow text-indigo-600 border border-indigo-100" : "text-gray-500 hover:text-gray-700")}
                    >
                      4 Niveles (Grande)
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
                    <span className="text-gray-400 font-bold">Criterio:</span>
                    <button 
                      onClick={() => setCriterion('gini')}
                      className={cn("px-2 py-1 rounded font-bold uppercase", criterion === 'gini' ? "bg-white shadow text-emerald-600" : "text-gray-500 hover:text-gray-700")}
                    >
                      Gini
                    </button>
                    <button 
                      onClick={() => setCriterion('entropy')}
                      className={cn("px-2 py-1 rounded font-bold uppercase", criterion === 'entropy' ? "bg-white shadow text-teal-600" : "text-gray-500 hover:text-gray-700")}
                    >
                      Entropía
                    </button>
                  </div>
                </div>
              </div>

              {/* SIMULADOR INTERACTIVO DE COMPORTAMIENTO */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
                  <BrainCircuit size={200} className="text-white" />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/40 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-500 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded font-mono">SIMULACIÓN</span>
                      <h4 className="font-extrabold text-sm text-indigo-200">Simulador de Flujo del Árbol (Ruta Activa)</h4>
                    </div>
                    <p className="text-xs text-indigo-300">Modifica los parámetros ficticios de un potencial cliente para ver el camino exacto iluminado en el árbol.</p>
                  </div>
                  
                  <div className="bg-indigo-950 px-4 py-2 rounded-xl border border-indigo-800/60 font-mono text-xs flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-emerald-400 font-bold">Simulación en línea</span>
                  </div>
                </div>

                {/* Simulador Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-black/25 p-3 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">
                      {dataset.columns.filter(c => c !== targetVar)[0] || 'Predictor 1'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSimP1(true)} 
                        className={cn("py-1 text-[11px] font-bold rounded-lg transition-all", simP1 ? "bg-indigo-600 text-white shadow-md text-xs" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                      >
                        SI / Alto
                      </button>
                      <button 
                        onClick={() => setSimP1(false)} 
                        className={cn("py-1 text-[11px] font-bold rounded-lg transition-all", !simP1 ? "bg-indigo-600 text-white shadow-md text-xs" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                      >
                        NO / Bajo
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/25 p-3 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">
                      {dataset.columns.filter(c => c !== targetVar)[1] || 'Predictor 2'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSimP2(true)} 
                        className={cn("py-1 text-[11px] font-bold rounded-lg transition-all", simP2 ? "bg-indigo-600 text-white shadow-md text-xs" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                      >
                        SI / Alto
                      </button>
                      <button 
                        onClick={() => setSimP2(false)} 
                        className={cn("py-1 text-[11px] font-bold rounded-lg transition-all", !simP2 ? "bg-indigo-600 text-white shadow-md text-xs" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                      >
                        NO / Bajo
                      </button>
                    </div>
                  </div>

                  {maxDepth >= 3 && (
                    <div className="bg-black/25 p-3 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">
                        {dataset.columns.filter(c => c !== targetVar)[2] || 'Predictor 3'}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setSimP3(true)} 
                          className={cn("py-1 text-[11px] font-bold rounded-lg transition-all", simP3 ? "bg-indigo-600 text-white shadow-md text-xs" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                        >
                          SI / Alto
                        </button>
                        <button 
                          onClick={() => setSimP3(false)} 
                          className={cn("py-1 text-[11px] font-bold rounded-lg transition-all", !simP3 ? "bg-indigo-600 text-white shadow-md text-xs" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                        >
                          NO / Bajo
                        </button>
                      </div>
                    </div>
                  )}

                  {maxDepth >= 4 && (
                    <div className="bg-black/25 p-3 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">
                        {dataset.columns.filter(c => c !== targetVar)[3] || 'Predictor 4'}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setSimP4(true)} 
                          className={cn("py-1 text-[11px] font-bold rounded-lg transition-all", simP4 ? "bg-indigo-600 text-white shadow-md text-xs" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                        >
                          SI / Alto
                        </button>
                        <button 
                          onClick={() => setSimP4(false)} 
                          className={cn("py-1 text-[11px] font-bold rounded-lg transition-all", !simP4 ? "bg-indigo-600 text-white shadow-md text-xs" : "bg-white/5 text-gray-400 hover:bg-white/10")}
                        >
                          NO / Bajo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Outcome Banner */}
                {(() => {
                  const predictors = dataset.columns.filter(c => c !== targetVar);
                  const p1 = predictors[0] || 'V1';
                  const p2 = predictors[1] || 'V2';
                  const p3 = predictors[2] || 'V3';
                  const p4 = predictors[3] || 'V4';

                  let simName = 'CLIENTE ESTABLE';
                  let simVal = 'Conversión segura con recompra de desayuno predecible. Requiere pauta recurrente.';
                  let simPct = '10%';
                  let simConf = '82%';
                  let simCol = 'bg-teal-500/20 text-teal-300 border-teal-500/30';

                  if (simP1) {
                    if (simP2) {
                      if (maxDepth >= 3 && simP3) {
                        if (maxDepth >= 4 && simP4) {
                          simName = 'SÚPER PROMOTOR';
                          simVal = 'Afinidad máxima. Comportamiento estrella y LTV más alto proyectado en desayuno.';
                          simPct = '18%';
                          simConf = '99%';
                          simCol = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                        } else {
                          simName = 'CLIENTE ESTABLE';
                          simVal = 'Conversión segura con recompra de desayuno predecible. Requiere pauta recurrente.';
                          simPct = '10%';
                          simConf = '82%';
                          simCol = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
                        }
                      } else {
                        if (maxDepth >= 4 && simP4) {
                          simName = 'CAZADOR DE DEALS';
                          simVal = 'Adquiere desayuno únicamente con cupones o reducciones de tarifas.';
                          simPct = '9%';
                          simConf = '74%';
                          simCol = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                        } else {
                          simName = 'CLIENTE CASUAL';
                          simVal = 'Baja afinidad. Compra orgánica esporádica sin retención directa.';
                          simPct = '5%';
                          simConf = '40%';
                          simCol = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                        }
                      }
                    } else {
                      if (maxDepth >= 3 && simP3) {
                        simName = 'INTERACCIÓN TRADICIONAL';
                        simVal = 'Conversión lenta. Necesita canales de cercanía o físicos.';
                        simPct = '15%';
                        simConf = '51%';
                        simCol = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      } else {
                        simName = 'RIESGO DE CHURN LENTO';
                        simVal = 'Nivel medio de abandono. Implementar plan de alertas promocionales.';
                        simPct = '7%';
                        simConf = '29%';
                        simCol = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                      }
                    }
                  } else {
                    if (maxDepth >= 3 && simP2) {
                      if (maxDepth >= 4 && simP3) {
                        simName = 'CLIENTE EDUCADO';
                        simVal = 'Fiel tras ciclos informativos o talleres de nutrición.';
                        simPct = '12%';
                        simConf = '45%';
                        simCol = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
                      } else {
                        simName = 'LEAD FRÍO DORMIDO';
                        simVal = 'Interés inicial nulo. Priorizar otras audiencias.';
                        simPct = '8%';
                        simConf = '12%';
                        simCol = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                      }
                    } else {
                      simName = 'RECHAZO U OPT-OUT';
                      simVal = 'Probabilidad nula. Descartar del plan publicitario para mejorar costos.';
                      simPct = '16%';
                      simConf = '04%';
                      simCol = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                    }
                  }

                  return (
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 gap-4 mt-2">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-widest font-mono text-indigo-300 block">Resultado Estimado del Simulador</span>
                        <div className="flex items-center space-x-2">
                          <span className={cn("text-xs font-black uppercase px-2 py-0.5 rounded border leading-none", simCol)}>
                            {simName}
                          </span>
                          <span className="text-xs text-white/50">Confianza: <strong className="text-white">{simConf}</strong> ({criterion === 'gini' ? 'Índice Gini' : 'Entropía'})</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-snug">{simVal}</p>
                      </div>
                      <div className="text-right flex md:flex-col items-center md:items-end justify-between shrink-0 bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="text-[9px] text-gray-400 font-mono uppercase">Peso de Segmento</span>
                        <span className="text-xl font-black text-indigo-300 tracking-tight leading-none mt-1">{simPct}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Graphical Tree Rendering */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 sm:p-10 overflow-x-auto min-w-full">
                <div className="flex flex-col items-center justify-center space-y-12 py-8 min-w-[950px]">
                  
                  {/* Nivel 1: La Raíz */}
                  <div className="flex flex-col items-center w-full relative">
                    <div className={cn(
                      "relative group bg-white border-2 p-6 rounded-2xl shadow-md text-center max-w-xs transition-all duration-300",
                      "border-indigo-600 shadow-indigo-100/60 ring-4 ring-indigo-500/10 scale-105"
                    )}>
                      <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                        La Raíz (Nivel 1)
                      </div>
                      <span className="text-xs font-black text-indigo-900 block font-mono">{activeTree.name}</span>
                      <span className="text-[11px] text-gray-500 block mt-1">{activeTree.condition}</span>
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex justify-around text-[10px] font-mono font-bold text-gray-400">
                        <span>Muestra: {activeTree.pct}</span>
                        <span>{criterion === 'gini' ? 'Gini' : 'Entropía'}: {activeTree.prob}</span>
                      </div>
                    </div>
                  </div>

                  {/* Level 2 Split */}
                  <div className="grid grid-cols-2 gap-x-24 w-full relative">
                    {/* SVG Connector Lines from Level 1 to 2 */}
                    <div className="absolute top-[-48px] left-0 w-full h-[48px] pointer-events-none" style={{ zIndex: 0 }}>
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <line x1="25%" y1="0" x2="25%" y2="100%" stroke={simP1 ? "#6366F1" : "#CBD5E1"} strokeWidth={simP1 ? "3" : "2"} strokeDasharray={simP1 ? "0" : "4"} />
                        <line x1="75%" y1="0" x2="75%" y2="100%" stroke={!simP1 ? "#6366F1" : "#CBD5E1"} strokeWidth={!simP1 ? "3" : "2"} strokeDasharray={!simP1 ? "0" : "4"} />
                        <path d="M 25% 0 L 75% 0" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4" />
                      </svg>
                    </div>

                    {/* Left path (YES) - Nivel 2 */}
                    <div className="flex flex-col items-center space-y-12 relative">
                      <div className={cn(
                        "absolute top-[-34px] left-[20%] text-[10px] font-black px-3 py-1 rounded-full transition-all duration-300 shadow-sm border",
                        simP1 ? "bg-emerald-500 text-white border-emerald-400 font-extrabold scale-110 ring-4 ring-emerald-500/20" : "bg-gray-100 text-gray-400 border-gray-200"
                      )}>
                        SI (Alto)
                      </div>

                      <div className={cn(
                        "relative group bg-white border-2 p-5 rounded-2xl shadow-sm text-center max-w-xs min-w-[240px] transition-all duration-300",
                        simP1 ? "border-indigo-500 shadow-lg shadow-indigo-100 scale-105 ring-4 ring-indigo-500/10" : "border-gray-200 opacity-40 scale-95"
                      )}>
                        <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold">Nivel 2</div>
                        <span className="text-xs font-black text-indigo-900 block font-mono">{activeTree.yes?.name}</span>
                        <span className="text-[11px] text-gray-500 block mt-1">{activeTree.yes?.condition}</span>
                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex justify-around text-[10px] font-mono font-bold text-gray-400">
                          <span>Vol: {activeTree.yes?.pct}</span>
                          <span>p: {activeTree.yes?.prob}</span>
                        </div>
                      </div>

                      {/* Level 3 Left Block */}
                      <div className="grid grid-cols-2 gap-x-12 w-full relative">
                        {/* Lines from Level 2 to Level 3 Left */}
                        <div className="absolute top-[-48px] left-0 w-full h-[48px] pointer-events-none" style={{ zIndex: 0 }}>
                          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <line x1="25%" y1="0" x2="25%" y2="100%" stroke={(simP1 && simP2) ? "#6366F1" : "#CBD5E1"} strokeWidth={(simP1 && simP2) ? "3" : "2"} strokeDasharray={(simP1 && simP2) ? "0" : "4"} />
                            <line x1="75%" y1="0" x2="75%" y2="100%" stroke={(simP1 && !simP2) ? "#6366F1" : "#CBD5E1"} strokeWidth={(simP1 && !simP2) ? "3" : "2"} strokeDasharray={(simP1 && !simP2) ? "0" : "4"} />
                            <path d="M 25% 0 L 75% 0" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4" />
                          </svg>
                        </div>

                        {/* Node YES -> YES */}
                        <div className="flex flex-col items-center space-y-12 relative">
                          <div className={cn(
                            "absolute top-[-32px] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase transition-all duration-300",
                            (simP1 && simP2) ? "bg-emerald-500 text-white scale-110" : "bg-gray-100 text-gray-400"
                          )}>
                            SI
                          </div>

                          <div className={cn(
                            "relative group bg-white border-2 p-4 rounded-xl shadow-xs text-center min-w-[190px] transition-all duration-300",
                            (simP1 && simP2) ? "border-indigo-500 shadow-md scale-105 ring-4 ring-indigo-500/10" : "border-gray-100 opacity-40 scale-95"
                          )}>
                            <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-[7px] font-mono px-1.5 py-0.2 rounded uppercase">Nivel 3</div>
                            <span className="text-[11px] font-bold text-gray-800 block font-mono">
                              {activeTree.yes?.yes?.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-1 leading-tight">
                              {activeTree.yes?.yes?.condition || "Categoría Definida"}
                            </span>
                            <div className="mt-2 pt-1 font-mono text-[9px] flex justify-between text-gray-400">
                              <span>Muestra: {activeTree.yes?.yes?.pct}</span>
                              <span>P: {activeTree.yes?.yes?.prob}</span>
                            </div>
                          </div>

                          {/* Level 4 Leaf Nodes under Yes-Yes */}
                          {maxDepth >= 4 && (
                            <div className="grid grid-cols-2 gap-2 w-full relative">
                              {/* Lines from Level 3 to Level 4 Yes-Yes */}
                              <div className="absolute top-[-48px] left-0 w-full h-[48px] pointer-events-none" style={{ zIndex: 0 }}>
                                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                  <line x1="25%" y1="0" x2="25%" y2="100%" stroke={(simP1 && simP2 && simP3) ? "#10B981" : "#CBD5E1"} strokeWidth={(simP1 && simP2 && simP3) ? "2.5" : "1.5"} strokeDasharray={(simP1 && simP2 && simP3) ? "0" : "3"} />
                                  <line x1="75%" y1="0" x2="75%" y2="100%" stroke={(simP1 && simP2 && !simP3) ? "#14B8A6" : "#CBD5E1"} strokeWidth={(simP1 && simP2 && !simP3) ? "2.5" : "1.5"} strokeDasharray={(simP1 && simP2 && !simP3) ? "0" : "3"} />
                                </svg>
                              </div>

                              {/* YES-YES-YES: Súper Promotor Leaf */}
                              <div className={cn(
                                "p-3 rounded-xl text-center border-2 transition-all duration-300 min-h-[140px] flex flex-col justify-between",
                                (simP1 && simP2 && simP3) ? "bg-emerald-55 ring-4 ring-emerald-500/20 shadow-md border-emerald-500 scale-102" : "bg-gray-50 border-gray-100 opacity-40 scale-95"
                              )}>
                                <span className="text-[10px] font-black text-emerald-800 block uppercase tracking-wider">SÚPER PROMOTOR</span>
                                <p className="text-[9px] text-emerald-600 mt-1 leading-tight text-left">Afinidad desayuno estelar. LTV máximo.</p>
                                <div className="mt-2 pt-1 border-t border-emerald-250 flex justify-between text-[8px] font-mono text-emerald-600 font-bold">
                                  <span>Prop: 18%</span>
                                  <span>Conf: 99%</span>
                                </div>
                              </div>

                              {/* YES-YES-NO: Cliente Estable Leaf */}
                              <div className={cn(
                                "p-3 rounded-xl text-center border-2 transition-all duration-300 min-h-[140px] flex flex-col justify-between",
                                (simP1 && simP2 && !simP3) ? "bg-teal-55 ring-4 ring-teal-500/20 shadow-md border-teal-500 scale-102" : "bg-gray-50 border-gray-100 opacity-40 scale-95"
                              )}>
                                <span className="text-[10px] font-black text-teal-850 block uppercase tracking-wider">CLIENTE ESTABLE</span>
                                <p className="text-[9px] text-teal-600 mt-1 leading-tight text-left">Frecuencia estable. Patrón predecible.</p>
                                <div className="mt-2 pt-1 border-t border-teal-200 flex justify-between text-[8px] font-mono text-teal-600 font-bold">
                                  <span>Prop: 10%</span>
                                  <span>Conf: 82%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Node YES -> NO */}
                        <div className="flex flex-col items-center space-y-12 relative">
                          <div className={cn(
                            "absolute top-[-32px] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase transition-all duration-300",
                            (simP1 && !simP2) ? "bg-amber-500 text-white scale-110" : "bg-gray-100 text-gray-400"
                          )}>
                            NO
                          </div>

                          <div className={cn(
                            "relative group bg-white border-2 p-4 rounded-xl shadow-xs text-center min-w-[190px] transition-all duration-300",
                            (simP1 && !simP2) ? "border-indigo-500 shadow-md scale-105 ring-4 ring-indigo-500/10" : "border-gray-100 opacity-40 scale-95"
                          )}>
                            <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-[7px] font-mono px-1.5 py-0.2 rounded uppercase">Nivel 3</div>
                            <span className="text-[11px] font-bold text-gray-800 block font-mono">
                              {activeTree.yes?.no?.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-1 leading-tight">
                              {activeTree.yes?.no?.condition || "Reacción Descuento"}
                            </span>
                            <div className="mt-2 pt-1 font-mono text-[9px] flex justify-between text-gray-400">
                              <span>Muestra: {activeTree.yes?.no?.pct}</span>
                              <span>P: {activeTree.yes?.no?.prob}</span>
                            </div>
                          </div>

                          {/* Level 4 Leaf Nodes under Yes-No */}
                          {maxDepth >= 4 && (
                            <div className="grid grid-cols-2 gap-2 w-full relative">
                              {/* Lines from Level 3 to Level 4 Yes-No */}
                              <div className="absolute top-[-48px] left-0 w-full h-[48px] pointer-events-none" style={{ zIndex: 0 }}>
                                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                  <line x1="25%" y1="0" x2="25%" y2="100%" stroke={(simP1 && !simP2 && simP4) ? "#3B82F6" : "#CBD5E1"} strokeWidth={(simP1 && !simP2 && simP4) ? "2.5" : "1.5"} strokeDasharray={(simP1 && !simP2 && simP4) ? "0" : "3"} />
                                  <line x1="75%" y1="0" x2="75%" y2="100%" stroke={(simP1 && !simP2 && !simP4) ? "#F59E0B" : "#CBD5E1"} strokeWidth={(simP1 && !simP2 && !simP4) ? "2.5" : "1.5"} strokeDasharray={(simP1 && !simP2 && !simP4) ? "0" : "3"} />
                                </svg>
                              </div>

                              {/* CAZADOR DE DEALS */}
                              <div className={cn(
                                "p-3 rounded-xl text-center border-2 transition-all duration-300 min-h-[140px] flex flex-col justify-between",
                                (simP1 && !simP2 && simP4) ? "bg-blue-55 ring-4 ring-blue-500/20 shadow-md border-blue-500 scale-102" : "bg-gray-50 border-gray-100 opacity-40 scale-95"
                              )}>
                                <span className="text-[10px] font-black text-blue-800 block uppercase tracking-wider">CAZADOR DE DEALS</span>
                                <p className="text-[9px] text-blue-600 mt-1 leading-tight text-left">Muy reactivo a campañas de cupón desayuno.</p>
                                <div className="mt-2 pt-1 border-t border-blue-250 flex justify-between text-[8px] font-mono text-blue-600 font-bold">
                                  <span>Prop: 9%</span>
                                  <span>Conf: 74%</span>
                                </div>
                              </div>

                              {/* CLIENTE CASUAL */}
                              <div className={cn(
                                "p-3 rounded-xl text-center border-2 transition-all duration-300 min-h-[140px] flex flex-col justify-between",
                                (simP1 && !simP2 && !simP4) ? "bg-amber-55 ring-4 ring-amber-500/20 shadow-md border-amber-500 scale-102" : "bg-gray-50 border-gray-100 opacity-40 scale-95"
                              )}>
                                <span className="text-[10px] font-black text-amber-800 block uppercase tracking-wider">CLIENTE CASUAL</span>
                                <p className="text-[9px] text-amber-600 mt-1 leading-tight text-left">Tráfico esporádico. Ticket bajo desayuno.</p>
                                <div className="mt-2 pt-1 border-t border-amber-200 flex justify-between text-[8px] font-mono text-amber-600 font-bold">
                                  <span>Prop: 5%</span>
                                  <span>Conf: 40%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right path (NO) - Nivel 2 */}
                    <div className="flex flex-col items-center space-y-12 relative">
                      <div className={cn(
                        "absolute top-[-34px] left-[70%] text-[10px] font-black px-3 py-1 rounded-full transition-all duration-300 shadow-sm border",
                        !simP1 ? "bg-emerald-500 text-white border-emerald-400 font-extrabold scale-110 ring-4 ring-emerald-500/20" : "bg-gray-100 text-gray-400 border-gray-200"
                      )}>
                        NO (Bajo)
                      </div>

                      <div className={cn(
                        "relative group bg-white border-2 p-5 rounded-2xl shadow-sm text-center max-w-xs min-w-[240px] transition-all duration-300",
                        !simP1 ? "border-indigo-500 shadow-lg shadow-indigo-100 scale-105 ring-4 ring-indigo-500/10" : "border-gray-200 opacity-40 scale-95"
                      )}>
                        <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold">Nivel 2</div>
                        <span className="text-xs font-black text-indigo-900 block font-mono">{activeTree.no?.name}</span>
                        <span className="text-[11px] text-gray-500 block mt-1">{activeTree.no?.condition}</span>
                        <div className="mt-2.5 pt-2 border-t border-gray-100 flex justify-around text-[10px] font-mono font-bold text-gray-400">
                          <span>Vol: {activeTree.no?.pct}</span>
                          <span>p: {activeTree.no?.prob}</span>
                        </div>
                      </div>

                      {/* Level 3 Right Block */}
                      <div className="grid grid-cols-2 gap-x-12 w-full relative">
                        {/* Lines from Level 2 to Level 3 Right */}
                        <div className="absolute top-[-48px] left-0 w-full h-[48px] pointer-events-none" style={{ zIndex: 0 }}>
                          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <line x1="25%" y1="0" x2="25%" y2="100%" stroke={(!simP1 && simP2) ? "#6366F1" : "#CBD5E1"} strokeWidth={(!simP1 && simP2) ? "3" : "2"} strokeDasharray={(!simP1 && simP2) ? "0" : "4"} />
                            <line x1="75%" y1="0" x2="75%" y2="100%" stroke={(!simP1 && !simP2) ? "#6366F1" : "#CBD5E1"} strokeWidth={(!simP1 && !simP2) ? "3" : "2"} strokeDasharray={(!simP1 && !simP2) ? "0" : "4"} />
                            <path d="M 25% 0 L 75% 0" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4" />
                          </svg>
                        </div>

                        {/* Node NO -> YES */}
                        <div className="flex flex-col items-center space-y-12 relative">
                          <div className={cn(
                            "absolute top-[-32px] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase transition-all duration-300",
                            (!simP1 && simP2) ? "bg-emerald-500 text-white scale-110" : "bg-gray-100 text-gray-400"
                          )}>
                            SI
                          </div>

                          <div className={cn(
                            "relative group bg-white border-2 p-4 rounded-xl shadow-xs text-center min-w-[190px] transition-all duration-300",
                            (!simP1 && simP2) ? "border-indigo-500 shadow-md scale-105 ring-4 ring-indigo-500/10" : "border-gray-100 opacity-40 scale-95"
                          )}>
                            <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-[7px] font-mono px-1.5 py-0.2 rounded uppercase">Nivel 3</div>
                            <span className="text-[11px] font-bold text-gray-800 block font-mono">
                              {activeTree.no?.yes?.name || 'Adoptante Moderado'}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-1 leading-tight">
                              {activeTree.no?.yes?.condition || "Reactivo Email"}
                            </span>
                            <div className="mt-2 pt-1 font-mono text-[9px] flex justify-between text-gray-400">
                              <span>Muestra: {activeTree.no?.yes?.pct || "20%"}</span>
                              <span>P: {activeTree.no?.yes?.prob || "0.28"}</span>
                            </div>
                          </div>

                          {/* Level 4 Leaf Nodes under No-Yes */}
                          {maxDepth >= 4 && (
                            <div className="grid grid-cols-2 gap-2 w-full relative">
                              {/* Lines from Level 3 to Level 4 No-Yes */}
                              <div className="absolute top-[-48px] left-0 w-full h-[48px] pointer-events-none" style={{ zIndex: 0 }}>
                                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                  <line x1="25%" y1="0" x2="25%" y2="100%" stroke={(!simP1 && simP2 && simP3) ? "#14B8A6" : "#CBD5E1"} strokeWidth={(!simP1 && simP2 && simP3) ? "2.5" : "1.5"} strokeDasharray={(!simP1 && simP2 && simP3) ? "0" : "3"} />
                                  <line x1="75%" y1="0" x2="75%" y2="100%" stroke={(!simP1 && simP2 && !simP3) ? "#EF4444" : "#CBD5E1"} strokeWidth={(!simP1 && simP2 && !simP3) ? "2.5" : "1.5"} strokeDasharray={(!simP1 && simP2 && !simP3) ? "0" : "3"} />
                                </svg>
                              </div>

                              {/* CLIENTE EDUCADO */}
                              <div className={cn(
                                "p-3 rounded-xl text-center border-2 transition-all duration-300 min-h-[140px] flex flex-col justify-between",
                                (!simP1 && simP2 && simP3) ? "bg-teal-55 ring-4 ring-teal-500/20 shadow-md border-teal-500 scale-102" : "bg-gray-50 border-gray-100 opacity-40 scale-95"
                              )}>
                                <span className="text-[10px] font-black text-teal-800 block uppercase tracking-wider">CLIENTE EDUCADO</span>
                                <p className="text-[9px] text-teal-600 mt-1 leading-tight text-left">Fiel tras ciclos informativos de desayuno.</p>
                                <div className="mt-2 pt-1 border-t border-teal-200 flex justify-between text-[8px] font-mono text-teal-600 font-bold">
                                  <span>Prop: 12%</span>
                                  <span>Conf: 45%</span>
                                </div>
                              </div>

                              {/* LEAD FRÍO DORMIDO */}
                              <div className={cn(
                                "p-3 rounded-xl text-center border-2 transition-all duration-300 min-h-[140px] flex flex-col justify-between",
                                (!simP1 && simP2 && !simP3) ? "bg-rose-55 ring-4 ring-rose-500/20 shadow-md border-rose-500 scale-102" : "bg-gray-50 border-gray-100 opacity-40 scale-95"
                              )}>
                                <span className="text-[10px] font-black text-rose-800 block uppercase tracking-wider">LEAD DORMIDO</span>
                                <p className="text-[9px] text-rose-600 mt-1 leading-tight text-left">Sin propensión de desayuno en test.</p>
                                <div className="mt-2 pt-1 border-t border-rose-250 flex justify-between text-[8px] font-mono text-rose-600 font-bold">
                                  <span>Prop: 8%</span>
                                  <span>Conf: 12%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Node NO -> NO (Hoja directa / Split según profundidad) */}
                        <div className="flex flex-col items-center space-y-12 relative">
                          <div className={cn(
                            "absolute top-[-32px] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase transition-all duration-300",
                            (!simP1 && !simP2) ? "bg-rose-550 text-white scale-110" : "bg-gray-100 text-gray-400"
                          )}>
                            NO
                          </div>

                          <div className={cn(
                            "relative group bg-white border-2 p-4 rounded-xl shadow-xs text-center min-w-[190px] transition-all duration-300",
                            (!simP1 && !simP2) ? "bg-rose-50 ring-4 ring-rose-500/20 border-rose-500 scale-105" : "border-gray-100 opacity-40 scale-95"
                          )}>
                            <div className="absolute top-[-8px] left-1/2 transform -translate-x-1/2 bg-red-850 text-white text-[7px] font-mono px-1.5 py-0.2 rounded uppercase">Hoja Terminal</div>
                            <span className="text-[11px] font-extrabold text-rose-900 block font-mono">
                              RECHAZO DIRECTO
                            </span>
                            <span className="text-[10px] text-rose-600 block mt-1 leading-tight">
                              Opt-out del servicio o nulo interés
                            </span>
                            <div className="mt-2 pt-1 font-mono text-[9px] flex justify-between text-rose-450 font-bold">
                              <span>Muestra: 16%</span>
                              <span>Confanza: 96%</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Model Error Graph & Business Rules block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feature Importance */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center text-gray-800">
                  <BarChart2 size={18} className="mr-2 text-blue-600" />
                  Importancia Relativa de Variables (Feature Importance)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelResult.featureImportance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="feature" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="importance" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Importancia Gini" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Business Rules */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold mb-2 flex items-center text-gray-800">
                  <GitBranch size={18} className="mr-2 text-emerald-600" />
                  Reglas de Decisión Extraídas (Ramas de Ganancia Lógica)
                </h3>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {modelResult.businessRules && modelResult.businessRules.map((rule: string, i: number) => (
                    <div key={i} className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                        <span className="text-[10px] font-bold text-emerald-700">{i+1}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700 leading-tight">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Models Comparison chart and ML metrics */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-6 flex items-center text-gray-800 tracking-tight">
                <Trophy size={18} className="mr-2 text-amber-500" />
                Comparativa de Modelos Clasificadores (Accuracy vs F1-Score)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelResult.models} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                    <XAxis type="number" domain={[0, 1]} fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={110} fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="metrics.accuracy" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Exactitud (Accuracy)" barSize={16} />
                    <Bar dataKey="metrics.f1" fill="#10B981" radius={[0, 4, 4, 0]} name="Precisión (F1-score)" barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Navigation Button to Next View */}
            {onNext && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={onNext}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white px-8 py-4 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-100 transition-all cursor-pointer"
                >
                  Proceder al Plan de Marketing Estratégico
                  <ArrowRight className="ml-2" size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
