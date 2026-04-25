/**
 * Editor Component
 * Manages the code-editor-style input area with line numbers
 */

export function initEditor() {
  const textarea = document.getElementById('input-text');
  const lineNumbers = document.getElementById('line-numbers');

  if (!textarea || !lineNumbers) return;

  // Update line numbers on input
  textarea.addEventListener('input', () => updateLineNumbers(textarea, lineNumbers));
  textarea.addEventListener('scroll', () => syncScroll(textarea, lineNumbers));

  // Initial line numbers
  updateLineNumbers(textarea, lineNumbers);

  // Auto-resize textarea
  textarea.addEventListener('input', () => autoResize(textarea));
}

function updateLineNumbers(textarea, lineNumbers) {
  const lines = textarea.value.split('\n');
  const count = Math.max(lines.length, 1);

  lineNumbers.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const span = document.createElement('span');
    span.textContent = i;
    lineNumbers.appendChild(span);
  }
}

function syncScroll(textarea, lineNumbers) {
  lineNumbers.scrollTop = textarea.scrollTop;
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
}

/**
 * Get the current input text
 */
export function getInputText() {
  const textarea = document.getElementById('input-text');
  return textarea ? textarea.value.trim() : '';
}

/**
 * Clear the input
 */
export function clearInput() {
  const textarea = document.getElementById('input-text');
  const lineNumbers = document.getElementById('line-numbers');
  if (textarea) {
    textarea.value = '';
    textarea.style.height = '120px';
    updateLineNumbers(textarea, lineNumbers);
  }
}
