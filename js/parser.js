/**
 * parser.js — PDF Text Extraction using PDF.js
 * Handles drag & drop and file input for resume uploads
 */

// Set PDF.js worker path
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Global variable to store extracted resume text
let resumeText = '';

/**
 * Extract all text from a PDF file
 */
async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async function (event) {
      try {
        const typedArray = new Uint8Array(event.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();

          const pageText = content.items
            .map(item => item.str)
            .join(' ');

          fullText += pageText + '\n';
        }

        resolve(fullText.trim());
      } catch (error) {
        reject('Error reading PDF: ' + error.message);
      }
    };

    reader.onerror = () => reject('File reading failed');
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Setup file input listener
 */
function setupFileInput() {
  const fileInput = document.getElementById('resumeFile');
  const fileStatus = document.getElementById('fileStatus');
  const resumePreview = document.getElementById('resumePreview');

  fileInput.addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      fileStatus.textContent = '⚠ Please upload a PDF file only';
      fileStatus.style.color = '#ef4444';
      return;
    }

    fileStatus.textContent = '⏳ Reading PDF...';
    fileStatus.style.color = '#00f0ff';

    try {
      resumeText = await extractTextFromPDF(file);

      fileStatus.textContent = `✓ Loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      fileStatus.classList.add('loaded');

      if (resumeText.length > 0) {
        resumePreview.style.display = 'block';
        resumePreview.textContent = resumeText.substring(0, 400) + '...';
      }

    } catch (err) {
      fileStatus.textContent = '✗ ' + err;
      fileStatus.style.color = '#ef4444';
      resumeText = '';
    }
  });
}

/**
 * Setup Drag & Drop functionality
 */
function setupDragDrop() {
  const dropArea = document.getElementById('dropArea');
  const fileInput = document.getElementById('resumeFile');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove('dragging');
    });
  });

  dropArea.addEventListener('drop', async function (e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];

    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });

  dropArea.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-upload') || e.target.tagName === 'LABEL') return;
    fileInput.click();
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
  setupFileInput();
  setupDragDrop();

  const jdTextarea = document.getElementById('jobDescription');
  const charCount = document.getElementById('charCount');

  jdTextarea.addEventListener('input', function () {
    charCount.textContent = `${this.value.length} characters`;
  });
});
