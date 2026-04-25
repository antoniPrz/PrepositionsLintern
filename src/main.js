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
    { word: 'Podemos',            category: 'texto_plano', detail: '' },
    { word: 'explicar',           category: 'poly',        detail: 'POLY heredado de PQ0. ¿Deducción, mecanismo, función?' },
    { word: 'cómo',               category: 'texto_plano', detail: '' },
    { word: 'el',                 category: 'texto_plano', detail: '' },
    { word: 'cerebro',            category: 'raw',         detail: 'Objeto físico C1/C2, bien anclado' },
    { word: 'procesa',            category: 'poly',        detail: 'Oscila entre proceso causal C2 o abstracción funcional C3' },
    { word: 'señales',            category: 'accesible',   detail: 'Procesos C2, medibles' },
    { word: ',',                  category: 'texto_plano', detail: '' },
    { word: 'pero',               category: 'texto_plano', detail: '' },
    { word: 'no',                 category: 'texto_plano', detail: '' },
    { word: 'tenemos',            category: 'texto_plano', detail: '' },
    { word: 'una',                category: 'texto_plano', detail: '' },
    { word: 'explicación',        category: 'poly',        detail: 'POLY no declarado' },
    { word: 'lógica',             category: 'texto_plano', detail: '' },
    { word: 'de',                 category: 'texto_plano', detail: '' },
    { word: 'por',                category: 'texto_plano', detail: '' },
    { word: 'qué',                category: 'texto_plano', detail: '' },
    { word: 'ese',                category: 'texto_plano', detail: '' },
    { word: 'procesamiento',      category: 'poly',        detail: 'Oscila entre C2 y C3' },
    { word: 'se',                 category: 'texto_plano', detail: '' },
    { word: 'siente',             category: 'dangling',    detail: 'Uso de "what it is like" sin referente intersubjetivo' },
    { word: 'como',               category: 'texto_plano', detail: '' },
    { word: 'algo',               category: 'texto_plano', detail: '' },
    { word: '.',                  category: 'texto_plano', detail: '' },
    { word: '¿Cómo',              category: 'texto_plano', detail: '' },
    { word: 'surge',              category: 'poly',        detail: '¿Emergencia? ¿Causación? ¿Identidad?' },
    { word: 'la',                 category: 'texto_plano', detail: '' },
    { word: 'experiencia',        category: 'dangling',    detail: 'Asume que refiere a algo real y determinado (nuclear)' },
    { word: 'subjetiva',          category: 'dangling',    detail: 'Ídem' },
    { word: '(qualia)',           category: 'dangling',    detail: 'Referente no localizable en ninguna capa de forma consistente' },
    { word: 'a',                  category: 'texto_plano', detail: '' },
    { word: 'partir',             category: 'texto_plano', detail: '' },
    { word: 'de',                 category: 'texto_plano', detail: '' },
    { word: 'materia',            category: 'raw',         detail: 'C1/C2' },
    { word: 'inerte',             category: 'ficcion',     detail: 'Atribución de capa C5 disfrazada de C1' },
    { word: '?',                  category: 'texto_plano', detail: '' },
  ],
  etapas: {
    ci: "Argumento (Input de tipo mixto).\nEl input tiene estructura de premisa -> brecha -> pregunta-conclusión. Usa una afirmación descriptiva implícita sobre el estado de la ciencia y un presupuesto normativo sobre qué cuenta como explicación.",
    lo: "Capa pretendida: C1/C2 (límite explicativo empírico).\nLocalización real: 'cerebro' en C1/C2, pero 'qualia' y 'experiencia subjetiva' no tienen localización estable en ninguna capa. 'Materia inerte' pretende C1 pero opera en C5 (definición impuesta).",
    ac: "Patología 1: DANGLING en posición absolutamente nuclear ('qualia'). Impacto constitutivo.\nPatología 2: Atribución de capa en 'materia inerte'.\nPatología 3: Inflación conceptual en la brecha explicativa.\nPatología 4: Parasitismo semántico ('experiencia' toma prestada la solidez de 'procesamiento').",
    pei: "Claim central: Existe una brecha explicativa irreducible que exige un tipo de explicación distinto.\nPresupuestos: 'qualia' refiere a algo real, 'materia' es por defecto no-experiencial.\nFricción termodinámica: Infinita. No genera predicciones ni procedimientos operacionales.",
    dd: "D1: Flexibilidad Semántica - Deficiente.\nD2: Calibración de certeza - Deficiente.\nD4: Apertura a falsificación - Crítica (infalsificable por construcción).\nD3: Transparencia de marco - Crítica.",
    ve: {
      clasificacion: "Reformulable",
      texto: "El input parte de un POLY no resuelto en 'explicación', usa ese POLY para construir una brecha, asigna a un lado un término DANGLING ('qualia') tratado como C1, y pregunta cómo se conectan. La aparente profundidad viene de construir sobre términos sin estatus ontológico validado.\n\nReformulación: '¿El concepto de experiencia subjetiva refiere a algo ontológicamente distinto de los procesos físicos, o es un artefacto de limitaciones en nuestro marco actual? Y si es distinto, ¿bajo qué condiciones podría ser verificado intersubjetivamente?'"
    }
  }
};

