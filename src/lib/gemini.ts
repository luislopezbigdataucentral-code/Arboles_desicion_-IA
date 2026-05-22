import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeDataset(datasetSummary: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Actúa como un experto en Marketing Analytics.
      Analiza el siguiente resumen de un dataset y proporciona insights estratégicos, problemas de calidad detectados y sugerencias de variables objetivo para modelos predictivos.
      
      Resumen del Dataset:
      ${datasetSummary}
      
      Responde en formato JSON con la siguiente estructura:
      {
        "insights": ["insight 1", "insight 2"],
        "qualityIssues": ["issue 1", "issue 2"],
        "suggestedTargets": [
          {"name": "column_name", "type": "Classification/Regression", "reason": "why"}
        ]
      }
    `,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}

export async function trainPredictiveModel(dataSample: any[], target: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Actúa como un científico de datos senior.
      A partir de este fragmento de datos, simula el entrenamiento de los mejores modelos de Árboles de Decisión (Random Forest, XGBoost, etc.) para predecir la variable "${target}".
      
      Muestra:
      ${JSON.stringify(dataSample.slice(0, 100))}
      
      Genera un reporte detallado con métricas de evaluación reales (simuladas coherentemente), importancia de variables y REGLAS DE NEGOCIO extraídas de los árboles.
      
      Responde en formato JSON con la siguiente estructura:
      {
        "models": [
          {
            "name": "Random Forest",
            "metrics": {"accuracy": 0.85, "f1": 0.84, "precision": 0.86, "recall": 0.84},
            "best": true
          },
          {
            "name": "XGBoost",
            "metrics": {"accuracy": 0.88, "f1": 0.87, "precision": 0.89, "recall": 0.86}
          }
        ],
        "featureImportance": [{"feature": "f1", "importance": 0.45}],
        "businessRules": ["Si X > 10 y Y es 'A', entonces Alta Probabilidad de Venta"],
        "marketingPlan": {
           "strategy": "descripción",
           "segments": ["segmento 1"],
           "kpis": ["kpi 1"]
        }
      }
    `,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}
