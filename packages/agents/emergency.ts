import { AgentConfig, AgentResponse } from '../types/agent';

export class EmergencyAgent {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async processQuery(message: string): Promise<AgentResponse> {
    const { userId, lang, currentLocation } = this.config;

    // Detect emergency level
    const emergencyLevel = this.detectEmergencyLevel(message);

    if (emergencyLevel === 'critical') {
      return this.handleCriticalEmergency(message, currentLocation, lang);
    }

    if (emergencyLevel === 'high') {
      return this.handleUrgentSituation(message, currentLocation, lang);
    }

    if (emergencyLevel === 'medium') {
      return this.handleMedicalHelp(message, lang);
    }

    // Default: general help inquiry
    return {
      text: this.getDefaultMessage(lang),
      agent: 'EMERGENCY',
      confidence: 0.5,
      metadata: { queryType: 'help', emergencyLevel: 'low' },
      followups: [
        `Request nearest hospital`,
        `Ask for police contact information`,
        `Request embassy information`,
      ],
    };
  }

  private detectEmergencyLevel(message: string): 'critical' | 'high' | 'medium' | 'low' {
    const criticalKeywords = [
      'accident',
      'crash',
      'ambulance',
      'urgence',
      '911',
      'emergency',
      'mort',
      'death',
      'mort',
    ];
    const highKeywords = ['injured', 'blessé', 'bleeding', 'stolen', 'volé', 'lost', 'perdu'];
    const medicalKeywords = ['doctor', 'médecin', 'pharmacie', 'pharmacy', 'hospital', 'hôpital'];

    if (criticalKeywords.some((kw) => message.toLowerCase().includes(kw))) {
      return 'critical';
    }
    if (highKeywords.some((kw) => message.toLowerCase().includes(kw))) {
      return 'high';
    }
    if (medicalKeywords.some((kw) => message.toLowerCase().includes(kw))) {
      return 'medium';
    }
    return 'low';
  }

  private async handleCriticalEmergency(
    message: string,
    currentLocation: string | undefined,
    lang: string
  ): Promise<AgentResponse> {
    const emergencyNumbers = {
      Morocco: { police: '19', ambulance: '15', fire: '10' },
      France: { police: '17', ambulance: '15', fire: '18' },
      Spain: { police: '091', ambulance: '061', fire: '080' },
      UK: { police: '999', ambulance: '999', fire: '999' },
    };

    return {
      text: this.formatCriticalResponse(lang, currentLocation),
      agent: 'EMERGENCY',
      confidence: 0.95,
      metadata: {
        queryType: 'critical',
        emergencyLevel: 'critical',
        location: currentLocation,
        timestamp: new Date().toISOString(),
      },
      followups: [
        `Contact nearest emergency services`,
        `Notify your embassy`,
        `Share your location with family`,
      ],
    };
  }

  private async handleUrgentSituation(
    message: string,
    currentLocation: string | undefined,
    lang: string
  ): Promise<AgentResponse> {
    const situationType = this.detectUrgentType(message);

    return {
      text: this.formatUrgentResponse(situationType, lang, currentLocation),
      agent: 'EMERGENCY',
      confidence: 0.9,
      metadata: {
        queryType: 'urgent',
        emergencyLevel: 'high',
        situationType,
        location: currentLocation,
      },
      followups: [
        `Contact police for theft`,
        `Report loss to insurance`,
        `Get emergency travel documents`,
      ],
    };
  }

  private async handleMedicalHelp(message: string, lang: string): Promise<AgentResponse> {
    return {
      text: this.formatMedicalResponse(lang),
      agent: 'EMERGENCY',
      confidence: 0.85,
      metadata: { queryType: 'medical', emergencyLevel: 'medium' },
      followups: [
        `Find nearest hospital`,
        `Get pharmacy information`,
        `Request prescription help`,
      ],
    };
  }

  private detectUrgentType(message: string): string {
    if (message.toLowerCase().includes('stolen') || message.toLowerCase().includes('volé')) {
      return 'theft';
    }
    if (message.toLowerCase().includes('lost') || message.toLowerCase().includes('perdu')) {
      return 'lost';
    }
    if (message.toLowerCase().includes('injured') || message.toLowerCase().includes('blessé')) {
      return 'injury';
    }
    return 'other';
  }

