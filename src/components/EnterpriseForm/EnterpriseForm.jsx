import React, { useState } from 'react';
import PersonalInfoSection from '../PersonalInfoSection/PersonalInfoSection';
import PassportInfoSection from '../PassportInfoSection/PassportInfoSection';
import FileUploader from '../FileUploader/FileUploader';
import arrowLeftIcon from '../../assets/imgs/icon-arrow-left.png';
import './index.scss';

export default function EnterpriseForm() {
  // form state
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    passportSeries: '',
    passportNumber: '',
    passportIssuedBy: '',
    passportIssueDate: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (files.length === 0) {
      alert('Пожалуйста, загрузите хотя бы один подтверждающий документ.');
      return;
    }

    const hasErrors = files.some((f) =>
      ['error_quota', 'error_upload', 'error_format'].includes(f.status)
    );
    const currentQuotaBytes = files.reduce(
      (acc, f) => (['success', 'loading', 'error_quota'].includes(f.status) ? acc + f.size : acc),
      0
    );

    if (hasErrors || currentQuotaBytes > 25 * 1024 * 1024) {
      alert(
        'Превышен допустимый объем вложений (25 МБ).\nПроверьте размер загруженных документов.'
      );
      return;
    }

    console.log('=== SUBMIT DATA ===', {
      personalInfo: { ...formData },
      attachedDocuments: files.map((f) => ({ name: f.name, size: f.size, status: f.status })),
    });

    alert('Анкета и документы успешно отправлены!');
  };

  return (
    <main className="form-container">
      <form className="wizard-form" onSubmit={handleFormSubmit}>
        <PersonalInfoSection formData={formData} onChange={handleInputChange} />
        <PassportInfoSection formData={formData} onChange={handleInputChange} />
        <FileUploader files={files} setFiles={setFiles} />

        {/* form actions footer */}
        <div className="form-footer">
          <button type="button" className="btn-secondary" onClick={() => alert('Назад')}>
            <img src={arrowLeftIcon} alt="" className="btn-back-icon" /> Назад
          </button>
          <button type="submit" className="btn-primary">
            Создать документ
          </button>
        </div>
      </form>
    </main>
  );
}
