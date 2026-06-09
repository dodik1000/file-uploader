import React, { useState } from 'react';
import QuotaBlock from '../QuotaBlock/QuotaBlock';
import DropZone from '../DropZone/DropZone';
import FileList from '../FileList/FileList';
import arrowLeftIcon from '../../assets/imgs/icon-arrow-left.png';
import './index.scss';

const MAX_QUOTA_BYTES = 25 * 1024 * 1024;

export default function FileUploader() {
  const [files, setFiles] = useState([]);

  // live quota counter
  const currentQuotaBytes = files.reduce(
    (acc, file) =>
      ['success', 'loading', 'error_quota'].includes(file.status) ? acc + file.size : acc,
    0
  );

  const isQuotaOverfilled = currentQuotaBytes >= MAX_QUOTA_BYTES;

  const handleFilesAdded = (newFileList) => {
    if (isQuotaOverfilled) {
      alert('Невозможно добавить файл. Превышен допустимый объем вложений.');
      return;
    }

    const processedFiles = Array.from(newFileList)
      .map((file) => {
        const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
        const fileId = `${file.name}-${Date.now()}-${Math.random()}`;

        if (files.some((f) => f.name === file.name && f.status !== 'error_format')) {
          alert(`Файл с именем "${file.name}" уже добавлен`);
          return null;
        }

        return {
          id: fileId,
          name: file.name,
          size: file.size,
          status: isPdf ? 'loading' : 'error_format',
          progress: isPdf ? 10 : 0,
        };
      })
      .filter(Boolean);

    if (!processedFiles.length) return;

    setFiles((prev) => {
      const updatedList = [...prev, ...processedFiles];
      processedFiles.forEach((file) => {
        if (file.status === 'loading') simulateServerUpload(file.id, file.size);
      });
      return updatedList;
    });
  };

  // async upload simulation pipeline
  const simulateServerUpload = (id, size) => {
    let currentProgress = 10;

    const interval = setInterval(() => {
      currentProgress += 30;

      if (currentProgress >= 100) {
        clearInterval(interval);

        setFiles((prevFiles) => {
          const currentAllocatedBytes = prevFiles.reduce(
            (acc, f) =>
              f.id !== id && ['success', 'loading', 'error_quota'].includes(f.status)
                ? acc + f.size
                : acc,
            0
          );
          const finalStatus =
            currentAllocatedBytes + size > MAX_QUOTA_BYTES ? 'error_quota' : 'success';

          return prevFiles.map((f) =>
            f.id === id ? { ...f, status: finalStatus, progress: 100 } : f
          );
        });
      } else {
        setFiles((prevFiles) =>
          prevFiles.map((f) => (f.id === id ? { ...f, progress: currentProgress } : f))
        );
      }
    }, 400);
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRetryUpload = (id) => {
    const targetFile = files.find((f) => f.id === id);
    if (!targetFile) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'loading', progress: 10 } : f))
    );
    simulateServerUpload(id, targetFile.size);
  };

  // browser proxy download bridge
  const handleDownloadFile = (file) => {
    const content = `Mock file content: ${file.name}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = file.name;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);
  };

  // interface test controller
  const handleSubmit = () => {
    const sizeInput = prompt('Введите размер файла в МБ:', '10');
    if (sizeInput === null) return;

    const sizeMB = parseFloat(sizeInput.replace(',', '.'));
    if (isNaN(sizeMB) || sizeMB <= 0) {
      alert('Пожалуйста, введите корректное число больше нуля.');
      return;
    }

    handleFilesAdded([
      {
        name: `Тест_${sizeMB.toString().replace('.', '_')}МБ.pdf`,
        size: Math.round(sizeMB * 1024 * 1024),
        type: 'application/pdf',
      },
    ]);
  };

  return (
    <div className="file-uploader">
      <header className="uploader-header">
        <h2>3. Подтверждающие документы</h2>
        <h1>Загрузите документы, подтверждающие факт подписания договора цифрового счета.</h1>
      </header>

      <DropZone onFilesAdded={handleFilesAdded} isQuotaOverfilled={isQuotaOverfilled} />

      {files.length > 0 && (
        <QuotaBlock currentQuotaBytes={currentQuotaBytes} maxQuotaBytes={MAX_QUOTA_BYTES} />
      )}

      <FileList
        files={files}
        onRemoveFile={handleRemoveFile}
        onRetryUpload={handleRetryUpload}
        onDownloadFile={handleDownloadFile}
      />

      <footer className="uploader-footer">
        <button className="btn-secondary">
          <img src={arrowLeftIcon} alt="Back" className="btn-back-icon" /> Назад
        </button>
        <button className="btn-primary" onClick={handleSubmit}>
          Создать документ
        </button>
      </footer>
    </div>
  );
}
