
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, File, AlertCircle, CheckCircle2, Loader2, Database, Download, FileText, Code } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DatasetInfo } from '../types';
import { formatBytes } from '../lib/utils';

interface FileUploadProps {
  onLoaded: (info: DatasetInfo) => void;
}

// Generate a high-quality sample dataset for Marketing Analytics
const generateSampleDataset = (): { csv: string; json: any[] } => {
  const channels = ['Email', 'Social Media', 'Google Ads', 'Direct'];
  const columns = ['ID_Cliente', 'Edad', 'Ingresos_Anuales', 'Gasto_Campana', 'Clics', 'Canal_Adquisicion', 'Compra_Convertida', 'Valor_Compra'];
  const data: any[] = [];

  for (let i = 1; i <= 200; i++) {
    const edad = Math.floor(Math.random() * (65 - 18 + 1)) + 18;
    const ingresos = Math.floor(edad * 1200 + Math.random() * 20000 + 15000);
    const gasto = Math.floor(Math.random() * 500) + 50;
    const clics = Math.floor((gasto / 10) + Math.random() * 10);
    const canal = channels[Math.floor(Math.random() * channels.length)];
    
    // Simple decision rule for realistic target behavior
    let convertida = 0;
    let prob = 0.15;
    if (gasto > 250 && (canal === 'Google Ads' || canal === 'Social Media')) prob = 0.75;
    if (ingresos > 60000) prob += 0.15;
    if (Math.random() < prob) convertida = 1;

    const valor_compra = convertida === 1 ? Math.floor(gasto * 2.5 + Math.random() * 100) : 0;

    data.push({
      ID_Cliente: i,
      Edad: edad,
      Ingresos_Anuales: ingresos,
      Gasto_Campana: gasto,
      Clics: clics,
      Canal_Adquisicion: canal,
      Compra_Convertida: convertida,
      Valor_Compra: valor_compra
    });
  }

  const csv = Papa.unparse(data);
  return { csv, json: data };
};

// Generate Cereal Breakfast Dataset (cerealtrain.csv & cerealtest.csv)
const generateCerealDataset = (isTest = false): { csv: string; json: any[] } => {
  const ageCats = ['18-24', '25-34', '35-49', '50+'];
  const genders = ['Masculino', 'Femenino'];
  const civils = ['Soltero', 'Casado', 'Divorciado'];
  const actives = ['Activo', 'Inactivo'];
  
  const size = isTest ? 150 : 439; // matches 439 in user's R script outputs!
  const data: any[] = [];

  for (let i = 1; i <= size; i++) {
    const edadcat = ageCats[Math.floor(Math.random() * ageCats.length)];
    const genero = genders[Math.floor(Math.random() * genders.length)];
    const ecivil = civils[Math.floor(Math.random() * civils.length)];
    const activo = actives[Math.floor(Math.random() * actives.length)];

    // Target Decision Logic: desayuno (values: Cereal, Avena, Fruta, Otros)
    let desayuno = 'Otros';
    const rand = Math.random();

    if (activo === 'Activo') {
      if (edadcat === '18-24' || edadcat === '25-34') {
        desayuno = rand < 0.7 ? 'Cereal' : 'Avena';
      } else {
        desayuno = rand < 0.6 ? 'Fruta' : 'Cereal';
      }
    } else {
      if (edadcat === '50+') {
        desayuno = rand < 0.8 ? 'Otros' : 'Fruta';
      } else {
        desayuno = rand < 0.5 ? 'Otros' : 'Cereal';
      }
    }

    data.push({
      ID_Cliente: i,
      edadcat,
      genero,
      ecivil,
      activo,
      desayuno
    });
  }

  // Generate with R-preferred separation ";" and dec ","
  const csv = Papa.unparse(data, { delimiter: ';' });
  return { csv, json: data };
};

export default function FileUpload({ onLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            onLoaded({
              name: file.name,
              size: file.size,
              rows: results.data.length,
              cols: results.meta.fields?.length || 0,
              columns: results.meta.fields || [],
              type: file.name.endsWith('.csv') ? 'csv' : 'txt',
              data: results.data,
            });
          },
          error: (err) => setError('Error al procesar CSV: ' + err.message),
        });
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        onLoaded({
          name: file.name,
          size: file.size,
          rows: json.length,
          cols: json.length > 0 ? Object.keys(json[0] as object).length : 0,
          columns: json.length > 0 ? Object.keys(json[0] as object) : [],
          type: 'xlsx',
          data: json,
        });
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const data = Array.isArray(json) ? json : [json];
          onLoaded({
            name: file.name,
            size: file.size,
            rows: data.length,
            cols: data.length > 0 ? Object.keys(data[0]).length : 0,
            columns: data.length > 0 ? Object.keys(data[0]) : [],
            type: 'json',
            data: data,
          });
        } catch (err) {
          setError('Error al procesar JSON');
        }
      };
      reader.readAsText(file);
    } else {
      setError('Formato de archivo no soportado. Use CSV, Excel o JSON.');
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const loadDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { json } = generateSampleDataset();
      onLoaded({
        name: 'dataset_demo_marketing.csv',
        size: 15420,
        rows: json.length,
        cols: Object.keys(json[0]).length,
        columns: Object.keys(json[0]),
        type: 'csv',
        data: json,
      });
      setIsProcessing(false);
    }, 800);
  };

  const loadCerealTrainDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const { json } = generateCerealDataset(false);
      onLoaded({
        name: 'cerealtrain.csv',
        size: 32540,
        rows: json.length,
        cols: Object.keys(json[0]).length,
        columns: Object.keys(json[0]),
        type: 'csv',
        data: json,
      });
      setIsProcessing(false);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto py-12 space-y-8"
    >
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col justify-between">
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 transition-all duration-300"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{ borderColor: isDragging ? '#3B82F6' : undefined, backgroundColor: isDragging ? '#EFF6FF' : undefined }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Upload size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Carga tu data (.csv, .xlsx, .json)</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm"> Arrastra tu archivo o busca en tu explorador.</p>
            
            <label className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
              Seleccionar Archivo
              <input type="file" className="hidden" accept=".csv,.xlsx,.json,.txt" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
            </label>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span className="text-xs text-gray-400 font-medium">¿Ejecutar con datasets preestablecidos?</span>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={loadDemo}
              className="text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold transition-all"
            >
              Marketing Demo
            </button>
            <button 
              onClick={loadCerealTrainDemo}
              className="text-xs bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-bold transition-all"
            >
              Cargar "cerealtrain.csv"
            </button>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-6 flex items-center justify-center space-x-3 text-blue-600 font-medium">
          <Loader2 size={20} className="animate-spin" />
          <span>Procesando...</span>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-700 text-sm">
          <AlertCircle size={18} className="mr-3 shrink-0" />
          {error}
        </div>
      )}
    </motion.div>
  );
}

