import React from 'react';
import type { FormData } from '../App';
import SparklesIcon from './icons/SparklesIcon';
import LoadingIcon from './icons/LoadingIcon';

interface ReferralFormProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGenerateClick: () => void;
  isLoading: boolean;
}

const InputField: React.FC<{ label: string; name: keyof FormData; value: string; onChange: ReferralFormProps['onFormChange']; placeholder?: string; type?: string }> = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
    />
  </div>
);

const CheckboxField: React.FC<{ label: string; name: keyof FormData; checked: boolean; onChange: ReferralFormProps['onFormChange']; description?: string }> = ({ label, name, checked, onChange, description }) => (
  <div className="flex items-start gap-2">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      className="mt-1 w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
    />
    <div className="flex-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-300 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
  </div>
);

const TextAreaField: React.FC<{ label: string; name: keyof FormData; value: string; onChange: ReferralFormProps['onFormChange']; placeholder?: string; rows?: number }> = ({ label, name, value, onChange, placeholder, rows=6 }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
      />
    </div>
);


const ReferralForm: React.FC<ReferralFormProps> = ({ formData, onFormChange, onGenerateClick, isLoading }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Job Details</h2>
      <div className="space-y-4">
        <InputField 
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={onFormChange}
            placeholder="e.g., Amex GBT"
        />
         <InputField 
            label="Role / Job Title"
            name="role"
            value={formData.role}
            onChange={onFormChange}
            placeholder="e.g., Software Development Engineer I"
        />
         <InputField 
            label="Job ID"
            name="jobId"
            value={formData.jobId}
            onChange={onFormChange}
            placeholder="e.g., J-77143"
        />
        <InputField 
            label="Your Resume Link"
            name="resumeLink"
            value={formData.resumeLink}
            onChange={onFormChange}
            placeholder="https://your-resume-link.com"
        />
        <InputField 
            label="Job Link (Optional)"
            name="jobLink"
            value={formData.jobLink}
            onChange={onFormChange}
            placeholder="https://company.com/careers/job-id"
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
            placeholder="e.g., Emphasize my experience with Java and distributed systems."
            rows={3}
         />
        
        <div className="pt-2 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Include in Email:</h3>
          <div className="space-y-3">
            <CheckboxField
              label="Resume Link"
              name="includeResumeLink"
              checked={formData.includeResumeLink}
              onChange={onFormChange}
              description="Include resume link in the email"
            />
            <CheckboxField
              label="Job ID"
              name="includeJobId"
              checked={formData.includeJobId}
              onChange={onFormChange}
              description="Include job ID in the email"
            />
            <CheckboxField
              label="Job Link"
              name="includeJobLink"
              checked={formData.includeJobLink}
              onChange={onFormChange}
              description="Include job application link in the email"
            />
            <CheckboxField
              label="Email ID"
              name="includeEmailId"
              checked={formData.includeEmailId}
              onChange={onFormChange}
              description={`Include email: ${formData.emailId}`}
            />
            <CheckboxField
              label="Contact"
              name="includeContact"
              checked={formData.includeContact}
              onChange={onFormChange}
              description={`Include contact: ${formData.contact}`}
            />
            <CheckboxField
              label="Projects"
              name="includeProjects"
              checked={formData.includeProjects}
              onChange={onFormChange}
              description="Reference projects in the email (CogniVue, LT-Companion, Smart Rental Tracker)"
            />
            <CheckboxField
              label="Experience"
              name="includeExperience"
              checked={formData.includeExperience}
              onChange={onFormChange}
              description="Reference work experience in the email (Bharat Electronics internship)"
            />
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-700 space-y-2">
          <InputField 
            label="Email ID (for reference)"
            name="emailId"
            value={formData.emailId}
            onChange={onFormChange}
            placeholder="your.email@example.com"
            type="email"
          />
          <InputField 
            label="Contact (for reference)"
            name="contact"
            value={formData.contact}
            onChange={onFormChange}
            placeholder="Your contact number"
            type="tel"
          />
        </div>

        <button
          onClick={onGenerateClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-2.5 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? (
            <>
              <LoadingIcon className="w-5 h-5 animate-spin"/>
              Crafting...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5"/>
              Generate Referral Email
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReferralForm;
