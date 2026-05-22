/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Upload, 
  Settings, 
  PieChart, 
  BrainCircuit, 
  TrendingUp, 
  FileText,
  Menu,
  ChevronRight,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  LucideIcon
} from 'lucide-react';

import { DatasetInfo } from './types';
import FileUpload from './components/FileUpload';
import AnalyticsView from './components/AnalyticsView';
import ModelView from './components/ModelView';
import MarketingPlan from './components/MarketingPlan';
import { cn } from './lib/utils';

type View = 'welcome' | 'upload' | 'eda' | 'model' | 'strategy';

interface NavItem {
  id: View;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
}

export default function App() {
  const [activeView, setActiveView] = useState<View>('welcome');
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems: NavItem[] = [
    { id: 'welcome', label: 'Bienvenida', icon: LayoutDashboard, enabled: true },
    { id: 'upload', label: 'Subir Archivo', icon: Upload, enabled: true },
    { id: 'eda', label: 'Análisis Exploratorio', icon: PieChart, enabled: !!dataset },
    { id: 'model', label: 'Modelos IA', icon: BrainCircuit, enabled: !!dataset },
    { id: 'strategy', label: 'Plan de Marketing', icon: TrendingUp, enabled: !!dataset },
  ];

  const handleFileLoaded = (info: DatasetInfo) => {
    setDataset(info);
    setActiveView('eda');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-[#E5E7EB] flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between border-bottom border-[#F3F4F6]">
          {sidebarOpen ? (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              MarketPredict AI
            </motion.h1>
          ) : (
            <BrainCircuit className="text-blue-600" />
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              disabled={!item.enabled}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex items-center p-3 rounded-lg transition-all duration-200",
                activeView === item.id 
                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50",
                !item.enabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <item.icon size={20} className={activeView === item.id ? "text-blue-600" : ""} />
              {sidebarOpen && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
              {sidebarOpen && activeView === item.id && (
                <ChevronRight size={14} className="ml-auto" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-[#F3F4F6]">
          <div className={cn("flex items-center text-xs text-gray-400 font-mono", !sidebarOpen && "justify-center")}>
            <Database size={14} className="mr-2" />
            {sidebarOpen && <span>Versión 1.0.4</span>}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">
              {navItems.find(n => n.id === activeView)?.label}
            </span>
          </div>
          <div className="flex items-center space-x-6">
            {dataset && (
              <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
                <CheckCircle2 size={12} className="mr-1.5" />
                {dataset.name} ({dataset.rows} filas)
              </div>
            )}
            <div className="flex items-center space-x-2 text-gray-400">
              <Search size={18} className="cursor-pointer hover:text-gray-600" />
              <Settings size={18} className="cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeView === 'welcome' && (
              <WelcomeView key="welcome" onStart={() => setActiveView('upload')} />
            )}
            {activeView === 'upload' && (
              <FileUpload key="upload" onLoaded={handleFileLoaded} />
            )}
            {activeView === 'eda' && dataset && (
              <AnalyticsView key="eda" dataset={dataset} onNext={() => setActiveView('model')} />
            )}
            {activeView === 'model' && dataset && (
              <ModelView key="model" dataset={dataset} onNext={() => setActiveView('strategy')} />
            )}
            {activeView === 'strategy' && dataset && (
              <MarketingPlan key="strategy" dataset={dataset} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function WelcomeView({ onStart }: { onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto py-12"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Optimiza tu Marketing con <br />
            <span className="text-blue-600">Inteligencia Predictiva</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Plataforma avanzada de Machine Learning especializada en Árboles de Decisión para descubrir patrones ocultos en tus datos y maximizar el retorno de inversión.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          {[
            { title: 'Carga Inteligente', desc: 'Soporte para CSV, Excel y JSON con limpieza automática.', icon: Upload, color: 'bg-blue-100 text-blue-600' },
            { title: 'EDA Automático', desc: 'Análisis exploratorio visual y detección de insights.', icon: Search, color: 'bg-emerald-100 text-emerald-600' },
            { title: 'Modelos de Árbol', desc: 'Random Forest, XGBoost y reglas de negocio automáticas.', icon: BrainCircuit, color: 'bg-purple-100 text-purple-600' },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", feature.color)}>
                <feature.icon size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={onStart}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all inline-flex items-center"
        >
          Empezar Análisis
          <ChevronRight className="ml-2" />
        </button>

        <div className="pt-12 border-t border-gray-100">
          <div className="flex items-center space-x-8 opacity-40 grayscale">
            <span className="text-sm font-bold uppercase tracking-widest">Tecnologías:</span>
            <span className="font-mono text-sm">RANDOM FOREST</span>
            <span className="font-mono text-sm">XGBOOST</span>
            <span className="font-mono text-sm">GRADIENT BOOSTING</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

