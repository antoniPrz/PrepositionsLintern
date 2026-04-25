/**
 * Language Linter — Main Application
 * Orchestrates editor, results, and analysis components
 */

import './style.css';
import { initEditor, getInputText, clearInput } from './components/editor.js';
import { renderResult, renderLegend } from './components/results.js';
import { renderAnalysis } from './components/analysis.js';

// --- Mock Data (will be replaced by API calls) ---
const MOCK_RESPONSE = {
  tokens: [
    { word: 'El',           category: 'determinante', detail: 'Artículo definido, masculino singular' },
    { word: 'gato',         category: 'sustantivo',   detail: 'Sustantivo común, masculino singular' },
    { word: 'negro',        category: 'adjetivo',     detail: 'Adjetivo calificativo, masculino singular' },
    { word: 'corre',        category: 'verbo',        detail: 'Verbo "correr", presente indicativo, 3ª persona singular' },
    { word: 'muy',          category: 'adverbio',     detail: 'Adverbio de cantidad/intensidad' },
    { word: 'rápidamente',  category: 'adverbio',     detail: 'Adverbio de modo, derivado de "rápido"' },
    { word: 'por',          category: 'preposicion',  detail: 'Preposición de lugar/tránsito' },
    { word: 'el',           category: 'determinante', detail: 'Artículo definido, masculino singular' },
    { word: 'tejado',       category: 'sustantivo',   detail: 'Sustantivo común, masculino singular' },
    { word: 'y',            category: 'conjuncion',   detail: 'Conjunción copulativa' },
    { word: 'él',           category: 'pronombre',    detail: 'Pronombre personal, 3ª persona singular' },
    { word: 'salta',        category: 'verbo',        detail: 'Verbo "saltar", presente indicativo, 3ª persona singular' },
    { word: 'hacia',        category: 'preposicion',  detail: 'Preposición de dirección' },
    { word: 'la',           category: 'determinante', detail: 'Artículo definido, femenino singular' },
    { word: 'luna',         category: 'sustantivo',   detail: 'Sustantivo común, femenino singular' },
    { word: '.',            category: 'puntuacion',   detail: 'Punto final' },
  ],
  analysis: `Oración compuesta coordinada copulativa formada por dos proposiciones unidas por la conjunción "y".

Primera proposición: "El gato negro corre muy rápidamente por el tejado"
• Sujeto: "El gato negro" — Sintagma nominal (determinante + núcleo + adyacente)
• Predicado verbal: "corre muy rápidamente por el tejado"
  - Núcleo: "corre" (verbo intransitivo)
  - CCModo: "muy rápidamente" (sintagma adverbial con intensificador)
  - CCLugar: "por el tejado" (sintagma preposicional)

Segunda proposición: "él salta hacia la luna"
• Sujeto: "él" — Pronombre personal
• Predicado verbal: "salta hacia la luna"
  - Núcleo: "salta" (verbo intransitivo)
  - CCDirección: "hacia la luna" (sintagma preposicional)

Tipo de oración: Enunciativa afirmativa, compuesta coordinada copulativa.`
};

// --- State ---
let isLoading = false;

// --- DOM Elements ---
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  setupEventListeners();
});

function setupEventListeners() {
  analyzeBtn.addEventListener('click', handleAnalyze);
  clearBtn.addEventListener('click', handleClear);

  // Keyboard shortcut: Ctrl/Cmd + Enter to analyze
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    }
  });
}

// --- Handlers ---
async function handleAnalyze() {
  const text = getInputText();

  if (!text) {
    showError('Por favor, escribe una frase para analizar.');
    return;
  }

  if (isLoading) return;

  setLoading(true);
  hideError();
  hideResults();

  try {
    // Simulate API call with mock data (will be replaced)
    const data = await analyzeMock(text);

    renderResult(data.tokens);
    renderLegend(data.tokens);
    renderAnalysis(data);
    showResults();
  } catch (err) {
    showError(`Error al analizar: ${err.message}`);
  } finally {
    setLoading(false);
  }
}

function handleClear() {
  clearInput();
  hideResults();
  hideError();
}

// --- Mock API (will be replaced by real fetch) ---
function analyzeMock(text) {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve(MOCK_RESPONSE);
    }, 1500);
  });
}

// --- UI State Helpers ---
function setLoading(loading) {
  isLoading = loading;
  analyzeBtn.disabled = loading;

  if (loading) {
    loadingSection.hidden = false;
    analyzeBtn.querySelector('.btn__text').textContent = 'Analizando...';
  } else {
    loadingSection.hidden = true;
    analyzeBtn.querySelector('.btn__text').textContent = 'Aplicar Linter';
  }
}

function showResults() {
  resultsSection.hidden = false;
  // Smooth scroll to results on mobile
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function hideResults() {
  resultsSection.hidden = true;
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorSection.hidden = false;
}

function hideError() {
  errorSection.hidden = true;
}
