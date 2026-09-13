'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Knowledge base for the travel assistant - covers common questions in all 5 languages
const knowledgeBase: Record<string, { keywords: string[]; answers: Record<string, string> }> = {
  greeting: {
    keywords: ['salam', 'salut', 'hello', 'hi', 'bonjour', 'hola', 'سلام', 'مرحبا', 'salam'],
    answers: {
      fr: 'Bonjour ! Je suis votre assistant RME Voyage. Je peux vous aider avec les itinéraires, les prières, le budget, la Qibla et plus encore. Que souhaitez-vous savoir ?',
      en: 'Hello! I\'m your RME Voyage assistant. I can help with routes, prayers, budget, Qibla and more. What would you like to know?',
      ar: 'مرحبا! أنا مساعدك RME Voyage. يمكنني المساعدة في المسارات والصلوات والميزانية والقبلة والمزيد. ماذا تريد أن تعرف؟',
      es: '¡Hola! Soy tu asistente de RME Voyage. Puedo ayudarte con rutas, oraciones, presupuesto, Qibla y más. ¿Qué quieres saber?',
      da: 'سلام! أنا مساعدك RME Voyage. نقدر نعاونك فالطرق والصلوات والميزانية والقبلة والمزيد. شنو بغيتي تعرف؟',
    },
  },
  route: {
    keywords: ['route', 'itinéraire', 'trajet', 'direction', 'route', 'chemin', 'مسار', 'طريق', 'مسافة', 'distance', 'km', 'route', 'ruta', 'camino'],
    answers: {
      fr: 'Pour planifier votre itinéraire vers le Maroc : utilisez l\'outil "Planifier" en haut. Entrez votre ville de départ et votre destination. L\'app calcule la distance, le temps estimé et les coûts. La route Paris-Tanger fait environ 2100 km.',
      en: 'To plan your route to Morocco: use the "Plan" tool at the top. Enter your departure city and destination. The app calculates distance, estimated time and costs. The Paris-Tangier route is about 2100 km.',
      ar: 'لتخطيط مسارك إلى المغرب: استخدم أداة "خطط" في الأعلى. أدخل مدينتك ووجهتك. يحسب التطبيق المسافة والوقت المقدر والتكاليف. طريق باريس-طنجة حوالي 2100 كم.',
      es: 'Para planificar tu ruta a Marruecos: usa la herramienta "Planificar" arriba. Ingresa tu ciudad de salida y destino. La app calcula distancia, tiempo estimado y costes. La ruta París-Tánger es de unos 2100 km.',
      da: 'باش تخطط الطريق ديالك للمغرب: استعمل أداة "خطط" الفوق. دخل مدينتك ووجهتك. التطبيق كيحسب المسافة والوقت والتكاليف. طريق باريس-طنجة كايقارب 2100 كم.',
    },
  },
  prayer: {
    keywords: ['prière', 'salat', 'prayer', 'prière', 'horaire', 'schedule', 'صلاة', 'مواقيت', 'صلوات', 'oración', 'rezar', 'qibla', 'قبلة', 'mecca', 'مكة'],
    answers: {
      fr: 'Les horaires de prière sont calculés automatiquement selon votre position GPS. La direction de la Qibla s\'affiche avec la boussole de votre téléphone. Activez la géolocalisation pour des résultats précis.',
      en: 'Prayer times are calculated automatically based on your GPS location. The Qibla direction shows with your phone\'s compass. Enable geolocation for accurate results.',
      ar: 'يتم حساب أوقات الصلاة تلقائيًا حسب موقع GPS. يظهر اتجاه القبلة مع بوصلة هاتفك. فعّل تحديد الموقع للحصول على نتائج دقيقة.',
      es: 'Los horarios de oración se calculan automáticamente según tu ubicación GPS. La dirección Qibla se muestra con la brújula de tu teléfono. Activa la geolocalización para resultados precisos.',
      da: 'أوقات الصلاة كيتحسبو أوتوماتيك حسب موقع GPS ديالك. اتجاه القبلة كيبان مع البوصلة ديال التيليفون ديالك. فعل الموقع باش تاخد نتائج دقيقة.',
    },
  },
  ferry: {
    keywords: ['ferry', 'bateau', 'boat', 'traversée', 'crossing', 'ferry', 'عبارة', 'باخرة', 'ferry', 'barco'],
    answers: {
      fr: 'Les traversées en ferry vers le Maroc se font depuis Algeciras (Espagne) vers Tanger Med ou Ceuta. Tarifs indicatifs : 80-200€ par véhicule selon la saison. Réservez à l\'avance en été.',
      en: 'Ferry crossings to Morocco depart from Algeciras (Spain) to Tanger Med or Ceuta. Indicative fares: €80-200 per vehicle depending on season. Book in advance during summer.',
      ar: 'تعبر العبارات إلى المغرب من الجزيرة الخضراء (إسبانيا) إلى طنجة المتوسط أو سبتة. أسعار تقريبية: 80-200 يورو لكل مركبة حسب الموسم. احجز مسبقًا في الصيف.',
      es: 'Los ferris a Marruecos salen desde Algeciras (España) hacia Tánger Med o Ceuta. Tarifas: 80-200€ por vehículo según temporada. Reserva con antelación en verano.',
      da: 'الفيريات للمغرب كيطلعو من الجزيرة الخضراء (إسبانيا) لطنجة المتوسط ولا سبتة. الأسعار تقريبية: 80-200 يورو لكل سيارة حسب الموسم. احجز قبل فالصيف.',
    },
  },
  cost: {
    keywords: ['coût', 'prix', 'budget', 'price', 'cost', 'budget', 'money', 'argent', 'تكلفة', 'ثمن', 'ميزانية', 'precio', 'coste', 'presupuesto'],
    answers: {
      fr: 'Le calculateur de coûts estime carburant, péages et ferry. Comptez environ 250-350€ de carburant pour un trajet Paris-Tanger, 70-100€ de péages en France/Espagne, 80-200€ pour le ferry.',
      en: 'The cost calculator estimates fuel, tolls and ferry. Expect about €250-350 fuel for Paris-Tangier, €70-100 tolls in France/Spain, €80-200 for the ferry.',
      ar: 'يقدر حاسبة التكاليف الوقور والرسوم والعبارة. احسب حوالي 250-350 يورو وقود لطريق باريس-طنجة، 70-100 يورو رسوم في فرنسا/إسبانيا، 80-200 يورو للعبارة.',
      es: 'La calculadora de costes estima combustible, peajes y ferry. Calcula unos 250-350€ de combustible para París-Tánger, 70-100€ peajes en Francia/España, 80-200€ ferry.',
      da: 'حاسبة التكاليف كتقدر الوقود والرسوم والفيري. حسب تقريبا 250-350 يورو الوقود لباريس-طنجة، 70-100 يورو الرسوم ففرنسا/إسبانيا، 80-200 يورو الفيري.',
    },
  },
  documents: {
    keywords: ['document', 'passeport', 'passport', 'carte', 'card', 'visa', 'وثيقة', 'جواز', 'باسبور', 'documento', 'pasaporte', 'visa'],
    answers: {
      fr: 'Documents nécessaires : passeport valide (6 mois minimum), carte grise du véhicule, assurance internationale. Les MRE peuvent aussi utiliser la carte d\'identité marocaine (CNIE). Vérifiez la validité avant le départ.',
      en: 'Required documents: valid passport (6 months minimum), vehicle registration, international insurance. MRE can also use the Moroccan ID card (CNIE). Check validity before departure.',
      ar: 'الوثائق المطلوبة: جواز سفر ساري المفعول (6 أشهر كحد أدنى)، بطاقة السيارة، تأمين دولي. يمكن للمغاربة في الخارج استخدام البطاقة الوطنية (CNIE). تحقق من الصلاحية قبل المغادرة.',
      es: 'Documentos necesarios: pasaporte válido (6 meses mínimo), permiso de circulación, seguro internacional. Los MRE también pueden usar la tarjeta de identidad marroquí (CNIE). Verifica la validez antes de salir.',
      da: 'الوثائق اللازمة: جواز سفر صالح (6 أشهر كحد أدنى)، البطاقة الرمادية للسيارة، التأمين الدولي. المغاربة فالخارج يقدرو يستعملو البطاقة الوطنية (CNIE). تحقق من الصلاحية قبل ما تمشي.',
    },
  },
  currency: {
    keywords: ['monnaie', 'devise', 'currency', 'money', 'change', 'euro', 'dirham', 'مات', 'درهم', 'عملة', 'moneda', 'divisa'],
    answers: {
      fr: 'Le convertisseur de devises supporte EUR, MAD, USD, GBP et plus. Le taux indicatif: 1 EUR ≈ 10.5 MAD. Les distributeurs sont disponibles dans les grandes villes marocaines.',
      en: 'The currency converter supports EUR, MAD, USD, GBP and more. Indicative rate: 1 EUR ≈ 10.5 MAD. ATMs are available in major Moroccan cities.',
      ar: 'مبدل العملات يدعم اليورو والدرهم والدولار والجنيه والمزيد. السعر التقريبي: 1 يورو ≈ 10.5 درهم. أجهزة الصراف متوفرة في المدن المغربية الكبرى.',
      es: 'El conversor de divisas admite EUR, MAD, USD, GBP y más. Tasa indicativa: 1 EUR ≈ 10.5 MAD. Hay cajeros en las principales ciudades marroquíes.',
      da: 'مبدل العملات كيدعم اليورو والدرهم والدولار والجنيه والمزيد. السعر التقريبي: 1 يورو ≈ 10.5 درهم. الصرافات كاينين فالمدن الكبيرة فالمغرب.',
    },
  },
  checklist: {
    keywords: ['checklist', 'liste', 'list', 'préparation', 'preparation', 'قائمة', 'مراجعة', 'تحضير', 'lista', 'preparación'],
    answers: {
      fr: 'La checklist voyage comprend 4 catégories : Documents (passeport, assurance), Véhicule (contrôle, pneus), Santé (médicaments, vaccins), Logistique (hébergement, contacts). Cochez les éléments au fur et à mesure.',
      en: 'The travel checklist includes 4 categories: Documents (passport, insurance), Vehicle (check-up, tires), Health (medications, vaccines), Logistics (accommodation, contacts). Check items as you go.',
      ar: 'تشمل قائمة مراجعة السفر 4 فئات: الوثائق (جواز، تأمين)، المركبة (فحص، إطارات)، الصحة (أدوية، لقاحات)، الخدمات (إقامة، جهات اتصال). حدد العناصر أثناء التقدم.',
      es: 'La lista de verificación incluye 4 categorías: Documentos (pasaporte, seguro), Vehículo (revisión, neumáticos), Salud (medicamentos, vacunas), Logística (alojamiento, contactos). Marca los elementos según avanzas.',
      da: 'قائمة مراجعة السفر فيها 4 فئات: الوثائق (جواز، تأمين)، السيارة (فحص، تاي)، الصحة (أدوية، لقاحات)، الخدمات (سكن، أرقام). علّم العناصر وتسير.',
    },
  },
  emergency: {
    keywords: ['urgence', 'emergency', 'secours', 'help', 'aide', 'accident', 'طوارئ', 'إسعاف', 'مساعدة', 'urgencia', 'ayuda', 'emergencia'],
    answers: {
      fr: 'Numéros d\'urgence au Maroc : Police 19, Ambulance 15, Pompiers 15, Aide routière 177. Ambassade de France à Rabat : +212 537 68 97 00. Consulat à Casablanca : +212 522 48 92 00.',
      en: 'Emergency numbers in Morocco: Police 19, Ambulance 15, Fire 15, Roadside 177. French Embassy in Rabat: +212 537 68 97 00. Consulate in Casablanca: +212 522 48 92 00.',
      ar: 'أرقام الطوارئ في المغرب: الشرطة 19، الإسعاف 15، المطافئ 15، المساعدة على الطريق 177. سفارة فرنسا في الرباط: +212 537 68 97 00. قنصلية الدار البيضاء: +212 522 48 92 00.',
      es: 'Números de emergencia en Marruecos: Policía 19, Ambulancia 15, Bomberos 15, Asistencia en carretera 177. Embajada de Francia en Rabat: +212 537 68 97 00. Consulado en Casablanca: +212 522 48 92 00.',
      da: 'أرقام الطوارئ فالمغرب: البوليس 19، الإسعاف 15، المطافئ 15، المساعدة فالطريق 177. سفارة فرنسا فالرباط: +212 537 68 97 00. القنصلية فالدار البيضاء: +212 522 48 92 00.',
    },
  },
};

