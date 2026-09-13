'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Plane,
  Compass,
  Moon,
  Ship,
  Wallet,
  FileText,
  Phone,
  CloudRain,
  Calendar,
  Utensils,
  Smartphone,
  Fuel,
  Users,
  Star,
  Package,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Lang = 'da' | 'fr' | 'en' | 'ar' | 'es';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  topic?: TopicKey | null;
}

type TopicKey =
  | 'greeting'
  | 'route'
  | 'prayer'
  | 'ferry'
  | 'cost'
  | 'documents'
  | 'currency'
  | 'customs'
  | 'emergency'
  | 'weather'
  | 'holidays'
  | 'halal'
  | 'sim'
  | 'fuel'
  | 'family'
  | 'ramadan'
  | 'packing';

/* ------------------------------------------------------------------ */
/*  Knowledge base                                                     */
/*  Each topic has: an icon, keyword triggers (lower-cased), and       */
/*  multilingual answers. Default language is Darija (da).              */
/* ------------------------------------------------------------------ */

const TOPIC_ICON: Record<TopicKey, typeof Plane> = {
  greeting: Sparkles,
  route: Compass,
  prayer: Moon,
  ferry: Ship,
  cost: Wallet,
  documents: FileText,
  currency: Wallet,
  customs: Package,
  emergency: Phone,
  weather: CloudRain,
  holidays: Calendar,
  halal: Utensils,
  sim: Smartphone,
  fuel: Fuel,
  family: Users,
  ramadan: Star,
  packing: Package,
};

interface Topic {
  keywords: string[];
  answers: Record<Lang, string>;
  // contextual quick-replies offered after this topic is answered
  followups: TopicKey[];
}

