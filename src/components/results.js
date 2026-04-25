/**
 * Results Component
 * Renders the analyzed text as syntax-highlighted code with grammar categories
 */

/** Category color map matching CSS classes */
const CATEGORY_MAP = {
  sustantivo:   { label: 'Sustantivo',   emoji: '🔵' },
  verbo:        { label: 'Verbo',        emoji: '🟢' },
  adjetivo:     { label: 'Adjetivo',     emoji: '🟠' },
  adverbio:     { label: 'Adverbio',     emoji: '🩷' },
  preposicion:  { label: 'Preposición',  emoji: '🟣' },
  determinante: { label: 'Determinante', emoji: '⚪' },
  pronombre:    { label: 'Pronombre',    emoji: '🟡' },
  conjuncion:   { label: 'Conjunción',   emoji: '🔴' },
  puntuacion:   { label: 'Puntuación',   emoji: '⚪' },
  interjeccion: { label: 'Interjección', emoji: '💜' },
};

/**
 * Render the syntax-highlighted result
 * @param {Array} tokens - Array of { word, category, detail }
 */
export function renderResult(tokens) {
  const resultCode = document.getElementById('result-code');
  const resultLineNumbers = document.getElementById('result-line-numbers');

  if (!resultCode || !resultLineNumbers) return;

  // Build the highlighted code
  resultCode.innerHTML = '';
  const fragment = document.createDocumentFragment();

  tokens.forEach((token, index) => {
    const span = document.createElement('span');
    const cat = token.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    span.className = `token token--${cat}`;
    span.textContent = token.word;
    span.dataset.category = token.category;
    span.dataset.detail = token.detail || '';
    span.dataset.index = index;

    // Tooltip on hover (mobile: on tap)
    span.addEventListener('mouseenter', showTooltip);
    span.addEventListener('mouseleave', hideTooltip);
    span.addEventListener('touchstart', handleTouch, { passive: true });

    fragment.appendChild(span);

    // Add space after word (unless next is punctuation)
    const nextToken = tokens[index + 1];
    if (nextToken) {
      const nextCat = nextToken.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (nextCat !== 'puntuacion') {
        fragment.appendChild(document.createTextNode(' '));
      }
    }
  });

  resultCode.appendChild(fragment);

  // Line numbers (treat as single line for now, or split by sentence)
  resultLineNumbers.innerHTML = '<span>1</span>';
}

/**
 * Render the color legend
 */
export function renderLegend(tokens) {
  const legendGrid = document.getElementById('legend-grid');
  if (!legendGrid) return;

  // Get unique categories from tokens
  const usedCategories = [...new Set(tokens.map(t =>
    t.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  ))];

  legendGrid.innerHTML = '';

  usedCategories.forEach(cat => {
    const info = CATEGORY_MAP[cat];
    if (!info) return;

    const item = document.createElement('div');
    item.className = 'legend__item';

    const dot = document.createElement('span');
    dot.className = 'legend__dot';
    dot.style.backgroundColor = `var(--cat-${cat})`;

    const label = document.createElement('span');
    label.className = 'legend__label';
    label.textContent = info.label;

    item.appendChild(dot);
    item.appendChild(label);
    legendGrid.appendChild(item);
  });
}

// --- Tooltip logic ---
let activeTooltip = null;

function showTooltip(e) {
  hideTooltip();

  const token = e.target;
  const category = token.dataset.category;
  const detail = token.dataset.detail;
  const cat = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const info = CATEGORY_MAP[cat] || { label: category, emoji: '❓' };

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.innerHTML = `
    <div class="tooltip__category" style="color: var(--cat-${cat})">${info.emoji} ${info.label}</div>
    ${detail ? `<div class="tooltip__detail">${detail}</div>` : ''}
  `;

  token.style.position = 'relative';
  token.appendChild(tooltip);
  activeTooltip = tooltip;

  // Ensure tooltip stays within viewport
  requestAnimationFrame(() => {
    const rect = tooltip.getBoundingClientRect();
    if (rect.left < 8) {
      tooltip.style.left = '0';
      tooltip.style.transform = 'none';
    }
    if (rect.right > window.innerWidth - 8) {
      tooltip.style.left = 'auto';
      tooltip.style.right = '0';
      tooltip.style.transform = 'none';
    }
    if (rect.top < 8) {
      tooltip.style.bottom = 'auto';
      tooltip.style.top = 'calc(100% + 8px)';
    }
  });
}

function hideTooltip() {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

function handleTouch(e) {
  const token = e.target;
  if (activeTooltip && activeTooltip.parentElement === token) {
    hideTooltip();
  } else {
    showTooltip(e);
    // Auto-hide after 3 seconds on mobile
    setTimeout(hideTooltip, 3000);
  }
}