function findAnswer(query: string, lang: string): string {
  const lowerQuery = query.toLowerCase();
  for (const [, data] of Object.entries(knowledgeBase)) {
    for (const keyword of data.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        return data.answers[lang] || data.answers.fr;
      }
    }
  }
  // Default response
  const defaults: Record<string, string> = {
    fr: 'Je peux vous aider avec : les itinéraires, les prières et la Qibla, le budget, le ferry, les documents, la checklist, les devises et les urgences. Posez votre question sur un de ces sujets.',
    en: 'I can help with: routes, prayers and Qibla, budget, ferry, documents, checklist, currency and emergencies. Ask your question about any of these topics.',
    ar: 'يمكنني المساعدة في: المسارات، الصلوات والقبلة، الميزانية، العبارة، الوثائق، قائمة المراجعة، العملات والطوارئ. اطرح سؤالك حول أي من هذه المواضيع.',
    es: 'Puedo ayudarte con: rutas, oraciones y Qibla, presupuesto, ferry, documentos, lista de verificación, divisas y emergencias. Haz tu pregunta sobre cualquiera de estos temas.',
    da: 'نقدر نعاونك فـ: الطرق، الصلوات والقبلة، الميزانية، الفيري، الوثائق، قائمة المراجعة، العملات والطوارئ. سول على أي موضوع من هادو.',
  };
  return defaults[lang] || defaults.fr;
}