const KNOWLEDGE: Record<TopicKey, Topic> = {
  greeting: {
    keywords: ['salam', 'salut', 'hello', 'hi', 'bonjour', 'hola', 'sba7', 'kidayr', 'kidayer', 'سلام', 'مرحبا', 'labas', 'labass'],
    answers: {
      da: 'Salam! Ana Hadak, l\'assistant dyalek dyal safari. Sowlni ay haja! N9der n3awnek f\'route, prière, ferry, budget, documents... ay chi bghiti.',
      fr: 'Salam ! Je suis Hadak, ton assistant de voyage. Pose-moi n\'importe quelle question : route, prière, ferry, budget, documents, etc.',
      en: 'Salam! I\'m Hadak, your travel buddy. Ask me anything — routes, prayer times, ferries, budget, documents and more.',
      ar: 'سلام! أنا حدّاك، مساعدك في السفر. اسألني أي شيء: الطرق، الصلوات، العبارة، الميزانية، الوثائق والمزيد.',
      es: '¡Salam! Soy Hadak, tu asistente de viaje. Pregúntame lo que quieras: rutas, oraciones, ferry, presupuesto, documentos y más.',
    },
    followups: ['route', 'ferry', 'cost', 'documents'],
  },
  route: {
    keywords: ['route', 'itinéraire', 'trajet', 'direction', 'chemin', 'distance', 'km', 'ruta', 'camino', 'مسار', 'طريق', 'مسافة', 'planifier', 'itinerary'],
    answers: {
      da: 'Hadak kaytsenna! L\'route Paris-Tanger 7adi 2100 km, l\'wqet dyal lqiyada ~21h. Fes, Meknes, Rabat homa l\'etapes l\'mzyanin f\'triq. Kheddem l\'planificateur fo9 bach t7sb distance, wqet, w l\'budget b\'t-tafasil.',
      fr: 'Pour ton itinéraire : Paris-Tanger ≈ 2100 km, ~21h de conduite. Fès, Meknès et Rabat sont d\'excellentes étapes. Utilise le planificateur en haut pour calculer distance, temps et budget en détail.',
      en: 'For your route: Paris-Tangier ≈ 2100 km, ~21h driving. Fès, Meknès and Rabat are great stops. Use the planner at the top to calculate distance, time and budget in detail.',
      ar: 'لمسارك: باريس-طنجة ≈ 2100 كم، حوالي 21 ساعة قيادة. فاس ومكناس والرباط محطات ممتازة. استخدم المخطط بالأعلى لحساب المسافة والوقت والميزانية بالتفصيل.',
      es: 'Para tu ruta: París-Tánger ≈ 2100 km, ~21h conduciendo. Fez, Meknès y Rabat son buenas paradas. Usa el planificador arriba para calcular distancia, tiempo y presupuesto.',
    },
    followups: ['cost', 'ferry', 'documents'],
  },
  prayer: {
    keywords: ['prière', 'salat', 'prayer', 'horaire', 'schedule', 'صلاة', 'مواقيت', 'صلوات', 'oración', 'rezar', 'qibla', 'قبلة', 'mecca', 'مكة', 'kibla'],
    answers: {
      da: 'Awqat ssalawat katslah 3la l\'GPS dyalek. L\'Qibla katban m3a l\'boussola f l\'phone. Fa3l l\'geolocation bach tchd n\'nataij d9iqa. Salat l\'Fajr f l\'3asser dyal l\'asfar katkon m3a sh-shurouq.',
      fr: 'Les horaires de prière sont calculés selon ta position GPS. La Qibla s\'affiche avec la boussole de ton téléphone. Active la géolocalisation pour des résultats précis.',
      en: 'Prayer times are calculated from your GPS location. The Qibla direction shows with your phone\'s compass. Enable geolocation for accurate results.',
      ar: 'يتم حساب أوقات الصلاة حسب موقع GPS. يظهر اتجاه القبلة مع بوصلة هاتفك. فعّل تحديد الموقع للحصول على نتائج دقيقة.',
      es: 'Los horarios de oración se calculan según tu ubicación GPS. La dirección Qibla se muestra con la brújula de tu teléfono. Activa la geolocalización para resultados precisos.',
    },
    followups: ['qibla' as TopicKey, 'ramadan', 'halal'],
  },
  ferry: {
    keywords: ['ferry', 'bateau', 'boat', 'traversée', 'crossing', 'barco', 'عبارة', 'باخرة', 'tanger', 'algeciras', 'barcelona', 'tanger-med', 'med'],
    answers: {
      da: 'L\'ferry kaymchi men Algeciras (España) l Tanger Med wla Ceuta. L\'prix: 80-200€ 3la koll voiture 7sb l\'mawsem. F l\'sif, khessak t\'reserve zmen! Men Barcelona kayn croisières men marra f l\'usbu3.',
      fr: 'Les ferries vers le Maroc partent d\'Algeciras (Espagne) vers Tanger Med ou Ceuta. Tarifs : 80-200€ par véhicule selon la saison. En été, réserve à l\'avance ! Depuis Barcelone, il y a des croisières hebdomadaires.',
      en: 'Ferries to Morocco depart from Algeciras (Spain) to Tanger Med or Ceuta. Fares: €80-200 per vehicle depending on season. Book ahead in summer! From Barcelona there are weekly cruises.',
      ar: 'تعبر العبارات إلى المغرب من الجزيرة الخضراء (إسبانيا) إلى طنجة المتوسط أو سبتة. الأسعار: 80-200 يورو لكل مركبة حسب الموسم. احجز مسبقًا في الصيف! من برشلونة هناك رحلات أسبوعية.',
      es: 'Los ferris a Marruecos salen desde Algeciras (España) hacia Tánger Med o Ceuta. Tarifas: 80-200€ por vehículo según temporada. ¡Reserva con antelación en verano! Desde Barcelona hay cruceros semanales.',
    },
    followups: ['cost', 'documents', 'route'],
  },
  cost: {
    keywords: ['coût', 'prix', 'budget', 'price', 'cost', 'money', 'argent', 'تكلفة', 'ثمن', 'ميزانية', 'precio', 'coste', 'presupuesto', 'cher', 'ghali'],
    answers: {
      da: 'L\'budget dyal safari Paris-Tanger: carburant 250-350€, péages 70-100€ f France/España, ferry 80-200€, masakin 50-100€ f l\'leil. Total approximatif: 500-800€ 3la l\'voyage kamla. Kheddem l\'calculette dyal l\'costs fo9!',
      fr: 'Budget estimé Paris-Tanger : carburant 250-350€, péages 70-100€ en France/Espagne, ferry 80-200€, hébergement 50-100€/nuit. Total approx. : 500-800€ pour le trajet. Utilise le calculateur de coûts en haut !',
      en: 'Estimated budget Paris-Tangier: fuel €250-350, tolls €70-100 in France/Spain, ferry €80-200, lodging €50-100/night. Approx. total: €500-800. Use the cost calculator at the top!',
      ar: 'الميزانية المقدرة باريس-طنجة: الوقود 250-350 يورو، الرسوم 70-100 يورو في فرنسا/إسبانيا، العبارة 80-200 يورو، الإقامة 50-100 يورو/ليلة. الإجمالي التقريبي: 500-800 يورو. استخدم حاسبة التكاليف بالأعلى!',
      es: 'Presupuesto estimado París-Tánger: combustible 250-350€, peajes 70-100€ en Francia/España, ferry 80-200€, alojamiento 50-100€/noche. Total aprox.: 500-800€. ¡Usa la calculadora de costes arriba!',
    },
    followups: ['currency', 'fuel', 'documents'],
  },
  documents: {
    keywords: ['document', 'passeport', 'passport', 'carte', 'card', 'visa', 'وثيقة', 'جواز', 'باسبور', 'documento', 'pasaporte', 'cnie', 'carte grise', 'assurance', 'registration'],
    answers: {
      da: 'L\'documents li khessak: passeport valide (6 ch\'hour 3la l\'aqal), carte grise dyal l\'voiture, assurance internationale. L\'MRE y9dro ysta3mlo l\'CNIE (carte nationale). Tcheck l\'validité 9bel matmchi! L\'carte verte dyal l\'assurance mohimma f l\'triq.',
      fr: 'Documents nécessaires : passeport valide (6 mois minimum), carte grise du véhicule, assurance internationale. Les MRE peuvent utiliser la CNIE. Vérifiez la validité avant le départ ! La carte verte d\'assurance est essentielle sur la route.',
      en: 'Required documents: valid passport (6 months min.), vehicle registration, international insurance. MRE can use the CNIE (Moroccan ID). Check validity before leaving! The green insurance card is essential on the road.',
      ar: 'الوثائق المطلوبة: جواز سفر ساري (6 أشهر كحد أدنى)، بطاقة السيارة، تأمين دولي. يمكن للمغاربة في الخارج استخدام البطاقة الوطنية (CNIE). تحقق من الصلاحية قبل المغادرة! البطاقة الخضراء للتأمين ضرورية على الطريق.',
      es: 'Documentos necesarios: pasaporte válido (6 meses mínimo), permiso de circulación, seguro internacional. Los MRE pueden usar la CNIE. ¡Verifica la validez antes de salir! La carta verde de seguro es esencial en la carretera.',
    },
    followups: ['customs', 'currency', 'route'],
  },
  currency: {
    keywords: ['monnaie', 'devise', 'currency', 'money', 'change', 'euro', 'dirham', 'مات', 'درهم', 'عملة', 'moneda', 'divisa', 'exchange', 'saraf'],
    answers: {
      da: 'L\'taux: 1€ ≈ 10.5 dirham (MAD). L\'distributeurs (ATM) kaynin f l\'mdoun l\'kbar. L\'mezyan tchri dirhams zmen f l\'bank wla f l\'maṭar. Brra dyal l\'maṭar, l\'taux kaykon mzyan f l\'dawaer l\'kbar bzzaf. Hadak kaynsahk: matlbssch bzaf flouss cash!',
      fr: 'Taux indicatif : 1€ ≈ 10,5 MAD. Des distributeurs (ATM) sont disponibles dans les grandes villes. Mieux vaut acheter des dirhams à l\'avance à la banque ou à l\'aéroport. Hors aéroport, le taux est souvent meilleur en centre-ville. Hadak te conseille : ne porte pas trop de cash !',
      en: 'Indicative rate: 1€ ≈ 10.5 MAD. ATMs are available in major cities. Best to buy dirhams in advance at a bank or airport. Outside airports, rates are often better in city centers. Hadak advises: don\'t carry too much cash!',
      ar: 'السعر التقريبي: 1 يورو ≈ 10.5 درهم. أجهزة الصراف متوفرة في المدن الكبرى. من الأفضل شراء الدراهم مسبقًا من البنك أو المطار. خارج المطار، الأسعار غالبًا أفضل في مراكز المدن. حدّاك ينصحك: لا تحمل الكثير من النقد!',
      es: 'Tasa indicativa: 1€ ≈ 10.5 MAD. Hay cajeros en las grandes ciudades. Mejor comprar dirhams por adelantado en un banco o aeropuerto. Fuera del aeropuerto, los tipos suelen ser mejores en el centro. Hadak aconseja: ¡no lleves demasiado efectivo!',
    },
    followups: ['cost', 'customs', 'fuel'],
  },
  customs: {
    keywords: ['douane', 'customs', 'duty', 'tax', 'limit', 'ةنة', 'جمارك', 'aduanas', 'franchise', 'allowance', 'tabac', 'alcool', 'cigarette'],
    answers: {
      da: 'L\'douane f l\'Maroc: 200 cigarette wla 50 cigar wla 250g tabac, 1L l\'kohol, 75ml parfum. L\'franchise: 2000€ 3la l\'objets personnels. L\'mohim: mat-jibch m3ak l\'electroniques jdad bzaf bla facture. L\'douane kay9lb 3la l\'camera, l\'drone, w l\'matériel pro.',
      fr: 'Douane marocaine : 200 cigarettes ou 50 cigares ou 250g de tabac, 1L d\'alcool, 75ml de parfum. Franchise : 2000€ d\'effets personnels. Important : n\'apporte pas d\'électronique neuf sans facture. La douane vérifie caméras, drones et matériel pro.',
      en: 'Moroccan customs: 200 cigarettes or 50 cigars or 250g tobacco, 1L alcohol, 75ml perfume. Allowance: €2000 personal goods. Important: don\'t bring new electronics without receipts. Customs checks cameras, drones and pro equipment.',
      ar: 'الجمارك المغربية: 200 سيجارة أو 50 سيجار أو 250غ تبغ، 1 لتر كحول، 75مل عطر. الإعفاء: 2000 يورو للأغراض الشخصية. مهم: لا تحضر إلكترونيات جديدة بدون فواتير. الجمارك تتحقق من الكاميرات والطائرات المسيارة والمعدات الاحترافية.',
      es: 'Aduana marroquí: 200 cigarrillos o 50 puros o 250g de tabaco, 1L de alcohol, 75ml de perfume. Franquicia: 2000€ de efectos personales. Importante: no traigas electrónica nueva sin factura. La aduana revisa cámaras, drones y material pro.',
    },
    followups: ['documents', 'currency', 'family'],
  },
  emergency: {
    keywords: ['urgence', 'emergency', 'secours', 'help', 'aide', 'accident', 'طوارئ', 'إسعاف', 'مساعدة', 'urgencia', 'ayuda', 'police', 'ambulance', 'pompiers'],
    answers: {
      da: 'L\'nawamir dyal l\'urgence f l\'Maroc: Police 19, Ambulance 15, Pompiers 15, Aide routière 177. Ambassade dyal France f Rabat: +212 537 68 97 00. Consulat f Casablanca: +212 522 48 92 00. 7fed had l\'nawamir m3ak dima!',
      fr: 'Numéros d\'urgence au Maroc : Police 19, Ambulance 15, Pompiers 15, Aide routière 177. Ambassade de France à Rabat : +212 537 68 97 00. Consulat à Casablanca : +212 522 48 92 00. Garde ces numéros avec toi !',
      en: 'Emergency numbers in Morocco: Police 19, Ambulance 15, Fire 15, Roadside 177. French Embassy in Rabat: +212 537 68 97 00. Consulate in Casablanca: +212 522 48 92 00. Keep these numbers handy!',
      ar: 'أرقام الطوارئ في المغرب: الشرطة 19، الإسعاف 15، المطافئ 15، المساعدة على الطريق 177. سفارة فرنسا في الرباط: +212 537 68 97 00. قنصلية الدار البيضاء: +212 522 48 92 00. احتفظ بهذه الأرقام!',
      es: 'Números de emergencia en Marruecos: Policía 19, Ambulancia 15, Bomberos 15, Asistencia en carretera 177. Embajada de Francia en Rabat: +212 537 68 97 00. Consulado en Casablanca: +212 522 48 92 00. ¡Guarda estos números!',
    },
    followups: ['documents', 'health' as TopicKey, 'route'],
  },
  weather: {
    keywords: ['weather', 'meteo', 'climat', 'طقس', 'جو', 'tiempo', 'clima', 'hot', 'cold', 'pluie', 'rain', 'chaleur', 'ssekhana'],
    answers: {
      da: 'L\'météo f l\'Maroc: sif kaykon s7khon (30-45°C f l\'dakhil), l\'khelif kaykon m3tadel f l\'Atlas (20-25°C). F l\'sahel, l\'bhar kaybrred shwia. L\'matar kaybqa 9al f l\'sif. Khdem l\'app dyal l\'météo bach t3ref l\'nhar dyal l\'safar. 7fed l\'crème solaire!',
      fr: 'La météo au Maroc : l\'été est chaud (30-45°C à l\'intérieur), l\'hiver est doux dans l\'Atlas (20-25°C). Sur la côte, la mer rafraîchit un peu. La pluie est rare en été. Consulte l\'app météo avant de partir. N\'oublie pas la crème solaire !',
      en: 'Weather in Morocco: summer is hot (30-45°C inland), winter is mild in the Atlas (20-25°C). On the coast, the sea cools things down. Rain is rare in summer. Check the weather app before your trip. Don\'t forget sunscreen!',
      ar: 'الطقس في المغرب: الصيف حار (30-45°م في الداخل)، الشتاء معتدل في الأطلس (20-25°م). على الساحل، البحر يبرّد قليلاً. المطر نادر في الصيف. راجع تطبيق الطقس قبل سفرك. لا تنسَ واقي الشمس!',
      es: 'El clima en Marruecos: el verano es caluroso (30-45°C en el interior), el invierno es suave en el Atlas (20-25°C). En la costa, el mar refresca. La lluvia es rara en verano. Consulta la app del tiempo antes de viajar. ¡No olvides el protector solar!',
    },
    followups: ['packing', 'ramadan', 'route'],
  },
  holidays: {
    keywords: ['holiday', 'férié', 'fête', 'vacance', 'عيد', 'عطلة', 'fiesta', 'feriado', 'aid', 'mawlid', 'yennayer', 'throne', 'independence', 'istiglal'],
    answers: {
      da: 'L\'3iyad f l\'Maroc: Aïd al-Fitr w Aïd al-Adha (3iyad dyal l\'3am), Mawlid n\'Nabawi, 1er Janvier (Yennayer), Aïd al-Arach (Hijri New Year), fête du Trône (30 juillet), fête de l\'Indépendance (18 novembre). F l\'3iyad, l\'makhassirat w l\'admin kaytseddo. 7fed l\'jour dyal l\'safar m3a l\'3iyad!',
      fr: 'Jours fériés au Maroc : Aïd al-Fitr et Aïd al-Adha (fêtes religieuses), Mawlid an-Nabawi, 1er janvier (Yennayer), Nouvel An Hijri, Fête du Trône (30 juillet), Indépendance (18 novembre). Pendant les fêtes, administrations et magasins ferment. Planifie ton voyage autour de ces dates !',
      en: 'Moroccan holidays: Eid al-Fitr and Eid al-Adha (religious), Mawlid an-Nabawi, January 1st (Yennayer), Hijri New Year, Throne Day (July 30), Independence Day (Nov 18). During holidays, admin and shops close. Plan your trip around these dates!',
      ar: 'العطل في المغرب: عيد الفطر وعيد الأضحى (أعياد دينية)، المولد النبوي، 1 يناير (يناير)، رأس السنة الهجرية، عيد العرش (30 يوليو)، عيد الاستقلال (18 نوفمبر). خلال الأعياد، الإدارة والمتاجر تغلق. خطط لسفرك حول هذه التواريخ!',
      es: 'Festivos en Marruecos: Eid al-Fitr y Eid al-Adha (religiosas), Mawlid an-Nabawi, 1 de enero (Yennayer), Año Nuevo Hijri, Fiesta del Trono (30 julio), Independencia (18 noviembre). Durante las fiestas, cierran admins y tiendas. ¡Planifica tu viaje en torno a estas fechas!',
    },
    followups: ['ramadan', 'route', 'family'],
  },
  halal: {
    keywords: ['halal', 'food', 'manger', 'restaurant', 'كشر', 'حلال', 'comida', 'restaurant', 'k\'lwa', 'makla', 'ta3am'],
    answers: {
      da: 'F l\'Maroc, l\'makla kamla halal! L\'restaurants dyal l\'machoui, l\'tajine, l\'couscous, l\'pastilla... l\'makla l\'maghribia mashhura f l\'3alam. F l\'mdoun l\'kbar kayn l\'fast food halal (MacDo, KFC). L\'machoui dyal Tanger w l\'harira f Ramdan... hadak kay7sen!',
      fr: 'Au Maroc, toute la nourriture est halal ! Les restaurants de mechoui, tajine, couscous, pastilla... la cuisine marocaine est mondialement connue. Dans les grandes villes, il y a du fast-food halal (MacDo, KFC). La mechoui de Tanger et la harira du Ramadan... Hadak recommande !',
      en: 'In Morocco, all food is halal! Restaurants for mechoui, tajine, couscous, pastilla... Moroccan cuisine is world-famous. In big cities there\'s halal fast-food (MacDo, KFC). The mechoui of Tangier and Ramadan harira... Hadak recommends!',
      ar: 'في المغرب، كل الطعام حلال! مطاعم المشوي والطاجين والكسكس والبسطيلة... المطبخ المغربي مشهور عالميًا. في المدن الكبرى يوجد وجبات سريعة حلال (ماكدونالدز، كنتاكي). مشوي طنجة وحساء رمضان... حدّاك يوصي!',
      es: 'En Marruecos, ¡toda la comida es halal! Restaurantes de mechoui, tajine, cuscús, pastela... la cocina marroquí es mundialmente famosa. En grandes ciudades hay comida rápida halal (MacDo, KFC). El mechoui de Tánger y la harira de Ramadán... ¡Hadak recomienda!',
    },
    followups: ['ramadan', 'family', 'route'],
  },
  sim: {
    keywords: ['sim', 'card', 'phone', 'internet', 'data', 'forfait', 'recharge', 'شريحة', 'هاتف', 'إنترنت', 'tarjeta', 'móvil', 'internet', 'orange', 'maroc telecom', 'inwi'],
    answers: {
      da: 'L\'SIM f l\'Maroc: Maroc Telecom (IAM), Orange, w Inwi. L\'prix dyal l\'SIM: 20-50 dirham. L\'forfait: 50-100 dirham l\'shahr (data + calls). L\'mezyan t\'chri l\'SIM f l\'maṭar wla f l\'boutique officielle. L\'4G kayna f l\'mdoun l\'kbar. Hadak kaynsahk: khedjem l\'eSIM ila l\'phone dyalek kay supporta!',
      fr: 'Carte SIM au Maroc : Maroc Telecom (IAM), Orange, Inwi. Prix de la SIM : 20-50 dirhams. Forfait : 50-100 dirhams/mois (data + appels). Mieux vaut acheter la SIM à l\'aéroport ou en boutique officielle. La 4G est disponible dans les grandes villes. Hadak conseille : utilise l\'eSIM si ton téléphone le supporte !',
      en: 'SIM card in Morocco: Maroc Telecom (IAM), Orange, Inwi. SIM price: 20-50 dirhams. Plan: 50-100 dirhams/month (data + calls). Best to buy the SIM at the airport or official store. 4G is available in major cities. Hadak advises: use eSIM if your phone supports it!',
      ar: 'بطاقة SIM في المغرب: اتصالات المغرب (IAM)، أورانج، إنوي. سعر البطاقة: 20-50 درهم. الباقة: 50-100 درهم/شهر (بيانات + مكالمات). من الأفضل شراء البطاقة في المطار أو المتجر الرسمي. 4G متوفرة في المدن الكبرى. حدّاك ينصح: استخدم eSIM إذا كان هاتفك يدعمها!',
      es: 'Tarjeta SIM en Marruecos: Maroc Telecom (IAM), Orange, Inwi. Precio de la SIM: 20-50 dirhams. Plan: 50-100 dirhams/mes (datos + llamadas). Mejor comprar la SIM en el aeropuerto o tienda oficial. El 4G está disponible en grandes ciudades. Hadak aconseja: ¡usa eSIM si tu teléfono lo soporta!',
    },
    followups: ['currency', 'emergency', 'route'],
  },
  fuel: {
    keywords: ['fuel', 'essence', 'gas', 'petrol', 'diesel', 'carburant', 'gasoil', 'وقود', 'بنزين', 'combustible', 'gasolina', 'gasoil', 'prix', 'station'],
    answers: {
      da: 'L\'prix dyal l\'carburant f l\'Maroc (approximatif): Diesel ~14.5 dirham/L, Sans-plomb 95 ~15.5 dirham/L, Super ~16 dirham/L. L\'stations kaynin f koll blasa f l\'autoroute. L\'carburant f l\'Maroc rkhas men l\'Europe. Hadak kaynsahk: 3mmer l\'réservoir 9bel matdkhel l\'Maroc men Ceuta/Tanger Med!',
      fr: 'Prix du carburant au Maroc (approximatif) : Diesel ~14,5 dirhams/L, Sans-plomb 95 ~15,5 dirhams/L, Super ~16 dirhams/L. Des stations partout sur les autoroutes. Le carburant est moins cher qu\'en Europe. Hadak conseille : fais le plein avant d\'entrer au Maroc depuis Ceuta/Tanger Med !',
      en: 'Fuel prices in Morocco (approx.): Diesel ~14.5 dirhams/L, Unleaded 95 ~15.5 dirhams/L, Super ~16 dirhams/L. Stations everywhere on highways. Fuel is cheaper than in Europe. Hadak advises: fill up before entering Morocco from Ceuta/Tanger Med!',
      ar: 'أسعار الوقود في المغرب (تقريبي): الديزل ~14.5 درهم/لتر، الخالي من الرصاص 95 ~15.5 درهم/لتر، السوبر ~16 درهم/لتر. محطات الوقود في كل مكان على الطرق السريعة. الوقود أرخص من أوروبا. حدّاك ينصح: املأ الخزان قبل الدخول إلى المغرب من سبتة/طنجة المتوسط!',
      es: 'Precios de combustible en Marruecos (aprox.): Diésel ~14.5 dirhams/L, Sin plomo 95 ~15.5 dirhams/L, Súper ~16 dirhams/L. Hay estaciones en todas las autopistas. El combustible es más barato que en Europa. Hadak aconseja: ¡llena el depósito antes de entrar a Marruecos desde Ceuta/Tánger Med!',
    },
    followups: ['cost', 'route', 'documents'],
  },
  family: {
    keywords: ['family', 'famille', 'enfant', 'kids', 'baby', 'عائلة', 'أطفال', 'رضع', 'familia', 'niños', 'baby', 'bébé'],
    answers: {
      da: 'L\'safari m3a l\'3a2ila: l\'Maroc blasa mzyana l l\'3a2ila! L\'hotels kaybqa fihom l\'clubs dyal l\'atfal. L\'plages dyal Agadir w Tangier safe l l\'atfal. Khedjem l\'poussette l\'terrain f l\'mdoun l\'9dima (Fes, Marrakech). 7fed l\'crème solaire, l\'chapeau, w l\'ma f l\'bouteille. Hadak kay7fed 3la l\'atfal dyalek!',
      fr: 'Voyage en famille : le Maroc est un pays familial ! Les hôtels proposent des clubs enfants. Les plages d\'Agadir et Tanger sont sûres pour les enfants. Prévois une poussette tout-terrain pour les médinas (Fès, Marrakech). N\'oublie crème solaire, chapeau et eau en bouteille. Hadak veille sur tes enfants !',
      en: 'Family travel: Morocco is family-friendly! Hotels offer kids\' clubs. Agadir and Tangier beaches are safe for children. Bring an all-terrain stroller for the medinas (Fès, Marrakech). Don\'t forget sunscreen, hats and bottled water. Hadak watches over your kids!',
      ar: 'السفر مع العائلة: المغرب بلد مناسب للعائلات! الفنادق تقدم نوادي للأطفال. شواطئ أكادير وطنجة آمنة للأطفال. أحضر عربة أطفال للطرق الوعرة في المدن القديمة (فاس، مراكش). لا تنسَ واقي الشمس والقبعات والمياه المعبأة. حدّاك يحرس أطفالك!',
      es: 'Viaje en familia: ¡Marruecos es un país familiar! Los hoteles ofrecen clubs infantiles. Las playas de Agadir y Tánger son seguras para niños. Lleva un cochecito todoterreno para las medinas (Fez, Marrakech). No olvides protector solar, sombreros y agua embotellada. ¡Hadak cuida a tus hijos!',
    },
    followups: ['packing', 'weather', 'halal'],
  },
  ramadan: {
    keywords: ['ramadan', 'ramadan', 'صوم', 'رمضان', 'fasting', 'iftar', 'ftour', 'souhour', 'sahur'],
    answers: {
      da: 'L\'Ramdan f l\'Maroc: l\'ftour (iftar) kaybda m3a l\'ghroub dyal l\'chems. L\'harira, l\'dattes, l\'chebakia... l\'makla dyal l\'ftour mashhura! L\'restaurants kay9lbou 9bel l\'ftour. L\'modawana: mat-bani-nas f l\'3am. L\'souhour kaykon f l\'Lfi dial l\'Fajr. Hadak kaybgha l\'Ramdan m3akom!',
      fr: 'Ramadan au Maroc : l\'iftar commence au coucher du soleil. La harira, les dattes, la chebakia... la nourriture de rupture est célèbre ! Les restaurants se remplissent avant l\'iftar. Soyez discret en public. Le souhour a lieu avant l\'aube (Fajr). Hadak vous accompagne pendant le Ramadan !',
      en: 'Ramadan in Morocco: iftar starts at sunset. Harira soup, dates, chebakia... the iftar food is famous! Restaurants fill up before iftar. Be discreet in public during the day. Souhour is before dawn (Fajr). Hadak is with you during Ramadan!',
      ar: 'رمضان في المغرب: الإفطار يبدأ عند غروب الشمس. الحريرة والتمر والشباكية... طعام الإفطار مشهور! تمتلئ المطاعم قبل الإفطار. كن متحفظًا في الأماكن العامة خلال النهار. السحور قبل الفجر. حدّاك معك خلال رمضان!',
      es: 'Ramadán en Marruecos: el iftar comienza al atardecer. La harira, los dátiles, la chebakia... ¡la comida del iftar es famosa! Los restaurantes se llenan antes del iftar. Sé discreto en público durante el día. El suhur es antes del amanecer. ¡Hadak te acompaña en el Ramadán!',
    },
    followups: ['prayer', 'halal', 'holidays'],
  },
  packing: {
    keywords: ['packing', 'valise', 'bagage', 'luggage', 'list', 'قائمة', 'حقائب', 'equipaje', 'maleta', 'afak', 'chi haja', 'chimen', 'qayq'],
    answers: {
      da: 'L\'packing dyal safari Maroc: passeport, CNIE, carte grise, assurance verte. L\'waq dyal l\'ma: crème solaire, chapeau, lunettes. L\'layl kayberred f l\'Atlas: khedjem pull. L\'chaussures dyal l\'machi l l\'mdoun l\'9dima. Chargeur universel + adaptateur (Type C/E). L\'pharmacie: doliprane, immodium, pansements. Hadak kay7fed m3ak l\'bagage!',
      fr: 'Bagage pour le Maroc : passeport, CNIE, carte grise, assurance verte. Climat : crème solaire, chapeau, lunettes. Les nuits fraîches dans l\'Atlas : prévois un pull. Chaussures de marche pour les médinas. Chargeur universel + adaptateur (Type C/E). Pharmacie : doliprane, immodium, pansements. Hadak veille sur ton bagage !',
      en: 'Packing for Morocco: passport, CNIE, car registration, green insurance. Climate: sunscreen, hat, sunglasses. Cool nights in the Atlas: bring a sweater. Walking shoes for the medinas. Universal charger + adapter (Type C/E). First-aid kit: paracetamol, loperamide, bandages. Hadak watches your luggage!',
      ar: 'الحقائب للمغرب: جواز السفر، البطاقة الوطنية، بطاقة السيارة، التأمين الأخضر. المناخ: واقي الشمس، قبعة، نظارات. الليالي الباردة في الأطلس: أحضر سترة. أحذية للمشي في المدن القديمة. شاحن عالمي + محول (نوع C/E). حقيبة إسعاف: باراسيتامول، لوبيراميد، ضمادات. حدّاك يحرس أمتعتك!',
      es: 'Equipaje para Marruecos: pasaporte, CNIE, permiso de circulación, seguro verde. Clima: protector solar, sombrero, gafas. Noches frescas en el Atlas: lleva un jersey. Zapatos de caminata para las medinas. Cargador universal + adaptador (Tipo C/E). Botiquín: paracetamol, loperamida, tiritas. ¡Hadak vigila tu equipaje!',
    },
    followups: ['documents', 'weather', 'family'],
  },
};

