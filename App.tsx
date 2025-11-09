import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ReferralForm from './components/ReferralForm';
import GeneratedEmail from './components/GeneratedEmail';
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

  const handleGenerateClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedEmail('');
    console.log('Generate clicked with form data:', formData);
    try {
      const email = await generateReferralEmail(formData);
      setGeneratedEmail(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ReferralForm
              formData={formData}
              onFormChange={handleFormChange}
              onGenerateClick={handleGenerateClick}
              isLoading={isLoading}
            />
            <GeneratedEmail
              email={generatedEmail}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
