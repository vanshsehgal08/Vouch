import React, { useState, useEffect } from 'react';
import { User, Save, AlertCircle } from 'lucide-react';
import { useNotification } from './Notification';

export interface UserProfile {
  name: string;
  degree: string;
  graduationYear: string;
  university: string;
  cgpa: string;
  resumeLink: string;
  emailId: string;
  contact: string;
  website: string;
  experience: string;
  projects: string;
}

interface ProfileViewProps {
  onProfileSaved?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onProfileSaved }) => {
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    degree: '',
    graduationYear: '',
    university: '',
    cgpa: '',
    resumeLink: '',
    emailId: '',
    contact: '',
    website: '',
    experience: '',
    projects: '',
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('user_profile', JSON.stringify(profile));
      showSuccess('Saved Successfully!');
      onProfileSaved?.();
    } catch (error) {
      console.error('Failed to save profile:', error);
      showError('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-light rounded-lg p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-black">
          <div className="w-14 h-14 rounded-lg bg-black flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">
              Your Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Save your information to auto-fill referral emails
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Personal Information Section */}
          <div>
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2 pb-2 border-b border-gray-300">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="space-y-4 mt-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Full Name <span className="text-gray-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="e.g., Vansh Sehgal"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
              </div>

              {/* Education Fields in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Degree <span className="text-gray-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={profile.degree}
                    onChange={handleChange}
                    placeholder="e.g., B.Tech CSE"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Graduation Year <span className="text-gray-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="graduationYear"
                    value={profile.graduationYear}
                    onChange={handleChange}
                    placeholder="e.g., 2026"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    University <span className="text-gray-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={profile.university}
                    onChange={handleChange}
                    placeholder="e.g., VIT Vellore"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    CGPA <span className="text-gray-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="cgpa"
                    value={profile.cgpa}
                    onChange={handleChange}
                    placeholder="e.g., 9.06"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div>
            <h2 className="text-lg font-bold text-black mb-4 pb-2 border-b border-gray-300">Contact Information</h2>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Resume Link <span className="text-gray-400">*</span>
                </label>
                <input
                  type="url"
                  name="resumeLink"
                  value={profile.resumeLink}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Email Address <span className="text-gray-400">*</span>
                </label>
                <input
                  type="email"
                  name="emailId"
                  value={profile.emailId}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Contact Number <span className="text-gray-400">*</span>
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={profile.contact}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Website <span className="text-gray-500 text-xs font-normal">(Optional - added to signature)</span>
                </label>
                <input
                  type="url"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  placeholder="https://www.yourwebsite.com"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <h2 className="text-lg font-bold text-black mb-4 pb-2 border-b border-gray-300">Additional Information</h2>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Experience Summary
                  <span className="text-gray-500 ml-2 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  rows={5}
                  placeholder="e.g., 3+ years of experience in full-stack development..."
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Projects Summary
                  <span className="text-gray-500 ml-2 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  name="projects"
                  value={profile.projects}
                  onChange={handleChange}
                  rows={5}
                  placeholder="e.g., Built an e-commerce platform handling 10k+ daily users..."
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none custom-scrollbar"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t-2 border-gray-200">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-gray-100 border-2 border-gray-300 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-bold text-black mb-1">How it works</p>
              <p>
                Your profile information is stored locally in your browser. When generating referral emails,
                the form will automatically use these values as defaults.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