/* ------------------------------------------------------------------ */
/*  Language selector labels                                          */
/* ------------------------------------------------------------------ */

const LANG_LABELS: Record<Lang, string> = {
  da: 'Darija',
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
  es: 'Español',
};

const LANG_FLAG: Record<Lang, string> = {
  da: '🇲🇦',
  fr: '🇫🇷',
  en: '🇬🇧',
  ar: '🇸🇦',
  es: '🇪🇸',
};

const ALL_LANGS: Lang[] = ['da', 'fr', 'en', 'ar', 'es'];

/* ------------------------------------------------------------------ */
/*  Quick suggestions - context-aware                                  */
/* ------------------------------------------------------------------ */

const TOPIC_LABELS: Record<TopicKey, Record<Lang, string>> = {
  greeting: { da: 'Salam!', fr: 'Bonjour', en: 'Hello', ar: 'مرحبا', es: 'Hola' },
  route: { da: 'Route dyali?', fr: 'Mon itinéraire ?', en: 'My route?', ar: 'مساري؟', es: '¿Mi ruta?' },
  prayer: { da: 'Awqat ssalat?', fr: 'Heures de prière ?', en: 'Prayer times?', ar: 'أوقات الصلاة؟', es: '¿Horas de oración?' },
  ferry: { da: 'L\'ferry?', fr: 'Le ferry ?', en: 'The ferry?', ar: 'العبارة؟', es: '¿El ferry?' },
  cost: { da: 'Ch\'hal l\'budget?', fr: 'Quel budget ?', en: 'What budget?', ar: 'ما الميزانية؟', es: '¿Qué presupuesto?' },
  documents: { da: 'Documents?', fr: 'Documents ?', en: 'Documents?', ar: 'الوثائق؟', es: '¿Documentos?' },
  currency: { da: 'Dirham?', fr: 'Dirham ?', en: 'Dirham?', ar: 'الدرهم؟', es: '¿Dirham?' },
  customs: { da: 'Douane?', fr: 'Douane ?', en: 'Customs?', ar: 'الجمارك؟', es: '¿Aduana?' },
  emergency: { da: 'Urgence!', fr: 'Urgence !', en: 'Emergency!', ar: 'طوارئ!', es: '¡Urgencia!' },
  weather: { da: 'Météo?', fr: 'Météo ?', en: 'Weather?', ar: 'الطقس؟', es: '¿Tiempo?' },
  holidays: { da: 'L\'3iyad?', fr: 'Jours fériés ?', en: 'Holidays?', ar: 'الأعياد؟', es: '¿Festivos?' },
  halal: { da: 'Halal?', fr: 'Halal ?', en: 'Halal?', ar: 'حلال؟', es: '¿Halal?' },
  sim: { da: 'SIM card?', fr: 'Carte SIM ?', en: 'SIM card?', ar: 'بطاقة SIM؟', es: '¿SIM?' },
  fuel: { da: 'L\'carburant?', fr: 'Carburant ?', en: 'Fuel?', ar: 'الوقود؟', es: '¿Combustible?' },
  family: { da: 'M3a l\'3a2ila?', fr: 'En famille ?', en: 'With family?', ar: 'مع العائلة؟', es: '¿En familia?' },
  ramadan: { da: 'Ramdan?', fr: 'Ramadan ?', en: 'Ramadan?', ar: 'رمضان؟', es: '¿Ramadán?' },
  packing: { da: 'Packing?', fr: 'Bagage ?', en: 'Packing?', ar: 'الحقائب؟', es: '¿Equipaje?' },
};

