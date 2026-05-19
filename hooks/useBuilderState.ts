import { useState } from 'react';
import { ResumeData } from '@/lib/types';

export function useBuilderState(data: ResumeData, templateId: 'classic' | 'modern') {
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setDlError('');
    try {
      const { generateBuilderPdfBlob } = await import('@/lib/resumePdf');
      const blob = await generateBuilderPdfBlob(data, templateId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fullName = [data.contact.firstName, data.contact.lastName].filter(Boolean).join('_') || 'Resume';
      a.download = `${fullName}_TailorCV.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setDlError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return {
    step, setStep,
    showModal, setShowModal,
    showImport, setShowImport,
    downloading,
    dlError,
    handleDownload
  };
}