  private formatCriticalResponse(lang: string, location?: string): string {
    const responses: Record<string, string> = {
      da: `🚨 EMERGENCY DETECTED! Contact local emergency services immediately:
⚠️ Your location appears to be: ${location || 'Unknown'}
🚗 Call 999 (International) or local emergency number
📍 Enable location sharing with emergency services
👨‍💼 Contact your embassy immediately
🆘 We're logging this incident`,
      fr: `🚨 URGENCE DÉTECTÉE! Contactez immédiatement les services d'urgence:
⚠️ Votre localisation: ${location || 'Inconnue'}
🚗 Appelez 999 (International) ou le numéro d'urgence local
📍 Partagez votre localisation avec les services d'urgence
👨‍💼 Contactez votre ambassade immédiatement
🆘 Nous enregistrons cet incident`,
      en: `🚨 EMERGENCY DETECTED! Contact local emergency services immediately:
⚠️ Your location: ${location || 'Unknown'}
🚗 Call 999 (International) or local emergency number
📍 Enable location sharing with emergency services
👨‍💼 Contact your embassy immediately
🆘 We're logging this incident`,
      ar: `🚨 تم اكتشاف حالة طارئة! اتصل بخدمات الطوارئ المحلية على الفور:
⚠️ موقعك: ${location || 'غير معروف'}
🚗 اتصل برقم 999 (دولي) أو رقم الطوارئ المحلي
📍 شارك موقعك مع خدمات الطوارئ
👨‍💼 اتصل بسفارتك على الفور
🆘 نحن نسجل هذا الحادث`,
      es: `🚨 ¡EMERGENCIA DETECTADA! Contacte inmediatamente a los servicios de emergencia:
⚠️ Su ubicación: ${location || 'Desconocida'}
🚗 Llame al 999 (Internacional) o al número local de emergencia
📍 Comparta su ubicación con los servicios de emergencia
👨‍💼 Contacte a su embajada inmediatamente
🆘 Estamos registrando este incidente`,
    };

    return responses[lang] || responses.en;
  }