const DEFAULT_SUGGESTIONS: TopicKey[] = ['route', 'prayer', 'ferry', 'cost', 'documents', 'ramadan'];

/* ------------------------------------------------------------------ */
/*  Answer finder                                                      */
/* ------------------------------------------------------------------ */

function findTopic(query: string): TopicKey | null {
  const q = query.toLowerCase();
  let best: { topic: TopicKey; score: number } | null = null;
  for (const [key, data] of Object.entries(KNOWLEDGE) as [TopicKey, Topic][]) {
    let score = 0;
    for (const kw of data.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length; // longer keyword = more specific
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { topic: key, score };
    }
  }
  return best?.topic ?? null;
}

function getAnswer(query: string, lang: Lang): { content: string; topic: TopicKey | null } {
  const topic = findTopic(query);
  if (topic) {
    return { content: KNOWLEDGE[topic].answers[lang] || KNOWLEDGE[topic].answers.da, topic };
  }
  // Fallback - Hadak introduces what he can do
  const fallback: Record<Lang, string> = {
    da: 'Hmm, ma fhamtch mzyan... Hadak n9der y3awnek f: l\'route, l\'prières, l\'ferry, l\'budget, l\'documents, l\'currency, l\'douane, l\'urgence, l\'météo, l\'3iyad, l\'halal, l\'SIM, l\'carburant, l\'3a2ila, l\'Ramdan, w l\'packing. Sowlni 3la wahda mn homa!',
    fr: 'Hmm, je n\'ai pas bien compris... Hadak peut t\'aider avec : la route, les prières, le ferry, le budget, les documents, la monnaie, la douane, les urgences, la météo, les jours fériés, le halal, la SIM, le carburant, la famille, le Ramadan et le bagage. Pose-moi une question sur l\'un de ces sujets !',
    en: 'Hmm, I didn\'t quite get that... Hadak can help you with: routes, prayers, ferry, budget, documents, currency, customs, emergencies, weather, holidays, halal food, SIM cards, fuel, family travel, Ramadan and packing. Ask me about any of these!',
    ar: 'همم، لم أفهم جيدًا... حدّاك يمكنه مساعدتك في: الطرق، الصلوات، العبارة، الميزانية، الوثائق، العملة، الجمارك، الطوارئ، الطقس، الأعياد، الحلال، بطاقة SIM، الوقود، العائلة، رمضان والحقائب. اسألني عن أي من هذه!',
    es: 'Hmm, no entendí bien... Hadak puede ayudarte con: rutas, oraciones, ferry, presupuesto, documentos, moneda, aduana, emergencias, clima, festivos, comida halal, SIM, combustible, familia, Ramadán y equipaje. ¡Pregúntame sobre cualquiera de estos!',
  };
  return { content: fallback[lang] || fallback.da, topic: null };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HadakAI() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('da');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastTopic, setLastTopic] = useState<TopicKey | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRtl = lang === 'ar' || lang === 'da';

  /* Auto-scroll to bottom on new messages / typing */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  /* Greeting message when chat opens */
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = KNOWLEDGE.greeting.answers[lang] || KNOWLEDGE.greeting.answers.da;
      setMessages([{ role: 'assistant', content: greeting, topic: 'greeting' }]);
    }
  }, [open, messages.length, lang]);

  /* Focus input when opening */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  /* Close language dropdown on outside click */
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-lang-dropdown]')) {
        setLangOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [langOpen]);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    /* Simulate Hadak "thinking" - varies by message length */
    const delay = 500 + Math.min(content.length * 15, 600) + Math.random() * 300;

    setTimeout(() => {
      const { content: answer, topic } = getAnswer(userMsg.content, lang);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, topic }]);
      setLastTopic(topic);
      setIsTyping(false);
    }, delay);
  };

  /* Quick suggestions based on context */
  const getSuggestions = (): TopicKey[] => {
    if (lastTopic && KNOWLEDGE[lastTopic]) {
      return KNOWLEDGE[lastTopic].followups.filter((f) => f in KNOWLEDGE).slice(0, 4);
    }
    return DEFAULT_SUGGESTIONS;
  };

  const suggestions = getSuggestions();

  return (
    <>
      {/* ============================= */}
      {/*  Floating chat bubble button   */}
      {/* ============================= */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="group fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-2xl"
        style={{
          background: open
            ? 'linear-gradient(135deg, #0d3f38 0%, #0a2e28 100%)'
            : 'linear-gradient(135deg, #eead59 0%, #d49934 100%)',
          boxShadow: open
            ? '0 8px 32px rgba(13, 63, 56, 0.4)'
            : '0 8px 32px rgba(238, 173, 89, 0.45)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? 'Close Hadak chat' : 'Open Hadak chat'}
      >
        {/* Pulsing ring when closed */}
        {!open && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: 'rgba(238, 173, 89, 0.35)' }}
              animate={{ scale: [1, 1.7, 1.7], opacity: [0.6, 0, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: 'rgba(238, 173, 89, 0.35)' }}
              animate={{ scale: [1, 1.7, 1.7], opacity: [0.6, 0, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
            />
          </>
        )}
        <motion.span
          key={open ? 'close' : 'open'}
          initial={{ rotate: -45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {open ? (
            <X className="h-7 w-7 text-[#eead59]" />
          ) : (
            <MessageCircle className="h-7 w-7 text-[#0d3f38] transition-transform duration-200 group-hover:rotate-12" />
          )}
        </motion.span>
      </motion.button>

      {/* ============================= */}
      {/*  Chat panel                    */}
      {/* ============================= */}
      <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-24 right-6 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[calc(100vw-3rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl shadow-2xl"
          style={{
            direction: isRtl ? 'rtl' : 'ltr',
            background: 'linear-gradient(180deg, #0d3f38 0%, #0a2e28 100%)',
            border: '1px solid rgba(238, 173, 89, 0.2)',
          }}
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        >
          {/* ---- Header ---- */}
          <div
            className="relative flex items-center gap-3 px-4 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(238, 173, 89, 0.12) 0%, transparent 100%)',
              borderBottom: '1px solid rgba(238, 173, 89, 0.15)',
            }}
          >
            {/* Avatar */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, #eead59 0%, #d49934 100%)',
                boxShadow: '0 4px 12px rgba(238, 173, 89, 0.3)',
              }}
            >
              <Sparkles className="h-5 w-5 text-[#0d3f38]" />
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Hadak
                <span className="text-xs font-normal text-[#eead59]">AI</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-white/60">
                  {lang === 'da' ? 'Hna l\'w9t dyalek' : lang === 'fr' ? 'Disponible' : lang === 'ar' ? 'متاح' : lang === 'es' ? 'Disponible' : 'Online'}
                </p>
              </div>
            </div>

            {/* Language selector */}
            <div className="relative" data-lang-dropdown>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLangOpen(!langOpen);
                }}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
                aria-label="Select language"
              >
                <span className="text-base leading-none">{LANG_FLAG[lang]}</span>
                <span className="hidden sm:inline">{LANG_LABELS[lang]}</span>
              </button>

              <AnimatePresence>
              {langOpen && (
                <motion.div
                  className="absolute end-0 mt-2 w-40 overflow-hidden rounded-xl shadow-xl"
                  style={{
                    background: '#0a2e28',
                    border: '1px solid rgba(238, 173, 89, 0.2)',
                  }}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  {ALL_LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLang(l);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                        l === lang ? 'bg-[#eead59]/15 text-[#eead59]' : 'text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base">{LANG_FLAG[l]}</span>
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>

          {/* ---- Messages area ---- */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(238,173,89,0.3) transparent' }}
          >
            {messages.map((msg, i) => {
              const Icon = msg.topic ? TOPIC_ICON[msg.topic] : null;
              return (
                <motion.div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5 me-2"
                      style={{ background: 'rgba(238, 173, 89, 0.15)' }}
                    >
                      {Icon ? (
                        <Icon className="h-3.5 w-3.5 text-[#eead59]" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-[#eead59]" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-[#0d3f38] font-medium'
                        : 'text-white/95'
                    }`}
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #eead59 0%, #d49934 100%)'
                          : 'rgba(255, 255, 255, 0.08)',
                      borderTopRightRadius: msg.role === 'user' ? '6px' : undefined,
                      borderTopLeftRadius: msg.role === 'assistant' ? '6px' : undefined,
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              );
            })}

            {/* ---- Typing indicator ---- */}
            <AnimatePresence>
            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5 me-2"
                  style={{ background: 'rgba(238, 173, 89, 0.15)' }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#eead59]" />
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-2xl px-5 py-3.5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderTopLeftRadius: '6px',
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full bg-[#eead59]"
                    style={{ animation: 'hadak-typing 1.2s infinite ease-in-out' }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-[#eead59]"
                    style={{ animation: 'hadak-typing 1.2s infinite ease-in-out', animationDelay: '0.2s' }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-[#eead59]"
                    style={{ animation: 'hadak-typing 1.2s infinite ease-in-out', animationDelay: '0.4s' }}
                  />
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* ---- Quick suggestion buttons ---- */}
          <AnimatePresence>
          {suggestions.length > 0 && !isTyping && (
            <motion.div
              className="flex flex-wrap gap-2 px-4 pb-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {suggestions.map((topic, idx) => {
                const Icon = TOPIC_ICON[topic];
                const label = TOPIC_LABELS[topic][lang] || TOPIC_LABELS[topic].da;
                return (
                  <motion.button
                    key={topic}
                    onClick={() => handleSend(label)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                    style={{
                      background: 'rgba(238, 173, 89, 0.1)',
                      border: '1px solid rgba(238, 173, 89, 0.25)',
                      color: '#eead59',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
          </AnimatePresence>

          {/* ---- Input area ---- */}
          <div
            className="p-3"
            style={{ borderTop: '1px solid rgba(238, 173, 89, 0.12)' }}
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  lang === 'da'
                    ? 'Sowlni ay haja...'
                    : lang === 'fr'
                    ? 'Pose-moi une question...'
                    : lang === 'ar'
                    ? 'اسألني أي شيء...'
                    : lang === 'es'
                    ? 'Pregúntame algo...'
                    : 'Ask me anything...'
                }
                className="flex-1 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/40 transition-colors focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(238, 173, 89, 0.15)',
                }}
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, #eead59 0%, #d49934 100%)',
                  boxShadow: '0 4px 12px rgba(238, 173, 89, 0.3)',
                }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4 text-[#0d3f38]" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ============================= */}
      {/*  Keyframe animations          */}
      {/* ============================= */}
      <style jsx>{`
        @keyframes hadak-typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(238, 173, 89, 0.3);
          border-radius: 2px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(238, 173, 89, 0.5);
        }
      `}</style>
    </>
  );
}
