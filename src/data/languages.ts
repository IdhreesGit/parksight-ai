export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  isIndian?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  // Major Indian Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳', dir: 'rtl', isIndian: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', dir: 'ltr', isIndian: true },
  // Global Languages
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
];
