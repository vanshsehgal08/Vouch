import React from 'react';
import type { FormData } from '../App';
import { Sparkles, Loader2, Save, Briefcase, User, FileText, Link as LinkIcon, Mail, Phone, FileCode } from 'lucide-react';

interface ReferralFormProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGenerateClick: () => void;
  onSaveTemplate: () => void;
  isLoading: boolean;
}

const InputField: React.FC<{ 
  label: string; 
  name: keyof FormData; 
  value: string; 
  onChange: ReferralFormProps['onFormChange']; 
  placeholder?: string; 
  type?: string;
  icon?: React.ElementType;
}> = ({ label, name, value, onChange, placeholder, type = "text", icon: Icon }) => (
  <div className="group relative">
    <label htmlFor={name} className="block text-xs font-medium text-cyan-400 mb-1 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
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
        className={`w-full bg-slate-900/50 border border-slate-700 rounded-xl shadow-sm py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200`}
      />
    </div>
  </div>
);

const CheckboxField: React.FC<{ 
  label: string; 
  name: keyof FormData; 
  checked: boolean; 
  onChange: ReferralFormProps['onFormChange']; 
  description?: string 
}> = ({ label, name, checked, onChange, description }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${checked ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'}`}>
    <div className="relative flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-slate-800 transition-all checked:border-cyan-500 checked:bg-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
    <div className="flex-1">
      <label htmlFor={name} className={`text-sm font-medium cursor-pointer transition-colors ${checked ? 'text-cyan-100' : 'text-slate-300'}`}>
        {label}
      </label>
      {description && (
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      )}
    </div>
  </div>
);

const TextAreaField: React.FC<{ 
  label: string; 
  name: keyof FormData; 
  value: string; 
  onChange: ReferralFormProps['onFormChange']; 
  placeholder?: string; 
  rows?: number 
}> = ({ label, name, value, onChange, placeholder, rows=6 }) => (
    <div className="group">
      <label htmlFor={name} className="block text-xs font-medium text-cyan-400 mb-1 uppercase tracking-wider ml-1">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl shadow-sm py-3 px-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 resize-none custom-scrollbar"
      />
    </div>
);


const ReferralForm: React.FC<ReferralFormProps> = ({ formData, onFormChange, onGenerateClick, onSaveTemplate, isLoading }) => {
  return (
    <div className="bg-slate-800/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-700/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-cyan-400" />
          Job Details
        </h2>
        <button 
          onClick={onSaveTemplate}
          className="text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700"
        >
          <Save className="w-3 h-3" />
          Save as Template
        </button>
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
              label="Job ID"
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

        <InputField 
            label="Your Resume Link"
            name="resumeLink"
            value={formData.resumeLink}
            onChange={onFormChange}
            placeholder="https://drive.google.com/..."
            icon={FileText}
        />

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
            placeholder="e.g., Focus on my leadership experience..."
            rows={3}
         />
        
        <div className="pt-6 border-t border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Customization Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CheckboxField
              label="Resume Link"
              name="includeResumeLink"
              checked={formData.includeResumeLink}
              onChange={onFormChange}
              description="Include resume link"
            />
            <CheckboxField
              label="Job ID"
              name="includeJobId"
              checked={formData.includeJobId}
              onChange={onFormChange}
              description="Include job ID"
            />
            <CheckboxField
              label="Job Link"
              name="includeJobLink"
              checked={formData.includeJobLink}
              onChange={onFormChange}
              description="Include job URL"
            />
            <CheckboxField
              label="Email ID"
              name="includeEmailId"
              checked={formData.includeEmailId}
              onChange={onFormChange}
              description="Include your email"
            />
            <CheckboxField
              label="Contact"
              name="includeContact"
              checked={formData.includeContact}
              onChange={onFormChange}
              description="Include phone number"
            />
            <CheckboxField
              label="Projects"
              name="includeProjects"
              checked={formData.includeProjects}
              onChange={onFormChange}
              description="Reference your projects"
            />
            <CheckboxField
              label="Experience"
              name="includeExperience"
              checked={formData.includeExperience}
              onChange={onFormChange}
              description="Reference your experience"
            />
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField 
            label="Your Email"
            name="emailId"
            value={formData.emailId}
            onChange={onFormChange}
            placeholder="you@example.com"
            type="email"
            icon={Mail}
          />
          <InputField 
            label="Your Contact"
            name="contact"
            value={formData.contact}
            onChange={onFormChange}
            placeholder="+1 234 567 8900"
            type="tel"
            icon={Phone}
          />
        </div>

        <button
          onClick={onGenerateClick}
          disabled={isLoading}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin"/>
                <span>Crafting your email...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:animate-pulse"/>
                <span>Generate Referral Email</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default ReferralForm;
