import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import { View } from './components/Sidebar';
import ReferralForm from './components/ReferralForm';
import GeneratedEmail from './components/GeneratedEmail';
import HistoryView from './components/HistoryView';
import TemplatesView from './components/TemplatesView';
import { generateReferralEmail } from './services/geminiService';

export interface FormData {
  companyName: string;
  role: string;
  jobId: string;
  jobDescription: string;
  resumeLink: string;
  jobLink: string;
  emailId: string;
  contact: string;
  additionalInstructions: string;
  includeResumeLink: boolean;
  includeJobId: boolean;
  includeJobLink: boolean;
  includeEmailId: boolean;
  includeContact: boolean;
  includeProjects: boolean;
  includeExperience: boolean;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    role: '',
    jobId: '',
    jobDescription: '',
    resumeLink: 'https://drive.google.com/file/d/1QxClADG7qw2Vo7h0ZTIT18sHy_urj1rT/view',
    jobLink: '',
    emailId: 'vanshsehgal2019@gmail.com',
    contact: '9910248214',
    additionalInstructions: '',
    includeResumeLink: true,
    includeJobId: true,
    includeJobLink: false,
    includeEmailId: false,
    includeContact: false,
    includeProjects: false,
    includeExperience: false,
  });
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value } = target;
    const checked = target.type === 'checkbox' ? (target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked !== undefined ? checked : value 
    }));
  };

  const saveToHistory = (email: string) => {
    const newItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      email,
      subject: email.split('\n')[0].replace('Subject:', '').trim(),
      companyName: formData.companyName,
      role: formData.role
    };
    
    const existingHistory = JSON.parse(localStorage.getItem('email_history') || '[]');
    const newHistory = [newItem, ...existingHistory].slice(0, 50); // Keep last 50
    localStorage.setItem('email_history', JSON.stringify(newHistory));
  };

  const handleGenerateClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedEmail('');
    try {
      const email = await generateReferralEmail(formData);
      setGeneratedEmail(email);
      saveToHistory(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleSaveTemplate = () => {
    const name = prompt('Enter a name for this template:', `${formData.companyName} - ${formData.role}`);
    if (name) {
      const newTemplate = {
        id: Date.now().toString(),
        name,
        timestamp: Date.now(),
        data: formData
      };
      const existingTemplates = JSON.parse(localStorage.getItem('form_templates') || '[]');
      localStorage.setItem('form_templates', JSON.stringify([newTemplate, ...existingTemplates]));
      alert('Template saved!');
    }
  };

  const handleRestoreHistory = (email: string) => {
    setGeneratedEmail(email);
    setCurrentView('home');
  };

  const handleApplyTemplate = (data: FormData) => {
    setFormData(data);
    setCurrentView('home');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
              <ReferralForm
                formData={formData}
                onFormChange={handleFormChange}
                onGenerateClick={handleGenerateClick}
                onSaveTemplate={handleSaveTemplate}
                isLoading={isLoading}
              />
            </div>
            <div className="h-full overflow-y-auto pl-2 custom-scrollbar">
              <GeneratedEmail
                email={generatedEmail}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        );
      case 'history':
        return <HistoryView onRestore={handleRestoreHistory} />;
      case 'templates':
        return <TemplatesView onApply={handleApplyTemplate} />;
      default:
        return null;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
