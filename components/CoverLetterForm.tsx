import React from 'react';
import type { FormData } from '../App';
import { Sparkles, Loader2, Save, Briefcase, User, FileText, Link as LinkIcon, Mail, Phone, FileCode } from 'lucide-react';

interface CoverLetterFormProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGenerateClick: () => void;
  isLoading: boolean;
}

const InputField: React.FC<{ 
  label: string; 
  name: keyof FormData; 
  value: string; 
  onChange: CoverLetterFormProps['onFormChange']; 
  placeholder?: string; 
  type?: string;
  icon?: React.ElementType;
}> = ({ label, name, value, onChange, placeholder, type = "text", icon: Icon }) => (
  <div className="group relative">
    <label htmlFor={name} className="block text-xs font-bold text-black mb-2 uppercase tracking-wide ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-white border-2 border-gray-300 rounded-lg shadow-sm py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200`}
      />
    </div>
  </div>
);

const TextAreaField: React.FC<{ 
  label: string; 
  name: keyof FormData; 
  value: string; 
  onChange: CoverLetterFormProps['onFormChange']; 
  placeholder?: string; 
  rows?: number 
}> = ({ label, name, value, onChange, placeholder, rows=6 }) => (
    <div className="group">
      <label htmlFor={name} className="block text-xs font-bold text-black mb-2 uppercase tracking-wide ml-1">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white border-2 border-gray-300 rounded-lg shadow-sm py-3 px-4 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 resize-none custom-scrollbar"
      />
    </div>
);

const CoverLetterForm: React.FC<CoverLetterFormProps> = ({ formData, onFormChange, onGenerateClick, isLoading }) => {
  return (
    <div className="glass-light p-6 sm:p-8 rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Cover Letter Details
        </h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField 
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={onFormChange}
              placeholder="e.g., Google"
              icon={Briefcase}
          />
           <InputField 
              label="Role / Job Title"
              name="role"
              value={formData.role}
              onChange={onFormChange}
              placeholder="e.g., Senior Software Engineer"
              icon={User}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <InputField 
              label="Job ID (Optional)"
              name="jobId"
              value={formData.jobId}
              onChange={onFormChange}
              placeholder="e.g., 123456"
              icon={FileCode}
          />
          <InputField 
              label="Job Link (Optional)"
              name="jobLink"
              value={formData.jobLink}
              onChange={onFormChange}
              placeholder="https://careers.google.com/..."
              icon={LinkIcon}
          />
        </div>

         <TextAreaField
            label="Job Description"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={onFormChange}
            placeholder="Paste the full job description here..."
         />
        <TextAreaField
            label="Additional Instructions (Optional)"
            name="additionalInstructions"
            value={formData.additionalInstructions}
            onChange={onFormChange}
            placeholder="e.g., Emphasize my leadership skills..."
            rows={3}
         />
        
        <button
          onClick={onGenerateClick}
          disabled={isLoading}
          className="w-full group relative overflow-hidden bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
        >
          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin"/>
                <span>Crafting your cover letter...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:animate-pulse"/>
                <span>Generate Cover Letter</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default CoverLetterForm;
