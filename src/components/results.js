/**
 * Results Component
 * Renders the analyzed text as syntax-highlighted code with grammar categories
 */

/** Category color map matching CSS classes */
const CATEGORY_MAP = {
  raw:         { label: 'RAW',        emoji: '🟢' },
  accesible:   { label: 'ACCESIBLE',  emoji: '🟦' },
  ficcion:     { label: 'FICCIÓN',    emoji: '🟠' },
  poly:        { label: 'POLY',       emoji: '⚠️' },
  indefinido:  { label: 'INDEFINIDO', emoji: '🟣' },
  dangling:    { label: 'DANGLING',   emoji: '🔴' },
  texto_plano: { label: 'Plano',      emoji: '⚪' }
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

  document.body.appendChild(tooltip);
  activeTooltip = tooltip;

  // Calculate position relative to the whole page
  const rect = token.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  
  // Default: pop UP
  let top = rect.top + scrollY - 8;
  let left = rect.left + scrollX + (rect.width / 2);
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.transform = 'translate(-50%, -100%)'; // Move up by 100% of its own height

  // Adjust if out of viewport
  requestAnimationFrame(() => {
    const ttRect = tooltip.getBoundingClientRect();
    let currentTransform = 'translate(-50%, -100%)';
    
    // Check horizontal boundaries
    if (ttRect.left < 8) {
      tooltip.style.left = '8px';
      currentTransform = 'translate(0, -100%)';
    } else if (ttRect.right > window.innerWidth - 8) {
      tooltip.style.left = 'auto';
      tooltip.style.right = '8px';
      currentTransform = 'translate(0, -100%)';
    }
    
    // Check vertical boundaries (if it goes above viewport, pop DOWN instead)
    if (ttRect.top < 8) {
      tooltip.style.top = `${rect.bottom + scrollY + 8}px`;
      currentTransform = currentTransform.replace('-100%', '0');
      tooltip.classList.add('tooltip--down');
    }
    
    tooltip.style.transform = currentTransform;
    tooltip.style.opacity = '1';
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
