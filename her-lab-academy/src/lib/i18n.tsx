'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'sw';

const translations = {
  en: {
    dashboard: 'My Dashboard',
    courses: 'Courses',
    results: 'Results',
    certificates: 'Certificates',
    complaints: 'Complaints',
    profile: 'Profile',
    signOut: 'Sign out',
    welcome: 'Welcome back',
    progress: 'Progress',
    completed: 'Completed',
    inProgress: 'In Progress',
    noCoursesYet: 'No courses enrolled yet.',
    notices: 'Notices',
    help: 'Help',
    loading: 'Loading...',
    back: 'Back',
    submit: 'Submit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    read: 'Read',
    watch: 'Watch',
    download: 'Download',
    open: 'Open',
    langToggle: 'Kiswahili',
  },
  sw: {
    dashboard: 'Dashibodi Yangu',
    courses: 'Kozi',
    results: 'Matokeo',
    certificates: 'Vyeti',
    complaints: 'Malalamiko',
    profile: 'Wasifu',
    signOut: 'Toka',
    welcome: 'Karibu tena',
    progress: 'Maendeleo',
    completed: 'Imekamilika',
    inProgress: 'Inaendelea',
    noCoursesYet: 'Bado hujajisajili katika kozi yoyote.',
    notices: 'Matangazo',
    help: 'Msaada',
    loading: 'Inapakia...',
    back: 'Rudi',
    submit: 'Wasilisha',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    delete: 'Futa',
    read: 'Soma',
    watch: 'Tazama',
    download: 'Pakua',
    open: 'Fungua',
    langToggle: 'English',
  },
};

export type TranslationKeys = keyof typeof translations.en;

const LangContext = createContext<{
  lang: Lang;
  t: (key: TranslationKeys) => string;
  toggle: () => void;
}>({
  lang: 'en',
  t: (k) => translations.en[k],
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = (key: TranslationKeys) => translations[lang][key] ?? translations.en[key];
  const toggle = () => setLang((l) => (l === 'en' ? 'sw' : 'en'));
  return <LangContext.Provider value={{ lang, t, toggle }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