  private formatUrgentResponse(
    situationType: string,
    lang: string,
    location?: string
  ): string {
    const theftText = {
      da: `⚠️ Your belongings were stolen. Here's what to do:
1. Contact local police immediately
2. File a police report (FIR/PV)
3. Notify your bank/credit card company
4. Contact your embassy if documents lost`,
      fr: `⚠️ Vos affaires ont été volées. Voici ce qu'il faut faire:
1. Contactez la police locale immédiatement
2. Déposez plainte (PV)
3. Prévenez votre banque/carte de crédit
4. Contactez votre ambassade si documents perdus`,
      en: `⚠️ Your belongings were stolen. Here's what to do:
1. Contact local police immediately
2. File a police report (FIR/PV)
3. Notify your bank/credit card company
4. Contact your embassy if documents lost`,
      ar: `⚠️ تم سرقة ممتلكاتك. إليك ما يجب فعله:
1. اتصل بالشرطة المحلية على الفور
2. قدم بلاغاً (محضر)
3. أخبر البنك / شركة بطاقتك الائتمانية
4. اتصل بسفارتك إذا فقدت المستندات`,
      es: `⚠️ Sus pertenencias fueron robadas. Aquí le decimos qué hacer:
1. Contacte a la policía local inmediatamente
2. Presente un informe de policía (FIR/PV)
3. Notifique a su banco/compañía de tarjeta de crédito
4. Contacte a su embajada si perdió documentos`,
    };

    const responses: Record<string, Record<string, string>> = {
      theft: theftText,
      lost: {
        da: `Lost item detected. Options:
1. Retrace your steps
2. Contact hotels/businesses you visited
3. Check with local lost & found
4. Consider replacing documents at embassy`,
        fr: `Objet perdu détecté. Options:
1. Retracez vos pas
2. Contactez les hôtels/commerces visités
3. Vérifiez auprès du service des objets trouvés
4. Envisagez de remplacer les documents à l'ambassade`,
        en: `Lost item detected. Options:
1. Retrace your steps
2. Contact hotels/businesses you visited
3. Check with local lost & found
4. Consider replacing documents at embassy`,
        ar: `تم اكتشاف فقدان عنصر. الخيارات:
1. تتبع خطواتك
2. اتصل بالفنادق / المحلات التي زرتها
3. تحقق من مكتب الأشياء الضائعة المحلي
4. فكر في استبدال المستندات بالسفارة`,
        es: `Objeto perdido detectado. Opciones:
1. Retrace sus pasos
2. Contacte a hoteles/negocios que visitó
3. Consulte con la oficina de objetos perdidos local
4. Considere reemplazar documentos en la embajada`,
      },
      injury: {
        da: `🏥 Injury reported. Please:
1. Seek immediate medical attention
2. Get documented medical report
3. Contact your travel insurance
4. Notify your embassy if serious`,
        fr: `🏥 Blessure signalée. Veuillez:
1. Consulter immédiatement un médecin
2. Obtenir un rapport médical documenté
3. Contactez votre assurance voyage
4. Prévenez votre ambassade si grave`,
        en: `🏥 Injury reported. Please:
1. Seek immediate medical attention
2. Get documented medical report
3. Contact your travel insurance
4. Notify your embassy if serious`,
        ar: `🏥 تم الإبلاغ عن إصابة. يرجى:
1. اطلب الرعاية الطبية الفورية
2. احصل على تقرير طبي موثق
3. اتصل بشركة保险 السفر الخاصة بك
4. أخبر سفارتك إذا كانت خطيرة`,
        es: `🏥 Lesión reportada. Por favor:
1. Busque atención médica inmediata
2. Obtenga un informe médico documentado
3. Contacte a su seguro de viaje
4. Notifique a su embajada si es grave`,
      },
    };

    const responseText = responses[situationType]?.[lang] || responses[situationType]?.en;
    return responseText || 'Help requested. Contact your embassy or local authorities.';
  }

  private formatMedicalResponse(lang: string): string {
    const responses: Record<string, string> = {
      da: `🏥 Medical assistance needed:
1. Nearest hospital/clinic
2. Pharmacy location
3. Doctor contact
4. Prescription help

Tell me your symptoms and location for more specific help.`,
      fr: `🏥 Assistance médicale nécessaire:
1. Hôpital/clinique le plus proche
2. Localisation pharmacie
3. Coordonnées médecin
4. Aide prescription

Dites-moi vos symptômes et localisation pour plus d'aide.`,
      en: `🏥 Medical assistance needed:
1. Nearest hospital/clinic
2. Pharmacy location
3. Doctor contact
4. Prescription help

Tell me your symptoms and location for more specific help.`,
      ar: `🏥 هناك حاجة للمساعدة الطبية:
1. أقرب مستشفى / عيادة
2. موقع الصيدلية
3. تفاصيل الطبيب
4. مساعدة الوصفة الطبية

أخبرني بأعراضك وموقعك لمزيد من المساعدة المحددة.`,
      es: `🏥 Asistencia médica necesaria:
1. Hospital/clínica más cercano
2. Ubicación de farmacia
3. Contacto del médico
4. Ayuda con receta

Cuénteme sus síntomas y ubicación para obtener ayuda más específica.`,
    };

    return responses[lang] || responses.en;
  }

  private getDefaultMessage(lang: string): string {
    const messages: Record<string, string> = {
      da: `Salam! Nshans n-emergency. Shlkum? Khanji tsaada?`,
      fr: `Bonjour! Agent d'urgence à votre service. Ça va? Avez-vous besoin d'aide?`,
      en: `Hello! Emergency agent here. Are you okay? Do you need help?`,
      ar: `مرحبا! وكيل الطوارئ هنا. هل أنت بخير؟ هل تحتاج إلى مساعدة؟`,
      es: `¡Hola! Agente de emergencia aquí. ¿Estás bien? ¿Necesitas ayuda?`,
    };
    return messages[lang] || messages.en;
  }
}
