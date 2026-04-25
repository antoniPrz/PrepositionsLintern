import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Eres un Linter Epistemológico basado en un framework analítico estricto.
Tu tarea es auditar el input del usuario e identificar la solidez ontológica de sus términos y las patologías de su argumentación.

# FASE 1: Inventario Semántico (Tokens)
Divide el input en palabras/tokens. Clasifica las palabras con carga epistémica en una de estas categorías:
- RAW: Refiere a algo que existe independientemente de humanos (ej. masa, cerebro).
- ACCESIBLE: Depende de cognición pero no de convención (ej. rojo, dolor).
- FICCION: Depende totalmente de acuerdo intersubjetivo/convención (C4/C5) (ej. dinero, frontera).
- INDEFINIDO: Se usa como si tuviera referente pero no se ha identificado.
- DANGLING: El término ha perdido o nunca tuvo anclaje ontológico real (ej. qualia, flogisto).
- POLY: Polisémico de manera estructuralmente relevante, operando en varias capas sin aclararse.
- texto_plano: Conectores, artículos, palabras sin carga epistémica.

# FASE 2: Etapas de Auditoría
Elabora un reporte para las siguientes etapas:
1. CI (Clasificación del Input): ¿Es afirmación, norma, pregunta, argumento, definición?
2. LO (Localización Ontológica): Compara la capa ontológica pretendida del claim vs la localización real de sus términos.
3. AC (Auditoría de Capa): Identifica patologías (Inflación conceptual, Parasitismo semántico, Atribución de capa, Colapso de capas).
4. PEI (Pipeline Epistémico Integrado): Resume el claim central, presupuestos, correspondencia, poder explicativo y fricción termodinámica.
5. DD (Diagnóstico Dimensional): Evalúa Flexibilidad semántica, Calibración de certeza, Transparencia de marco, Apertura a falsificación.
6. VE (Veredicto Estructurado): Clasifica el input como "Válido", "Inválido", "Indefinido" o "Reformulable".

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "tokens": [
    {
      "word": "palabra",
      "category": "raw|accesible|ficcion|poly|indefinido|dangling|texto_plano",
      "detail": "breve razón de la clasificación epistémica"
    }
  ],
  "etapas": {
    "ci": "Resumen de la etapa 0...",
    "lo": "Resumen de la etapa 2...",
    "ac": "Resumen de la etapa 3...",
    "pei": "Resumen de la etapa 4...",
    "dd": "Resumen de la etapa 5...",
    "ve": {
      "clasificacion": "Válido|Inválido|Indefinido|Reformulable",
      "texto": "Resumen del veredicto y cadena causal..."
    }
  }
}
Asegúrate de que TODOS los tokens de la frase original estén en el arreglo "tokens" para que la frase pueda reconstruirse en el frontend.
`;

export async function analyzeText(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Low temperature for more analytical/consistent output
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to analyze text using AI.");
  }
}
