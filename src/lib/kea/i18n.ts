'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type KeaLocale = 'en' | 'bg' | 'es';

interface LangState {
  locale: KeaLocale;
  setLocale: (locale: KeaLocale) => void;
}

export const useKeaLang = create<LangState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'kea-lang' }
  )
);

// Flag emoji + label for the language toggle
export const localeConfig: Record<KeaLocale, { flag: string; label: string; short: string }> = {
  en: { flag: '🇬🇧', label: 'English', short: 'EN' },
  bg: { flag: '🇧🇬', label: 'Bulgarian', short: 'BG' },
  es: { flag: '🇪🇸', label: 'Spanish', short: 'ES' },
};

// ---------- translation dictionary ----------

const translations = {
  // ── Header / Nav ──
  'nav.dashboard': { en: 'Dashboard', bg: 'Табло', es: 'Panel' },
  'nav.chat': { en: 'Chat', bg: 'Чат', es: 'Chat' },
  'nav.clients': { en: 'Clients', bg: 'Клиенти', es: 'Clientes' },
  'nav.schemas': { en: 'Schemas', bg: 'Схеми', es: 'Esquemas' },
  'nav.monitor': { en: 'Monitor', bg: 'Монитор', es: 'Monitor' },
  'nav.export': { en: 'Export', bg: 'Експорт', es: 'Exportar' },
  'nav.alerts': { en: 'Alerts', bg: 'Сигнали', es: 'Alertas' },
  'nav.users': { en: 'Users', bg: 'Потребители', es: 'Usuarios' },
  'nav.settings': { en: 'Settings', bg: 'Настройки', es: 'Ajustes' },
  'nav.home': { en: 'Home', bg: 'Начало', es: 'Inicio' },
  'nav.section.main': { en: 'Main', bg: 'Основни', es: 'Principal' },
  'nav.section.data': { en: 'Data', bg: 'Данни', es: 'Datos' },
  'nav.section.manage': { en: 'Manage', bg: 'Управление', es: 'Gestionar' },
  'nav.signout': { en: 'Sign out', bg: 'Изход', es: 'Cerrar sesion' },

  // ── Dashboard ──
  'dash.greeting.morning': { en: 'Good morning', bg: 'Добро утро', es: 'Buenos dias' },
  'dash.greeting.afternoon': { en: 'Good afternoon', bg: 'Добър ден', es: 'Buenas tardes' },
  'dash.greeting.evening': { en: 'Good evening', bg: 'Добър вечер', es: 'Buenas noches' },
  'dash.startSession': { en: 'Start Session', bg: 'Нова сесия', es: 'Iniciar sesion' },
  'dash.keTitle': { en: 'KEA Knowledge Extraction', bg: 'KEA Извличане на знания', es: 'KEA Extraccion de conocimiento' },
  'dash.startChat': { en: 'Start Chat', bg: 'Нов чат', es: 'Iniciar chat' },
  'dash.startChat.desc': { en: 'Begin extraction session', bg: 'Започни сесия', es: 'Iniciar sesion de extraccion' },
  'dash.schemas': { en: 'Schemas', bg: 'Схеми', es: 'Esquemas' },
  'dash.schemas.desc': { en: 'Create & manage templates', bg: 'Създай и управлявай шаблони', es: 'Crear y gestionar plantillas' },
  'dash.monitor': { en: 'Monitor', bg: 'Монитор', es: 'Monitor' },
  'dash.monitor.desc': { en: 'Live session tracking', bg: 'Проследяване на живо', es: 'Seguimiento en vivo' },
  'dash.export': { en: 'Export', bg: 'Експорт', es: 'Exportar' },
  'dash.export.desc': { en: 'Download & deploy data', bg: 'Изтегли и разгърни данни', es: 'Descargar y desplegar datos' },
  'dash.users': { en: 'Users', bg: 'Потребители', es: 'Usuarios' },
  'dash.users.desc': { en: 'Manage team members', bg: 'Управлявай екипа', es: 'Gestionar equipo' },
  'dash.alerts': { en: 'Alerts', bg: 'Сигнали', es: 'Alertas' },
  'dash.alerts.desc': { en: 'Review contradictions', bg: 'Преглед на противоречия', es: 'Revisar contradicciones' },
  'dash.globalProgress': { en: 'Global Progress', bg: 'Общ напредък', es: 'Progreso global' },
  'dash.dataPoints': { en: 'Data Points', bg: 'Данни', es: 'Datos' },
  'dash.sessions': { en: 'Sessions', bg: 'Сесии', es: 'Sesiones' },
  'dash.openAlerts': { en: 'Open Alerts', bg: 'Отворени сигнали', es: 'Alertas abiertas' },
  'dash.teamMembers': { en: 'Team Members', bg: 'Членове на екипа', es: 'Miembros del equipo' },
  'dash.extractionTracks': { en: 'Extraction Tracks', bg: 'Пътеки за извличане', es: 'Pistas de extraccion' },
  'dash.viewAll': { en: 'View all', bg: 'Виж всички', es: 'Ver todo' },
  'dash.noTracks': { en: 'No tracks yet', bg: 'Все още няма пътеки', es: 'Sin pistas aun' },
  'dash.noTracks.desc': { en: 'Create a template in Schemas to get started', bg: 'Създайте шаблон в Схеми, за да започнете', es: 'Crea una plantilla en Esquemas para empezar' },
  'dash.discoveryProgress': { en: 'Discovery Progress', bg: 'Напредък на откриване', es: 'Progreso de descubrimiento' },
  'dash.templates': { en: 'Templates', bg: 'Шаблони', es: 'Plantillas' },
  'dash.tracks': { en: 'Tracks', bg: 'Пътеки', es: 'Pistas' },
  'dash.recentActivity': { en: 'Recent Activity', bg: 'Последна активност', es: 'Actividad reciente' },
  'dash.noActivity': { en: 'No activity yet', bg: 'Все още няма активност', es: 'Sin actividad aun' },
  'dash.deployCentral': { en: 'Deploy to Central', bg: 'Разгърни в Централа', es: 'Desplegar a Central' },
  'dash.deployCentral.desc': { en: 'Push extracted data to Blackwolf CRM', bg: 'Изпрати данни към Blackwolf CRM', es: 'Enviar datos al CRM Blackwolf' },
  'dash.createTemplate': { en: 'Create Template', bg: 'Създай шаблон', es: 'Crear plantilla' },
  'dash.createTemplate.desc': { en: 'Design extraction schemas with AI', bg: 'Проектирай схеми за извличане с AI', es: 'Disena esquemas de extraccion con IA' },
  'dash.settings': { en: 'Settings', bg: 'Настройки', es: 'Ajustes' },
  'dash.settings.desc': { en: 'Organization & preferences', bg: 'Организация и предпочитания', es: 'Organizacion y preferencias' },

  // ── Chat ──
  'chat.selectTrack': { en: 'Select a track to start a new session', bg: 'Изберете пътека за нова сесия', es: 'Selecciona una pista para iniciar sesion' },
  'chat.previousSessions': { en: 'Previous Sessions', bg: 'Предишни сесии', es: 'Sesiones anteriores' },
  'chat.newSession': { en: 'New Session', bg: 'Нова сесия', es: 'Nueva sesion' },
  'chat.noSessions': { en: 'No sessions yet', bg: 'Все още няма сесии', es: 'Sin sesiones aun' },
  'chat.typeMessage': { en: 'Type your message...', bg: 'Напишете съобщение...', es: 'Escribe un mensaje...' },

  // ── Onboarding ──
  'onboarding.welcome.title': { en: 'Welcome to KEA', bg: 'Добре дошли в KEA', es: 'Bienvenido a KEA' },
  'onboarding.welcome.subtitle': { en: 'Your AI-powered knowledge extraction platform', bg: 'Вашата AI платформа за извличане на знания', es: 'Tu plataforma de extraccion de conocimiento con IA' },
  'onboarding.welcome.body': {
    en: 'KEA helps you systematically extract, organize, and validate business knowledge through intelligent conversations. Think of it as an AI consultant that knows exactly what questions to ask.',
    bg: 'KEA ви помага систематично да извличате, организирате и валидирате бизнес знания чрез интелигентни разговори. Мислете за него като AI консултант, който знае точно какви въпроси да задава.',
    es: 'KEA te ayuda a extraer, organizar y validar sistematicamente el conocimiento empresarial a traves de conversaciones inteligentes. Piensa en ello como un consultor de IA que sabe exactamente que preguntas hacer.',
  },
  'onboarding.chat.title': { en: 'Smart Conversations', bg: 'Интелигентни разговори', es: 'Conversaciones inteligentes' },
  'onboarding.chat.subtitle': { en: 'AI-guided extraction sessions', bg: 'AI-водени сесии за извличане', es: 'Sesiones de extraccion guiadas por IA' },
  'onboarding.chat.body': {
    en: 'Start a chat session and the AI will guide you through targeted questions about your business processes. Every answer is automatically extracted and structured into your knowledge base.',
    bg: 'Започнете чат сесия и AI ще ви води през целенасочени въпроси за вашите бизнес процеси. Всеки отговор автоматично се извлича и структурира в базата ви от знания.',
    es: 'Inicia una sesion de chat y la IA te guiara a traves de preguntas dirigidas sobre tus procesos empresariales. Cada respuesta se extrae y estructura automaticamente en tu base de conocimiento.',
  },
  'onboarding.tracks.title': { en: 'Tracks & Blocks', bg: 'Пътеки и блокове', es: 'Pistas y bloques' },
  'onboarding.tracks.subtitle': { en: 'Organized knowledge structure', bg: 'Организирана структура на знания', es: 'Estructura de conocimiento organizada' },
  'onboarding.tracks.body': {
    en: 'Your extraction template is divided into Tracks (major areas like Finance, Operations, HR) and Blocks (specific topics within each track). This ensures comprehensive coverage of all business areas.',
    bg: 'Вашият шаблон за извличане е разделен на Пътеки (основни области като Финанси, Операции, HR) и Блокове (конкретни теми във всяка пътека). Това осигурява цялостно покритие на всички бизнес области.',
    es: 'Tu plantilla de extraccion esta dividida en Pistas (areas principales como Finanzas, Operaciones, RRHH) y Bloques (temas especificos dentro de cada pista). Esto asegura una cobertura completa de todas las areas de negocio.',
  },
  'onboarding.progress.title': { en: 'Track Your Progress', bg: 'Проследявайте напредъка', es: 'Sigue tu progreso' },
  'onboarding.progress.subtitle': { en: 'Real-time completion tracking', bg: 'Проследяване в реално време', es: 'Seguimiento en tiempo real' },
  'onboarding.progress.body': {
    en: 'The dashboard shows your extraction progress across all tracks. See which areas are complete, which need attention, and get alerts when contradictions or gaps are detected.',
    bg: 'Таблото показва напредъка на извличане по всички пътеки. Вижте кои области са завършени, кои се нуждаят от внимание и получавайте сигнали при открити противоречия или пропуски.',
    es: 'El panel muestra tu progreso de extraccion en todas las pistas. Ve que areas estan completas, cuales necesitan atencion y recibe alertas cuando se detectan contradicciones o vacios.',
  },
  'onboarding.ready.title': { en: 'Ready to Begin', bg: 'Готови за начало', es: 'Listo para empezar' },
  'onboarding.ready.subtitle': { en: 'Start your first extraction session', bg: 'Започнете първата си сесия', es: 'Inicia tu primera sesion de extraccion' },
  'onboarding.ready.body': {
    en: 'Head to the Chat section and select a track to start your first AI-guided extraction session. The more you share, the better the system understands your business.',
    bg: 'Отидете в секция Чат и изберете пътека, за да започнете първата си AI-водена сесия. Колкото повече споделяте, толкова по-добре системата разбира вашия бизнес.',
    es: 'Ve a la seccion de Chat y selecciona una pista para iniciar tu primera sesion guiada por IA. Cuanto mas compartas, mejor entendera el sistema tu negocio.',
  },
  'onboarding.skip': { en: 'Skip', bg: 'Пропусни', es: 'Omitir' },
  'onboarding.next': { en: 'Next', bg: 'Напред', es: 'Siguiente' },
  'onboarding.back': { en: 'Back', bg: 'Назад', es: 'Atras' },
  'onboarding.getStarted': { en: 'Get Started', bg: 'Започни', es: 'Empezar' },

  // ── Login ──
  'login.welcomeBack': { en: 'Welcome back', bg: 'Добре дошли отново', es: 'Bienvenido de nuevo' },
  'login.signIn': { en: 'Sign in to KEA', bg: 'Влезте в KEA', es: 'Inicia sesion en KEA' },
  'login.email': { en: 'Email', bg: 'Имейл', es: 'Correo' },
  'login.password': { en: 'Password', bg: 'Парола', es: 'Contrasena' },
  'login.submit': { en: 'Sign In', bg: 'Влизане', es: 'Iniciar sesion' },
  'login.adminNote': { en: 'Users are created by the admin from the Clients panel.', bg: 'Потребителите се създават от администратора в панела Клиенти.', es: 'Los usuarios son creados por el administrador desde el panel de Clientes.' },

  // ── Loading ──
  'loading.redirecting': { en: 'Redirecting...', bg: 'Пренасочване...', es: 'Redirigiendo...' },
  'loading.app': { en: 'Loading KEA...', bg: 'Зареждане на KEA...', es: 'Cargando KEA...' },

  // ── Common ──
  'common.sessions': { en: 'sessions', bg: 'сесии', es: 'sesiones' },
  'common.blocks': { en: 'blocks', bg: 'блокове', es: 'bloques' },
  'common.open': { en: 'Open', bg: 'Отворен', es: 'Abierto' },
  'common.guided': { en: 'Guided', bg: 'Насочен', es: 'Guiado' },
  'common.dataExtracted': { en: 'Data extracted', bg: 'Извлечени данни', es: 'Datos extraidos' },
  'common.sessionCompleted': { en: 'Session completed', bg: 'Сесия завършена', es: 'Sesion completada' },
  'common.sessionStarted': { en: 'Session started', bg: 'Сесия започната', es: 'Sesion iniciada' },

  // ── Client Dashboard ──
  'client.yourProgress': { en: 'Your Progress', bg: 'Вашият напредък', es: 'Tu progreso' },
  'client.overallCompletion': { en: 'Overall Completion', bg: 'Общо завършване', es: 'Completado general' },
  'client.trackProgress': { en: 'Track Progress', bg: 'Напредък по пътеки', es: 'Progreso por pistas' },
  'client.continueSessions': { en: 'Your Sessions', bg: 'Вашите сесии', es: 'Tus sesiones' },
  'client.startNewSession': { en: 'Start New Session', bg: 'Започни нова сесия', es: 'Iniciar nueva sesion' },
  'client.continue': { en: 'Continue', bg: 'Продължи', es: 'Continuar' },
  'client.start': { en: 'Start', bg: 'Започни', es: 'Empezar' },
  'client.noTracksAssigned': { en: 'No tracks have been assigned yet. Contact your admin.', bg: 'Все още няма зададени пътеки. Свържете се с администратора.', es: 'Aun no se han asignado pistas. Contacta con tu administrador.' },
  'client.fields': { en: 'fields', bg: 'полета', es: 'campos' },
  'client.completed': { en: 'completed', bg: 'завършено', es: 'completado' },
  'client.noSessions': { en: 'No sessions yet — start chatting to begin extraction', bg: 'Все още няма сесии — започнете чат, за да започне извличането', es: 'Sin sesiones aun — inicia un chat para comenzar la extraccion' },
  'client.active': { en: 'Active', bg: 'Активна', es: 'Activa' },
  'client.paused': { en: 'Paused', bg: 'На пауза', es: 'Pausada' },
  'client.remaining': { en: 'Remaining', bg: 'Остават', es: 'Restantes' },
  'client.estimated': { en: 'Estimated', bg: 'Очаквано', es: 'Estimado' },
} as const;

export type TranslationKey = keyof typeof translations;

/** Get a translated string for the given key and locale */
export function t(key: TranslationKey, locale: KeaLocale = 'en'): string {
  const entry = translations[key];
  return entry?.[locale] ?? entry?.en ?? key;
}

/** React hook — returns a bound t() that uses the current locale */
export function useT() {
  const locale = useKeaLang((s) => s.locale);
  return (key: TranslationKey) => t(key, locale);
}
