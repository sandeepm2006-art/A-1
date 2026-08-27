import JSZip from 'jszip';
import { PYTHON_MODULES } from '../data/pythonFiles';
import { PRESET_SAMPLE_DATASET_CSV } from '../data/sampleDatasetCsv';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

/**
 * Universal text copy helper with iframe permission fallback.
 * Uses navigator.clipboard.writeText when available, and falls back to a hidden textarea execCommand('copy')
 * if blocked by iframe permissions policy.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_e) {
    // Fallback below
  }

  // Fallback for sandboxed iframes
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Robust file downloader with multiple fallback layers:
 * 1. Native Blob object URL click
 * 2. Data URI trigger
 * 3. Returns status so UI can provide feedback or open raw view
 */
export function triggerFileDownload(filename: string, content: string, mimeType: string = 'text/plain'): boolean {
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);
    return true;
  } catch (blobErr) {
    console.warn('Blob download failed, trying data URI fallback:', blobErr);
    try {
      const dataUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 1000);
      return true;
    } catch (dataErr) {
      console.error('Data URI download failed:', dataErr);
      return false;
    }
  }
}

/**
 * Packages all pipeline files, configurations, and dataset into a single ZIP archive.
 */
export async function downloadProjectZipArchive(): Promise<boolean> {
  try {
    const zip = new JSZip();
    
    // Add all python modules, requirements, and readme
    PYTHON_MODULES.forEach((mod) => {
      zip.file(mod.filename, mod.code);
    });

    // Add synthetic dataset CSV
    zip.file('cardiovascular_dataset_sample.csv', PRESET_SAMPLE_DATASET_CSV);

    // Generate zip blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // Trigger download
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CardioAI_Explainable_ML_Pipeline.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);

    return true;
  } catch (err) {
    console.error('Failed to generate or download ZIP archive:', err);
    return false;
  }
}