export default function AIAssistant() {
  const { lang, t, isRtl } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: t('aiGreeting') }]);
    }
  }, [open, messages.length, t]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(userMsg.content, lang);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const quickQuestions: Record<string, string[]> = {
    fr: ['Itinéraire Paris-Tanger ?', 'Horaires de prière ?', 'Coût du ferry ?', 'Documents nécessaires ?'],
    en: ['Paris to Tangier route?', 'Prayer times?', 'Ferry cost?', 'Required documents?'],
    ar: ['مسار باريس-طنجة؟', 'أوقات الصلاة؟', 'سعر العبارة؟', 'الوثائق المطلوبة؟'],
    es: ['¿Ruta París-Tánger?', '¿Horarios de oración?', '¿Precio del ferry?', '¿Documentos necesarios?'],
    da: ['طريق باريس-طنجة؟', 'أوقات الصلاة؟', 'ثمن الفيري؟', 'الوثائق اللازمة؟'],
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 transition-all hover:scale-110 active:scale-95"
        aria-label="Assistant IA"
      >
        {open ? (
          <X className="h-6 w-6 text-[#0a2b21]" />
        ) : (
          <MessageCircle className="h-6 w-6 text-[#0a2b21]" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b2b21] shadow-2xl"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#0a3d2e] to-[#0b2b21] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
              <Sparkles className="h-4 w-4 text-[#0a2b21]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{t('aiTitle')}</h3>
              <p className="text-xs text-white/60">{t('aiSubtitle')}</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-[#0a2b21]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {(quickQuestions[lang] || quickQuestions.fr).map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('aiPlaceholder')}
                className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-amber-400/50 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[#0a2b21] disabled:opacity-40 transition-opacity"
                aria-label={t('aiSend')}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
