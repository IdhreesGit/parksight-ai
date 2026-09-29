import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, Search, ChevronDown, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'header' | 'sidebar' | 'inline';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'header' }) => {
  const { currentLanguage, language, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'indian'>('indian');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredLanguages = languages.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (searchQuery.trim().length > 0) return true;
    if (activeTab === 'indian') return !!l.isIndian;
    return true;
  });

  const handleSelect = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const indianLanguages = languages.filter((l) => l.isIndian);

  if (variant === 'sidebar') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="font-medium">{language.nativeName}</span>
            <span className="text-[11px] text-slate-500 font-mono">({language.code.toUpperCase()})</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs transition-all shadow-sm"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-sm leading-none">{language.flag}</span>
        <span className="font-semibold font-mono uppercase text-[11px] hidden sm:inline">
          {language.code}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[95vw] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {t('header.selectLanguage', 'Language')}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex rounded-lg bg-slate-950 p-1 mb-2 text-xs border border-slate-800">
            <button
              onClick={() => setActiveTab('indian')}
              className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
                activeTab === 'indian'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Indian ({indianLanguages.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
                activeTab === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({languages.length})
            </button>
          </div>

          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {filteredLanguages.map((l) => {
              const isSelected = l.code === currentLanguage;
              return (
                <button
                  key={l.code}
                  onClick={() => handleSelect(l.code)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{l.flag}</span>
                    <span className="text-white font-medium">{l.nativeName}</span>
                    <span className="text-[10px] text-slate-400">({l.name})</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
