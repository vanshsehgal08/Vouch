
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-3">
        <SparklesIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Bhai Referral Dedo Plzzz 💀
        </h1>
      </div>
      <p className="mt-3 text-lg text-slate-400">
        Because 'hey bro can u refer me?' deserves an upgrade.
      </p>
    </header>
  );
};

export default Header;
