"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";

export type Lang = "en" | "bg";

const LangContext = createContext<Lang>("en");

export function useLang(): Lang {
  return useContext(LangContext);
}

export function LangFromPath({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lang: Lang = pathname.startsWith("/bg") ? "bg" : "en";
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Prefix a path with /bg when on Bulgarian locale */
export function localePath(path: string, lang: Lang): string {
  if (lang === "bg") {
    return path === "/" ? "/bg" : `/bg${path}`;
  }
  return path;
}

/* ────────────────────────────────────────────
   TRANSLATIONS — keyed by component/section
   ──────────────────────────────────────────── */

export const translations = {
  nav: {
    en: {
      home: "Home",
      services: "Services",
      showcase: "Showcase",
      about: "About",
      contact: "Contact",
      bookCall: "Book a Call",
    },
    bg: {
      home: "Начало",
      services: "Услуги",
      showcase: "Портфолио",
      about: "За нас",
      contact: "Контакт",
      bookCall: "Запази среща",
    },
  },
  hero: {
    en: {
      badge: "All-in-One Digital Infrastructure",
      title: "We build the operating system your factory needs",
      subtitle: "Stop running your factory on spreadsheets and gut instinct. One integrated system — operations, security, intelligence — deployed in 5 weeks.",
      cta1: "Explore Our Services",
      cta2: "Book a Call",
    },
    bg: {
      badge: "Цялостна дигитална инфраструктура",
      title: "Изграждаме операционната система, от която вашата фабрика се нуждае",
      subtitle: "Спрете да управлявате фабриката си с таблици и интуиция. Една интегрирана система — операции, сигурност, интелигентност — внедрена за 5 седмици.",
      cta1: "Разгледай услугите",
      cta2: "Запази среща",
    },
  },
  logoCloud: {
    en: { trusted: "TRUSTED BY" },
    bg: { trusted: "НИ СЕ ДОВЕРЯВАТ" },
  },
  roi: {
    en: {
      tag: "THE HIDDEN COST",
      title: "What inaction is really costing you",
      subtitle: "Every month without a system, your business bleeds money you can\u2019t see.",
      withoutTitle: "WITHOUT A SYSTEM",
      withTitle: "WITH BLACKWOLF",
      costs: [
        { label: "4-5 unnecessary employees", value: "€8,000 — €15,000/mo" },
        { label: "Lost deals from zero follow-up", value: "10-20% revenue" },
        { label: "CEO trapped in daily operations", value: "Priceless" },
        { label: "Manual errors & duplicate data", value: "Constant" },
        { label: "Cyber risk without protection", value: "€50K — €500K per incident" },
      ],
      gains: [
        { label: "Full visibility into every metric", value: "Real-time" },
        { label: "Operational cost reduction", value: "Up to 30%" },
        { label: "Revenue increase from optimization", value: "+10-20%" },
        { label: "CEO free to work ON the business", value: "Unlocked" },
        { label: "AI-powered security monitoring", value: "24/7" },
      ],
      monthlyLoss: "ESTIMATED MONTHLY LOSS",
      monthlyLossValue: "€15,000 — €40,000",
      deployedIn: "DEPLOYED IN",
      deployedInValue: "5 weeks",
      bottomText: "Every month without a system is",
      bottomHighlight: "€15K — €40K in losses",
      bottomCta: "Stop the Bleeding — Book a Call",
    },
    bg: {
      tag: "СКРИТИТЕ РАЗХОДИ",
      title: "Какво наистина ви струва бездействието",
      subtitle: "Всеки месец без система, бизнесът ви губи пари, които не виждате.",
      withoutTitle: "БЕЗ СИСТЕМА",
      withTitle: "С BLACKWOLF",
      costs: [
        { label: "4-5 излишни служители", value: "€8,000 — €15,000/мес." },
        { label: "Загубени сделки от нулево проследяване", value: "10-20% приходи" },
        { label: "CEO затънал в ежедневни операции", value: "Безценно" },
        { label: "Ръчни грешки и дублирани данни", value: "Постоянно" },
        { label: "Кибер риск без защита", value: "€50K — €500K на инцидент" },
      ],
      gains: [
        { label: "Пълна видимост на всяка метрика", value: "В реално време" },
        { label: "Намаляване на оперативните разходи", value: "До 30%" },
        { label: "Увеличение на приходите от оптимизация", value: "+10-20%" },
        { label: "CEO свободен да работи ЗА бизнеса", value: "Отключено" },
        { label: "AI мониторинг на сигурността", value: "24/7" },
      ],
      monthlyLoss: "ПРОГНОЗНА МЕСЕЧНА ЗАГУБА",
      monthlyLossValue: "€15,000 — €40,000",
      deployedIn: "ВНЕДРЕНО ЗА",
      deployedInValue: "5 седмици",
      bottomText: "Всеки месец без система е",
      bottomHighlight: "€15K — €40K загуби",
      bottomCta: "Спри загубите — Запази среща",
    },
  },
  whatWeDo: {
    en: {
      title: "What We Do",
      subtitle: "Three pillars of digital transformation for manufacturing",
      services: [
        { title: "Unified Business System", description: "CRM, ERP, and BI dashboard in one platform. Real-time visibility into every aspect of your operations." },
        { title: "Cybersecurity & Defense", description: "24/7 AI-powered threat monitoring, automated blocking, and SOC dashboard. Enterprise-grade protection." },
        { title: "AI & Automation", description: "Custom AI agents that automate repetitive tasks, analyze data, and support decision-making in real time." },
      ],
    },
    bg: {
      title: "Какво правим",
      subtitle: "Три стълба на дигиталната трансформация за производството",
      services: [
        { title: "Единна бизнес система", description: "CRM, ERP и BI табло в една платформа. Видимост в реално време на всеки аспект от операциите ви." },
        { title: "Киберсигурност и защита", description: "24/7 AI мониторинг на заплахи, автоматично блокиране и SOC табло. Защита от корпоративен клас." },
        { title: "AI и автоматизация", description: "Персонализирани AI агенти, които автоматизират повтарящи се задачи, анализират данни и подпомагат вземането на решения." },
      ],
    },
  },
  timeline: {
    en: {
      title: "How It Works",
      subtitle: "From chaos to control in 5 weeks",
      steps: [
        { week: "WEEK 1", label: "Discovery", desc: "Audit your current operations and identify key bottlenecks" },
        { week: "WEEK 2", label: "Architecture", desc: "Custom system design tailored to your workflows" },
        { week: "WEEK 3", label: "Build", desc: "Development and configuration of your infrastructure" },
        { week: "WEEK 4", label: "Deploy", desc: "Implementation, data migration, and team onboarding" },
        { week: "WEEK 5", label: "Optimize", desc: "Monitoring, AI tuning, and performance optimization" },
      ],
    },
    bg: {
      title: "Как работи",
      subtitle: "От хаос до контрол за 5 седмици",
      steps: [
        { week: "СЕДМИЦА 1", label: "Анализ", desc: "Одит на текущите операции и идентифициране на ключови проблеми" },
        { week: "СЕДМИЦА 2", label: "Архитектура", desc: "Персонализиран дизайн на системата, съобразен с вашите процеси" },
        { week: "СЕДМИЦА 3", label: "Изграждане", desc: "Разработка и конфигурация на инфраструктурата" },
        { week: "СЕДМИЦА 4", label: "Внедряване", desc: "Имплементация, миграция на данни и обучение на екипа" },
        { week: "СЕДМИЦА 5", label: "Оптимизация", desc: "Мониторинг, AI настройка и оптимизация на производителността" },
      ],
    },
  },
  stats: {
    en: [
      { value: 5, suffix: "", label: "Weeks to Deploy" },
      { value: 0, suffix: "", label: "Security Monitoring", display: "24/7" },
      { value: 80, suffix: "%", label: "Operational Efficiency Gain", prefix: ">" },
      { value: 3, suffix: "", label: "Core Systems in One" },
    ],
    bg: [
      { value: 5, suffix: "", label: "Седмици за внедряване" },
      { value: 0, suffix: "", label: "Мониторинг на сигурността", display: "24/7" },
      { value: 80, suffix: "%", label: "Ръст в оперативната ефективност", prefix: ">" },
      { value: 3, suffix: "", label: "Основни системи в една" },
    ],
  },
  footer: {
    en: {
      description: "Digital infrastructure for manufacturing companies across Europe.",
      company: "Company",
      getInTouch: "Get in Touch",
      bookCall: "Book a Call",
      copyright: "© 2026 BlackWolf. All rights reserved.",
      tagline: "Made with precision.",
    },
    bg: {
      description: "Дигитална инфраструктура за производствени компании в Европа.",
      company: "Компания",
      getInTouch: "Свържете се",
      bookCall: "Запази среща",
      copyright: "© 2026 BlackWolf. Всички права запазени.",
      tagline: "Създадено с прецизност.",
    },
  },
  aboutStory: {
    en: {
      title: "Our Story",
      p1: "Manufacturing is the backbone of the European economy. Yet most factories still run on spreadsheets, disconnected tools, and gut feeling.",
      p2: "We saw an opportunity: build a complete, integrated digital system — operations, security, and intelligence — and deliver it in weeks, not months.",
      p3: "That\u2019s BlackWolf. One team. One system. One mission:",
      p3highlight: "eliminate operational chaos.",
      stats: [
        { value: "5 weeks", label: "Average deployment" },
        { value: "3-30M", label: "Client revenue (EUR)" },
        { value: "20-200", label: "Client employee range" },
        { value: "Europe", label: "Our market" },
      ],
    },
    bg: {
      title: "Нашата история",
      p1: "Производството е гръбнакът на европейската икономика. Но повечето фабрики все още работят с таблици, несвързани инструменти и интуиция.",
      p2: "Видяхме възможност: да изградим пълна, интегрирана дигитална система — операции, сигурност и интелигентност — и да я доставим за седмици, не за месеци.",
      p3: "Това е BlackWolf. Един екип. Една система. Една мисия:",
      p3highlight: "елиминиране на оперативния хаос.",
      stats: [
        { value: "5 седмици", label: "Средно внедряване" },
        { value: "3-30M", label: "Приходи на клиентите (EUR)" },
        { value: "20-200", label: "Служители на клиентите" },
        { value: "Европа", label: "Нашият пазар" },
      ],
    },
  },
  team: {
    en: {
      title: "The Team",
      subtitle: "World-class talent building infrastructure for manufacturing",
      leadership: [
        {
          name: "Alex Gutiérrez",
          role: "Chief Executive Officer",
          description: "Leads BlackWolf's vision and growth strategy. Specialized in operational optimization, business intelligence, and scaling manufacturing businesses across European markets.",
          credentials: ["Business Intelligence", "Operations Optimization", "Business Development", "Strategic Growth"],
        },
        {
          name: "Alejandro Silvestre",
          role: "Chief Technology Officer",
          description: "Architects BlackWolf's technical infrastructure. Deep expertise in cybersecurity, application development, and building secure, scalable systems for industrial environments.",
          credentials: ["Cybersecurity", "App Development", "System Architecture", "Full-Stack Engineering"],
        },
        {
          name: "Zlatina Valcheva",
          role: "Head of Business Development",
          description: "Drives client acquisition and international expansion. Connects European manufacturers with the right digital infrastructure for their growth stage.",
          credentials: ["International Business", "Client Acquisition", "EU Markets", "Strategic Partnerships"],
        },
      ],
      engTitle: "Engineering Team",
      engDesc: "Behind our leadership, a team of world-class developers and engineers who have built systems for some of the most demanding organizations on the planet. The same standards now power your factory.",
      techCreds: ["NASA mission-critical systems", "Instagram-scale infrastructure", "Uber Eats real-time operations"],
    },
    bg: {
      title: "Екипът",
      subtitle: "Световен клас таланти, изграждащи инфраструктура за производството",
      leadership: [
        {
          name: "Alex Gutiérrez",
          role: "Изпълнителен директор",
          description: "Ръководи визията и стратегията за растеж на BlackWolf. Специализиран в оптимизация на операциите, бизнес интелигентност и мащабиране на производствени бизнеси на европейските пазари.",
          credentials: ["Бизнес интелигентност", "Оптимизация на операции", "Бизнес развитие", "Стратегически растеж"],
        },
        {
          name: "Alejandro Silvestre",
          role: "Технически директор",
          description: "Архитект на техническата инфраструктура на BlackWolf. Дълбока експертиза в киберсигурност, разработка на приложения и изграждане на сигурни, мащабируеми системи за индустриални среди.",
          credentials: ["Киберсигурност", "Разработка на приложения", "Системна архитектура", "Full-Stack инженерство"],
        },
        {
          name: "Zlatina Valcheva",
          role: "Ръководител бизнес развитие",
          description: "Управлява привличането на клиенти и международната експанзия. Свързва европейските производители с правилната дигитална инфраструктура за техния етап на растеж.",
          credentials: ["Международен бизнес", "Привличане на клиенти", "Пазари в ЕС", "Стратегически партньорства"],
        },
      ],
      engTitle: "Инженерен екип",
      engDesc: "Зад нашето ръководство стои екип от разработчици и инженери от световна класа, изградили системи за едни от най-взискателните организации на планетата. Същите стандарти сега задвижват вашата фабрика.",
      techCreds: ["Критични системи за NASA", "Инфраструктура за Instagram", "Операции в реално време за Uber Eats"],
    },
  },
  whyBw: {
    en: {
      title: "Why BlackWolf",
      subtitle: "What sets us apart",
      reasons: [
        { title: "All-in-One", description: "Unlike consultancies that deliver pieces, we deliver the complete system. CRM, ERP, BI, security, AI — fully integrated from day one." },
        { title: "Speed", description: "5 weeks from kickoff to launch. Traditional consultancies take 6-12 months. We move at startup speed with enterprise quality." },
        { title: "Built for Manufacturing", description: "Every feature, every workflow, every dashboard is designed specifically for manufacturing operations. No generic SaaS adapted with workarounds." },
        { title: "AI-Native", description: "AI isn\u2019t an add-on. It\u2019s built into the core: threat detection, process automation, data analysis, and decision support." },
      ],
    },
    bg: {
      title: "Защо BlackWolf",
      subtitle: "Какво ни отличава",
      reasons: [
        { title: "Всичко в едно", description: "За разлика от консултантите, които доставят парчета, ние доставяме пълната система. CRM, ERP, BI, сигурност, AI — напълно интегрирани от първия ден." },
        { title: "Скорост", description: "5 седмици от старт до пускане. Традиционните консултанти отнемат 6-12 месеца. Движим се със скоростта на стартъп с корпоративно качество." },
        { title: "Създадено за производство", description: "Всяка функция, всеки процес, всяко табло е проектирано специално за производствени операции. Без адаптиран SaaS с компромиси." },
        { title: "AI в основата", description: "AI не е добавка. Вграден е в ядрото: детекция на заплахи, автоматизация на процеси, анализ на данни и подпомагане на решения." },
      ],
    },
  },
  bento: {
    en: {
      title: "The All-in-One System",
      subtitle: "Everything your business needs — fully integrated from day one",
      columns: [
        { title: "Business Dashboard & BI", features: ["Real-time KPI Monitoring", "Revenue & P&L Analytics", "Sales Performance Tracking", "Custom Report Builder", "Team Leaderboards", "Operational Metrics"] },
        { title: "CRM & Sales", features: ["Lead Tracking & Pipeline", "Automated Follow-ups", "Client Communication Log", "Order Management", "Sales Automation", "Contact Database"] },
        { title: "ERP & Operations", features: ["Inventory Management", "Procurement & Purchasing", "Production Planning", "Parametric Engine", "HR & Team Management", "Workflow Automation"] },
        { title: "Cybersecurity & SOC", features: ["24/7 Threat Monitoring", "AI-Powered Detection", "Incident Response", "Network Security", "Access Control", "Security Analytics"] },
        { title: "AI Agents & Automation", features: ["Custom AI Agents", "Data Entry Automation", "Report Generation", "Trend Analysis", "Decision Support", "Process Automation"] },
      ],
    },
    bg: {
      title: "Системата всичко-в-едно",
      subtitle: "Всичко, от което бизнесът ви се нуждае — напълно интегрирано от първия ден",
      columns: [
        { title: "Бизнес табло & BI", features: ["Мониторинг на KPI в реално време", "Анализ на приходи и P&L", "Проследяване на продажби", "Персонализирани отчети", "Екипни класации", "Оперативни метрики"] },
        { title: "CRM & Продажби", features: ["Проследяване на лидове", "Автоматизирани последващи действия", "Лог на комуникации", "Управление на поръчки", "Автоматизация на продажби", "База данни с контакти"] },
        { title: "ERP & Операции", features: ["Управление на инвентар", "Доставки и закупуване", "Планиране на производство", "Параметричен двигател", "HR & Управление на екипа", "Автоматизация на процеси"] },
        { title: "Киберсигурност & SOC", features: ["24/7 Мониторинг на заплахи", "AI детекция", "Реагиране на инциденти", "Мрежова сигурност", "Контрол на достъпа", "Анализ на сигурността"] },
        { title: "AI Агенти & Автоматизация", features: ["Персонализирани AI агенти", "Автоматизация на данни", "Генериране на отчети", "Анализ на тенденции", "Подпомагане на решения", "Автоматизация на процеси"] },
      ],
    },
  },
  pricing: {
    en: {
      title: "Roadmap",
      subtitle: "Choose the plan that fits your growth stage",
      bookCall: "Book a Call",
      mostPopular: "Most Popular",
      plans: [
        { name: "Essentials", description: "For companies starting their digital transformation", features: ["All-in-One platform access", "BI Dashboard with core KPIs", "Basic CRM & ERP modules", "Cybersecurity monitoring", "Email support", "5-week implementation"] },
        { name: "Growth", description: "For companies ready to scale with AI", features: ["Everything in Essentials", "Advanced BI with custom reports", "Full CRM, ERP & HR modules", "AI-powered security with SOC", "Custom AI agents (up to 3)", "Priority support", "Dedicated account manager"] },
        { name: "Enterprise", description: "For large operations with specific requirements", features: ["Everything in Growth", "Unlimited AI agents", "Custom integrations", "Multi-site deployment", "On-site training", "SLA guarantee", "24/7 dedicated support"] },
        { name: "Програми за дигитализация", description: "Government-funded digital transformation for SMEs in Spain & Bulgaria", features: ["Custom ERP systems", "CRM & sales automation", "Website & eCommerce stores", "Business Intelligence dashboards", "Process automation & AI", "Full compliance & reporting", "We handle all the paperwork"], badge: "🇪🇸 🇧🇬 Gov. Subsidized" },
      ],
    },
    bg: {
      title: "Пътна карта",
      subtitle: "Изберете плана, подходящ за вашия етап на растеж",
      bookCall: "Запази среща",
      mostPopular: "Най-популярен",
      plans: [
        { name: "Основен", description: "За компании, започващи дигитална трансформация", features: ["Достъп до платформата всичко-в-едно", "BI табло с основни KPI", "Базови CRM & ERP модули", "Мониторинг на киберсигурността", "Имейл поддръжка", "Внедряване за 5 седмици"] },
        { name: "Растеж", description: "За компании, готови да мащабират с AI", features: ["Всичко от Основен", "Разширен BI с персонализирани отчети", "Пълни CRM, ERP & HR модули", "AI сигурност със SOC", "Персонализирани AI агенти (до 3)", "Приоритетна поддръжка", "Персонален мениджър"] },
        { name: "Корпоративен", description: "За големи операции със специфични изисквания", features: ["Всичко от Растеж", "Неограничени AI агенти", "Персонализирани интеграции", "Внедряване на множество обекти", "Обучение на място", "SLA гаранция", "24/7 специализирана поддръжка"] },
        { name: "Програми за дигитализация", description: "Държавно финансирана дигитална трансформация за МСП в Испания и България", features: ["Персонализирани ERP системи", "CRM & автоматизация на продажби", "Уебсайтове & електронни магазини", "Табла за бизнес интелигентност", "Автоматизация на процеси & AI", "Пълно съответствие & отчетност", "Ние се грижим за документацията"], badge: "🇪🇸 🇧🇬 Държавно субсидирано" },
      ],
    },
  },
  contact: {
    en: {
      sendTitle: "Send us a message",
      sendSubtitle: "Fill out the form and we\u2019ll get back to you within 24 hours.",
      fullName: "Full Name",
      companyName: "Company Name",
      email: "Email",
      phone: "Phone (optional)",
      companySize: "Company Size",
      annualRevenue: "Annual Revenue",
      tellUs: "Tell us about your business...",
      sendMessage: "Send Message",
      messageSent: "Message Sent!",
      thankYou: "Thank you for reaching out. We\u2019ll get back to you within 24 hours.",
      sendAnother: "Send Another Message",
      privacy: "We respect your privacy. Your information will never be shared.",
      scheduleTitle: "Schedule a consultation",
      scheduleSubtitle: "Prefer to talk directly? Book a 30-minute call with our team.",
      reachUs: "Or reach us directly:",
      basedIn: "Based in Europe — serving manufacturers across the continent.",
      required: "Required",
      invalidEmail: "Invalid email",
      employees: "employees",
      under: "Under",
      stats: [
        { label: "Response Time", value: "< 2h" },
        { label: "Markets", value: "EU" },
        { label: "Security", value: "SOC 2" },
        { label: "Uptime", value: "99.9%" },
      ],
    },
    bg: {
      sendTitle: "Изпратете ни съобщение",
      sendSubtitle: "Попълнете формата и ще ви отговорим в рамките на 24 часа.",
      fullName: "Пълно име",
      companyName: "Име на компанията",
      email: "Имейл",
      phone: "Телефон (по избор)",
      companySize: "Размер на компанията",
      annualRevenue: "Годишни приходи",
      tellUs: "Разкажете ни за вашия бизнес...",
      sendMessage: "Изпрати съобщение",
      messageSent: "Съобщението е изпратено!",
      thankYou: "Благодарим ви за обаждането. Ще ви отговорим в рамките на 24 часа.",
      sendAnother: "Изпрати ново съобщение",
      privacy: "Уважаваме вашата поверителност. Вашата информация никога няма да бъде споделяна.",
      scheduleTitle: "Запазете консултация",
      scheduleSubtitle: "Предпочитате да говорите директно? Запазете 30-минутен разговор с нашия екип.",
      reachUs: "Или се свържете директно:",
      basedIn: "Базирани в Европа — обслужваме производители в целия континент.",
      required: "Задължително",
      invalidEmail: "Невалиден имейл",
      employees: "служители",
      under: "Под",
      stats: [
        { label: "Време за отговор", value: "< 2ч" },
        { label: "Пазари", value: "ЕС" },
        { label: "Сигурност", value: "SOC 2" },
        { label: "Наличност", value: "99.9%" },
      ],
    },
  },
  faq: {
    en: [
      { question: "How long does implementation take?", answer: "Our standard implementation takes 5 weeks from kickoff to launch. This includes discovery, architecture, development, deployment, and optimization." },
      { question: "Do we need to replace our existing systems?", answer: "Not necessarily. BlackWolf can integrate with your existing tools or replace them entirely — depending on what makes sense for your business." },
      { question: "What\u2019s the minimum commitment?", answer: "Our contracts are month-to-month after the initial implementation period. We believe in earning your business every month." },
      { question: "Which countries do you serve?", answer: "We currently serve manufacturing companies across Europe, with a strong presence in Bulgaria and Spain. Our team operates in English, Spanish, and Bulgarian." },
    ],
    bg: [
      { question: "Колко време отнема внедряването?", answer: "Нашето стандартно внедряване отнема 5 седмици от старт до пускане. Включва анализ, архитектура, разработка, внедряване и оптимизация." },
      { question: "Трябва ли да сменим съществуващите си системи?", answer: "Не непременно. BlackWolf може да се интегрира с вашите съществуващи инструменти или да ги замени изцяло — в зависимост от нуждите на бизнеса ви." },
      { question: "Какъв е минималният ангажимент?", answer: "Нашите договори са на месечна база след първоначалния период на внедряване. Вярваме, че трябва да печелим доверието ви всеки месец." },
      { question: "В кои държави работите?", answer: "В момента обслужваме производствени компании в цяла Европа, със силно присъствие в България и Испания. Екипът ни работи на английски, испански и български." },
    ],
  },
  faqTitle: {
    en: "Common Questions",
    bg: "Често задавани въпроси",
  },
  showcase: {
    en: {
      screenshotsTitle: "System Overview",
      screenshotsSubtitle: "Key screens from the platform",
      screenshots: [
        { alt: "Customized CRM" },
        { alt: "Leaderboard & Rankings" },
        { alt: "Intelligence Platform" },
        { alt: "SOC Security System" },
      ],
    },
    bg: {
      screenshotsTitle: "Преглед на системата",
      screenshotsSubtitle: "Ключови екрани от платформата",
      screenshots: [
        { alt: "Персонализиран CRM" },
        { alt: "Класации и рангове" },
        { alt: "Платформа за интелигентност" },
        { alt: "SOC система за сигурност" },
      ],
    },
  },
  caseStudies: {
    en: {
      title: "Success Stories",
      subtitle: "Real results from real businesses",
      before: "BEFORE",
      after: "AFTER BLACKWOLF",
    },
    bg: {
      title: "Истории на успеха",
      subtitle: "Реални резултати от реални бизнеси",
      before: "ПРЕДИ",
      after: "СЛЕД BLACKWOLF",
    },
  },
  govPrograms: {
    en: {
      title: "Government Digitalization Programs",
      description: "We help you access and qualify for official digitalization subsidies and programs from the Spanish and Bulgarian governments. Our solutions are fully eligible — we handle the paperwork so you can focus on the transformation.",
      kitDigital: "🇪🇸 Kit Digital — Spain",
      bgGrants: "🇧🇬 Digitalization Grants — Bulgaria",
      cta: "Check your eligibility",
    },
    bg: {
      title: "Държавни програми за дигитализация",
      description: "Помагаме ви да получите достъп и да се класирате за официални субсидии и програми за дигитализация от испанското и българското правителство. Нашите решения са напълно допустими — ние се грижим за документацията, за да се съсредоточите върху трансформацията.",
      kitDigital: "🇪🇸 Kit Digital — Испания",
      bgGrants: "🇧🇬 Грантове за дигитализация — България",
      cta: "Проверете допустимостта си",
    },
  },
  cinematic: {
    en: {
      skip: "SKIP",
      scene1: "Your factory generates millions.",
      scene2intro: "But everything runs on...",
      scene2words: ["Excel.", "WhatsApp.", "Memory."],
      scene3: ["Manual fulfillment. Disconnected data.", "Every new opportunity gets swallowed by the chaos."],
      scene4a: "Your attention is your most valuable resource.",
      scene4b: "But you spend it on tasks a system should handle.",
      scene5: "What is inaction really costing you?",
      scene5counter: "/month — and counting",
      scene6title: "One system. Fully integrated. 5 weeks.",
      scene6modules: [
        { tag: "CRM", desc: "Never lose a sale again" },
        { tag: "ERP", desc: "Automate fulfillment, eliminate repetition" },
        { tag: "BI", desc: "Complete visibility into your business" },
        { tag: "SOC", desc: "Manufacturing is the #1 target for cyberattacks" },
        { tag: "AI", desc: "Intelligent agents powering every decision" },
      ],
      scene7a: "Always at the cutting edge.",
      scene7b: "The latest technology, continuously evolving.",
      scene8a: "Digital Infrastructure",
      scene8b: "FOR MANUFACTURING",
    },
    bg: {
      skip: "ПРОПУСНИ",
      scene1: "Вашата фабрика генерира милиони.",
      scene2intro: "Но всичко работи на...",
      scene2words: ["Excel.", "WhatsApp.", "Памет."],
      scene3: ["Ръчно изпълнение. Несвързани данни.", "Всяка нова възможност бива погълната от хаоса."],
      scene4a: "Вашето внимание е най-ценният ви ресурс.",
      scene4b: "Но го изразходвате за задачи, които системата трябва да поеме.",
      scene5: "Какво наистина ви струва бездействието?",
      scene5counter: "/месец — и расте",
      scene6title: "Една система. Напълно интегрирана. 5 седмици.",
      scene6modules: [
        { tag: "CRM", desc: "Никога повече загубена продажба" },
        { tag: "ERP", desc: "Автоматизирай изпълнението, елиминирай повторението" },
        { tag: "BI", desc: "Пълна видимост в бизнеса ви" },
        { tag: "SOC", desc: "Производството е цел №1 за кибератаки" },
        { tag: "AI", desc: "Интелигентни агенти зад всяко решение" },
      ],
      scene7a: "Винаги на върха на технологиите.",
      scene7b: "Най-новите технологии, непрекъснато развиващи се.",
      scene8a: "Дигитална инфраструктура",
      scene8b: "ЗА ПРОИЗВОДСТВО",
    },
  },
  pages: {
    en: {
      home: {
        ctaTitle: "Ready to digitalize your operations?",
        ctaSubtitle: "Book a free consultation call and see how BlackWolf can transform your manufacturing business.",
        ctaPrimary: "Book a Call",
        ctaSecondary: "See Our Work",
      },
      about: {
        badge: "About Us",
        title: "The team behind the infrastructure",
        subtitle: "We\u2019re a team of engineers, strategists, and operators building the digital backbone for European manufacturers.",
        ctaTitle: "Ready to work with us?",
        ctaSubtitle: "Let\u2019s talk about how BlackWolf can transform your operations.",
      },
      services: {
        badge: "Our Services",
        title: "Everything your factory needs in one system",
        subtitle: "Complete digital infrastructure — from business operations to AI-powered security — deployed in 5 weeks.",
        ctaTitle: "Ready to modernize your operations?",
        ctaSubtitle: "Book a free consultation and let\u2019s design the perfect system for your business.",
      },
      showcase: {
        badge: "Our Work",
        title: "Real results for real businesses",
        subtitle: "See how we\u2019ve transformed operations for manufacturers and digital businesses across Europe.",
        ctaTitle: "Want results like these?",
        ctaSubtitle: "Book a free consultation and let\u2019s discuss your transformation.",
        ctaPrimary: "Book a Call",
        ctaSecondary: "Explore Services",
      },
      contact: {
        badge: "Get in Touch",
        title: "Let\u2019s build your digital infrastructure",
        subtitle: "Whether you\u2019re ready to start or just exploring options, we\u2019re here to help.",
      },
    },
    bg: {
      home: {
        ctaTitle: "Готови ли сте да дигитализирате операциите си?",
        ctaSubtitle: "Запазете безплатна консултация и вижте как BlackWolf може да трансформира вашия производствен бизнес.",
        ctaPrimary: "Запази среща",
        ctaSecondary: "Виж нашата работа",
      },
      about: {
        badge: "За нас",
        title: "Екипът зад инфраструктурата",
        subtitle: "Ние сме екип от инженери, стратези и оператори, изграждащи дигиталния гръбнак на европейските производители.",
        ctaTitle: "Готови ли сте да работите с нас?",
        ctaSubtitle: "Нека обсъдим как BlackWolf може да трансформира вашите операции.",
      },
      services: {
        badge: "Нашите услуги",
        title: "Всичко, от което фабриката ви се нуждае, в една система",
        subtitle: "Пълна дигитална инфраструктура — от бизнес операции до AI сигурност — внедрена за 5 седмици.",
        ctaTitle: "Готови да модернизирате операциите си?",
        ctaSubtitle: "Запазете безплатна консултация и нека проектираме перфектната система за вашия бизнес.",
      },
      showcase: {
        badge: "Нашата работа",
        title: "Реални резултати за реални бизнеси",
        subtitle: "Вижте как трансформирахме операциите на производители и дигитални бизнеси в Европа.",
        ctaTitle: "Искате подобни резултати?",
        ctaSubtitle: "Запазете безплатна консултация и нека обсъдим вашата трансформация.",
        ctaPrimary: "Запази среща",
        ctaSecondary: "Разгледай услугите",
      },
      contact: {
        badge: "Свържете се",
        title: "Нека изградим вашата дигитална инфраструктура",
        subtitle: "Независимо дали сте готови да започнете или просто проучвате опции, ние сме тук да помогнем.",
      },
    },
  },
} as const;
