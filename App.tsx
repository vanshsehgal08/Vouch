import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import { View } from './components/Sidebar';
import ReferralForm from './components/ReferralForm';
import GeneratedEmail from './components/GeneratedEmail';
import CoverLetterForm from './components/CoverLetterForm';
import GeneratedCoverLetter from './components/GeneratedCoverLetter';
import HistoryView, { HistoryItem } from './components/HistoryView';
import TemplatesView from './components/TemplatesView';
import ProfileView, { UserProfile } from './components/ProfileView';
import ResumeBuilder from './components/ResumeBuilder';
import { generateReferralEmail, generateCoverLetter } from './services/geminiService';
import { useNotification } from './components/Notification';

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    role: '',
    jobId: '',
    jobDescription: '',
    resumeLink: '',
    jobLink: '',
    emailId: '',
    contact: '',
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
  const [generatedCoverLetterContent, setGeneratedCoverLetterContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        const profile: UserProfile = JSON.parse(savedProfile);
        setUserProfile(profile);
        // Update form data with profile defaults
        setFormData(prev => ({
          ...prev,
          resumeLink: profile.resumeLink || '',
          emailId: profile.emailId || '',
          contact: profile.contact || '',
        }));
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }
  }, []);

  const loadProfileData = () => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        const profile: UserProfile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setFormData(prev => ({
          ...prev,
          resumeLink: profile.resumeLink || '',
          emailId: profile.emailId || '',
          contact: profile.contact || '',
        }));
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, value } = target;
    const checked = target.type === 'checkbox' ? (target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked !== undefined ? checked : value 
    }));
  };

  const handleGenerateClick = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedEmail('');
    try {
      const email = await generateReferralEmail(formData);
      setGeneratedEmail(email);
      
      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        email,
        subject: email.split('\n')[0].replace('Subject:', '').trim(),
        companyName: formData.companyName,
        role: formData.role,
        type: 'email'
      };
      const existingHistory = JSON.parse(localStorage.getItem('email_history') || '[]');
      localStorage.setItem('email_history', JSON.stringify([historyItem, ...existingHistory]));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
      showError('Failed to generate email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCoverLetterClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coverLetter = await generateCoverLetter(formData);
      // Save to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        email: coverLetter,
        subject: `Cover Letter for ${formData.role} at ${formData.companyName}`,
        companyName: formData.companyName,
        role: formData.role,
        type: 'cover-letter'
      };
      const existingHistory = JSON.parse(localStorage.getItem('email_history') || '[]');
      localStorage.setItem('email_history', JSON.stringify([historyItem, ...existingHistory]));

      showSuccess('Cover Letter generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
      showError('Failed to generate cover letter');
    } finally {
      setIsLoading(false);
    }
  };

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
      showSuccess('Template saved successfully!');
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    if (item.type === 'cover-letter') {
      setGeneratedCoverLetterContent(item.email);
      setCurrentView('cover-letter');
      showSuccess('Cover Letter restored from history');
    } else {
      setGeneratedEmail(item.email);
      setCurrentView('home');
      showSuccess('Email restored from history');
    }
  };

  const handleApplyTemplate = (data: FormData) => {
    setFormData(data);
    setCurrentView('home');
    showSuccess('Template applied successfully');
  };

  const handleProfileSaved = () => {
    loadProfileData();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-2rem)] pb-6">
            <div className="h-full overflow-y-auto custom-scrollbar pr-2">
              <ReferralForm 
                formData={formData} 
                onFormChange={handleFormChange}
                onGenerateClick={handleGenerateClick}
                onSaveTemplate={handleSaveTemplate}
                isLoading={isLoading}
              />
            </div>
            <div className="h-full overflow-hidden">
              <GeneratedEmail 
                email={generatedEmail} 
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        );
      case 'cover-letter':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-2rem)] pb-6">
             <div className="h-full overflow-y-auto custom-scrollbar pr-2">
              <CoverLetterForm 
                formData={formData} 
                onFormChange={handleFormChange}
                onGenerateClick={handleGenerateCoverLetterClick}
                isLoading={isLoading}
              />
            </div>
            <div className="h-full overflow-hidden">
              <GeneratedCoverLetter 
                content={generatedCoverLetterContent} 
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        );
      case 'resume-builder':
        return <ResumeBuilder />;
      case 'history':
        return <HistoryView onRestore={handleRestoreHistory} />;
      case 'templates':
        return <TemplatesView onApply={handleApplyTemplate} />;
      case 'profile':
        return <ProfileView onProfileSaved={handleProfileSaved} />;
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