// --- State ---
let isLoading = false;
let authToken = null;

// --- DOM Elements ---
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');

// Auth DOM
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app');
const authInput = document.getElementById('auth-input');
const authBtn = document.getElementById('auth-btn');
const authError = document.getElementById('auth-error');
const usageCounter = document.getElementById('usage-counter');
const usageCountSpan = document.getElementById('usage-count');

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  setupEventListeners();
  checkAuth();
});

function setupEventListeners() {
  analyzeBtn.addEventListener('click', handleAnalyze);
  clearBtn.addEventListener('click', handleClear);
  authBtn.addEventListener('click', handleLogin);
  
  authInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

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
    // Call the actual API, fallback to mock if backend is down
    const data = await analyzeAPI(text);

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

// --- Auth Flow ---
async function checkAuth() {
  const savedToken = localStorage.getItem('linter_invite');
  if (savedToken) {
    await verifyAndLogin(savedToken);
  }
}

async function handleLogin() {
  const token = authInput.value.trim().toUpperCase();
  if (!token) return;
  
  authBtn.disabled = true;
  authBtn.querySelector('.btn__text').textContent = 'Verificando...';
  
  await verifyAndLogin(token);
  
  authBtn.disabled = false;
  authBtn.querySelector('.btn__text').textContent = 'Verificar y Entrar';
}

async function verifyAndLogin(token) {
  try {
    const res = await fetch('http://localhost:3000/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    const data = await res.json();
    
    if (res.ok && data.valid) {
      authToken = token;
      localStorage.setItem('linter_invite', token);
      
      authError.hidden = true;
      authScreen.style.display = 'none';
      appScreen.style.display = 'flex';
      
      usageCounter.hidden = false;
      usageCountSpan.textContent = data.remaining;
    } else {
      throw new Error(data.error || 'Código inválido');
    }
  } catch (error) {
    localStorage.removeItem('linter_invite');
    authToken = null;
    authError.textContent = error.message;
    authError.hidden = false;
    authScreen.style.display = 'flex';
    appScreen.style.display = 'none';
  }
}

function logout(message) {
  localStorage.removeItem('linter_invite');
  authToken = null;
  authInput.value = '';
  authError.textContent = message || 'Sesión expirada';
  authError.hidden = false;
  authScreen.style.display = 'flex';
  appScreen.style.display = 'none';
}

// --- API Connection ---
async function analyzeAPI(text) {
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-invitation-token': authToken || ''
      },
      body: JSON.stringify({ text })
    });
    
    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      logout(data.error || 'Acceso denegado');
      throw new Error(data.error || 'Acceso denegado');
    }

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    if (data.meta && data.meta.remaining !== undefined) {
      usageCountSpan.textContent = data.meta.remaining;
    }
    
    return data;
  } catch (error) {
    if (error.message.includes('Acceso denegado') || error.message.includes('invitación')) {
      throw error;
    }
    console.warn("Backend local no detectado o error de red. Usando datos de prueba (Mock).", error);
    return analyzeMock(text);
  }
}

// --- Mock API (Fallback) ---
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
