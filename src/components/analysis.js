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

  // Render stages if available
  if (data.etapas) {
    if (data.etapas.ci) content.appendChild(createSection('Etapa 0 - Clasificación (CI)', renderAnalysisText(data.etapas.ci)));
    if (data.etapas.lo) content.appendChild(createSection('Etapa 2 - Localización Ontológica (LO)', renderAnalysisText(data.etapas.lo)));
    if (data.etapas.ac) content.appendChild(createSection('Etapa 3 - Auditoría de Capa (AC)', renderAnalysisText(data.etapas.ac)));
    if (data.etapas.pei) content.appendChild(createSection('Etapa 4 - Pipeline Epistémico (PEI)', renderAnalysisText(data.etapas.pei)));
    if (data.etapas.dd) content.appendChild(createSection('Etapa 5 - Diagnóstico Dimensional (DD)', renderAnalysisText(data.etapas.dd)));
    
    if (data.etapas.ve) {
      const veContainer = document.createElement('div');
      
      const badge = document.createElement('div');
      badge.style.display = 'inline-block';
      badge.style.padding = '4px 8px';
      badge.style.borderRadius = '4px';
      badge.style.marginBottom = '8px';
      badge.style.fontWeight = 'bold';
      badge.style.textTransform = 'uppercase';
      
      const cls = data.etapas.ve.clasificacion;
      if (cls === 'Válido') badge.style.backgroundColor = 'rgba(80, 250, 123, 0.2)';
      else if (cls === 'Inválido') badge.style.backgroundColor = 'rgba(255, 85, 85, 0.2)';
      else if (cls === 'Indefinido') badge.style.backgroundColor = 'rgba(189, 147, 249, 0.2)';
      else badge.style.backgroundColor = 'rgba(241, 250, 140, 0.2)'; // Reformulable
      
      badge.textContent = `Veredicto: ${cls}`;
      veContainer.appendChild(badge);
      veContainer.appendChild(renderAnalysisText(data.etapas.ve.texto));
      
      content.appendChild(createSection('Etapa 6 - Veredicto Estructurado (VE)', veContainer));
    }
  } else if (data.analysis) {
    // Fallback for old mock data
    content.appendChild(createSection('Análisis Completo', renderAnalysisText(data.analysis)));
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
