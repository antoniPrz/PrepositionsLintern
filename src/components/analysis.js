/**
 * Analysis Component
 * Renders the detailed linguistic analysis panel
 */

/**
 * Render the full analysis panel
 * @param {Object} data - { tokens: [...], analysis: string }
 */
export function renderAnalysis(data) {
  const content = document.getElementById('analysis-content');
  if (!content) return;

  content.innerHTML = '';

  // Token breakdown section
  const tokenSection = createSection('Análisis por Palabra', renderTokenList(data.tokens));
  content.appendChild(tokenSection);

  // Full analysis section
  if (data.analysis) {
    const analysisSection = createSection('Análisis Completo', renderAnalysisText(data.analysis));
    content.appendChild(analysisSection);
  }
}

/**
 * Create a collapsible section
 */
function createSection(title, contentElement) {
  const section = document.createElement('div');
  section.className = 'analysis__section';

  const titleEl = document.createElement('h4');
  titleEl.className = 'analysis__section-title';
  titleEl.textContent = title;

  section.appendChild(titleEl);
  section.appendChild(contentElement);

  return section;
}

/**
 * Render the token list
 */
function renderTokenList(tokens) {
  const list = document.createElement('ul');
  list.className = 'analysis__token-list';

  tokens.forEach(token => {
    const cat = token.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const item = document.createElement('li');
    item.className = 'analysis__token-item';
    item.style.borderLeftColor = `var(--cat-${cat})`;

    const word = document.createElement('span');
    word.className = 'analysis__token-word';
    word.style.color = `var(--cat-${cat})`;
    word.textContent = `"${token.word}"`;

    const catBadge = document.createElement('span');
    catBadge.className = 'analysis__token-cat';
    catBadge.style.color = `var(--cat-${cat})`;
    catBadge.textContent = token.category;

    const detail = document.createElement('span');
    detail.className = 'analysis__token-detail';
    detail.textContent = token.detail || '';

    item.appendChild(word);
    item.appendChild(catBadge);
    item.appendChild(detail);
    list.appendChild(item);
  });

  return list;
}

/**
 * Render the analysis text
 */
function renderAnalysisText(text) {
  const container = document.createElement('div');
  container.className = 'analysis__summary';

  // Split by newlines and render as paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim());
  paragraphs.forEach(p => {
    const para = document.createElement('p');
    para.textContent = p;
    container.appendChild(para);
  });

  return container;
}
