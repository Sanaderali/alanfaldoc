import "server-only";
import { site } from "@/data/site";
import { AI_NAME } from "@/lib/ai";
import { getFaqGroups, getServices } from "@/lib/content";
import { readAll } from "@/lib/store";
import { cachedTranslation } from "@/lib/translate";

/**
 * The website's own answer library: answers everyday questions WITHOUT calling Groq (no tokens used).
 *   1. Everyday intents (hello, name, thanks, bye, services, hours, location, contact, cost, "are you there") in 11 languages.
 *   2. Retrieval: the visitor's question is matched against the FAQs, the service summaries and the answers the team approved,
 *      in the visitor's language whenever that text has already been translated (it reads the translation cache, never the AI).
 * Anything it is not sure about returns null, and the question goes to Groq (or to the team).
 */
export type LangCode = "en" | "ar" | "zh" | "hi" | "de" | "fr" | "ja" | "ko" | "it" | "es" | "nl";
export const LOCAL_LANGS: LangCode[] = ["en", "ar", "zh", "hi", "de", "fr", "ja", "ko", "it", "es", "nl"];
export type TemplateKey = "greet" | "howare" | "thanks" | "bye" | "who" | "services" | "hours" | "location" | "contact" | "price" | "late" | "ack" | "welcome" | "hold";

const T: Record<LangCode, Record<TemplateKey, string>> = {
  en: {
    greet: "Hi{n}! How can I help you today?",
    howare: "I'm doing well, thank you! How can I help you today?",
    thanks: "You're welcome! Is there anything else I can help you with?",
    bye: "Thank you for chatting with us. This conversation is recorded for quality, so please leave a quick rating when you close the chat. Have a great day!",
    who: "I'm {bot}, Al Anfal Doc's chat assistant. I can answer questions about our services or pass you to the team. What would you like to know?",
    services: "We help with company formation and trade licences, PRO services and government approvals, visas and Emirates ID (document preparation and application support), attestation and notary services, Ejari and bank account assistance. Which one are you interested in?",
    hours: "Our office hours are {hours} (Dubai time). You can write to us here any time and the team replies when the office is open.",
    location: "We are based in {address}. Tell me what you need and I can explain the next steps.",
    contact: "You can reach the team on {phone} (call or WhatsApp) or at {email}.",
    price: "The cost depends on the details of your case, such as the service, your nationality and the type of licence or visa. Tell me what you need and where you are based, and the team will prepare an exact quote for you.",
    late: "Sorry for the wait, I'm working on your question and will come back to you in a moment.",
    ack: "Great. Is there anything else I can help you with?",
    welcome: "Welcome back{n}! Good to hear from you again. How can I help you today?",
    hold: "I want to make sure you get the right answer, so I'm passing your question to our team and they will reply here shortly. If you like, leave your email or WhatsApp number so they can reach you.",
  },
  ar: {
    greet: "مرحبًا{n}! كيف يمكنني مساعدتك اليوم؟",
    howare: "أنا بخير، شكرًا لك! كيف يمكنني مساعدتك اليوم؟",
    thanks: "على الرحب والسعة! هل هناك شيء آخر يمكنني مساعدتك به؟",
    bye: "شكرًا لتواصلك معنا. هذه المحادثة مسجّلة لأغراض الجودة، فيُرجى ترك تقييم سريع عند إغلاق المحادثة. نتمنى لك يومًا سعيدًا!",
    who: "أنا {bot}، مساعد الدردشة في Al Anfal Doc. يمكنني الإجابة عن أسئلتك حول خدماتنا أو تحويلك إلى الفريق. بماذا تودّ أن تستفسر؟",
    services: "نساعد في تأسيس الشركات والرخص التجارية، وخدمات المعقّبين والموافقات الحكومية، والتأشيرات والهوية الإماراتية (إعداد المستندات ودعم الطلبات)، والتصديق وكاتب العدل، وإيجاري والمساعدة في فتح الحساب المصرفي. أيٌّ منها يهمّك؟",
    hours: "ساعات العمل لدينا: {hours} (بتوقيت دبي). يمكنك مراسلتنا هنا في أي وقت وسيرد الفريق عند افتتاح المكتب.",
    location: "مقرنا في {address}. أخبرني بما تحتاجه وسأشرح لك الخطوات التالية.",
    contact: "يمكنك التواصل مع الفريق على {phone} (اتصال أو واتساب) أو عبر {email}.",
    price: "تعتمد التكلفة على تفاصيل حالتك، مثل الخدمة وجنسيتك ونوع الرخصة أو التأشيرة. أخبرني بما تحتاجه وبلد إقامتك وسيعدّ الفريق عرض سعر دقيقًا لك.",
    late: "نعتذر عن الانتظار، أعمل على سؤالك وسأعود إليك خلال لحظات.",
    ack: "جميل. هل هناك شيء آخر يمكنني مساعدتك به؟",
    welcome: "أهلًا بعودتك{n}! يسعدنا تواصلك مجددًا. كيف يمكنني مساعدتك اليوم؟",
    hold: "أريد أن أتأكد من حصولك على الإجابة الصحيحة، لذا سأحوّل سؤالك إلى فريقنا وسيردّون هنا قريبًا. ويمكنك ترك بريدك الإلكتروني أو رقم واتساب ليتواصلوا معك.",
  },
  zh: {
    greet: "您好{n}!请问有什么可以帮您?",
    howare: "我很好,谢谢!请问有什么可以帮您?",
    thanks: "不客气!还有什么可以帮您的吗?",
    bye: "感谢您与我们交流。本次对话会被记录用于质量改进,关闭对话时请留下简短评价。祝您一天愉快!",
    who: "我是{bot},Al Anfal Doc 的在线助手。我可以回答有关我们服务的问题,也可以为您转接团队。您想了解什么?",
    services: "我们协助办理公司注册与营业执照、PRO 政府事务与审批、签证与阿联酋身份证(文件准备与申请支持)、认证与公证、Ejari 租赁登记以及银行开户协助。您对哪一项感兴趣?",
    hours: "我们的办公时间为{hours}(迪拜时间)。您可随时在此留言,办公时间内团队会回复您。",
    location: "我们位于{address}。告诉我您的需求,我可以为您说明后续步骤。",
    contact: "您可以拨打 {phone}(电话或 WhatsApp)或发送邮件至 {email} 联系团队。",
    price: "费用取决于您的具体情况,例如服务类型、国籍以及执照或签证类型。请告诉我您的需求和所在地,团队会为您提供准确报价。",
    late: "抱歉让您久等了,我正在处理您的问题,稍后回复您。",
    ack: "好的。还有什么可以帮您的吗?",
    welcome: "欢迎回来{n}!很高兴再次联系到您。今天有什么可以帮您?",
    hold: "为确保给您准确的答复,我会把您的问题转给团队,他们会很快在此回复您。您也可以留下邮箱或 WhatsApp 号码,方便团队联系您。",
  },
  hi: {
    greet: "नमस्ते{n}! आज मैं आपकी क्या सहायता करूँ?",
    howare: "मैं ठीक हूँ, धन्यवाद! आज मैं आपकी क्या सहायता करूँ?",
    thanks: "आपका स्वागत है! क्या मैं आपकी किसी और बात में सहायता करूँ?",
    bye: "हमसे बात करने के लिए धन्यवाद। यह बातचीत गुणवत्ता के लिए रिकॉर्ड की जाती है, इसलिए चैट बंद करते समय कृपया एक छोटी रेटिंग दें। आपका दिन शुभ हो!",
    who: "मैं {bot} हूँ, Al Anfal Doc का चैट सहायक। मैं हमारी सेवाओं के बारे में प्रश्नों के उत्तर दे सकता हूँ या आपको टीम से जोड़ सकता हूँ। आप क्या जानना चाहते हैं?",
    services: "हम कंपनी गठन और व्यापार लाइसेंस, PRO व सरकारी अनुमतियाँ, वीज़ा और अमीरात आईडी (दस्तावेज़ तैयारी और आवेदन सहायता), सत्यापन और नोटरी, एजारी (Ejari) और बैंक खाता खोलने में सहायता में मदद करते हैं। आपको किसमें रुचि है?",
    hours: "हमारे कार्यालय का समय {hours} (दुबई समय) है। आप यहाँ कभी भी संदेश भेज सकते हैं, कार्यालय खुलने पर टीम उत्तर देगी।",
    location: "हम {address} में स्थित हैं। आपको क्या चाहिए, बताइए, मैं अगले चरण समझा दूँगा।",
    contact: "आप टीम से {phone} (कॉल या WhatsApp) पर या {email} पर संपर्क कर सकते हैं।",
    price: "लागत आपके मामले के विवरण पर निर्भर करती है, जैसे सेवा, आपकी राष्ट्रीयता और लाइसेंस या वीज़ा का प्रकार। बताइए आपको क्या चाहिए और आप कहाँ रहते हैं, टीम आपके लिए सटीक कोटेशन तैयार करेगी।",
    late: "प्रतीक्षा के लिए क्षमा करें, मैं आपके प्रश्न पर काम कर रहा हूँ और थोड़ी देर में जवाब दूँगा।",
    ack: "बहुत बढ़िया। क्या मैं आपकी किसी और बात में सहायता करूँ?",
    welcome: "वापसी पर स्वागत है{n}! दोबारा बात करके अच्छा लगा। आज मैं आपकी क्या सहायता करूँ?",
    hold: "मैं यह सुनिश्चित करना चाहता हूँ कि आपको सही उत्तर मिले, इसलिए आपका प्रश्न हमारी टीम को भेज रहा हूँ, वे जल्द ही यहीं उत्तर देंगे। चाहें तो अपना ईमेल या WhatsApp नंबर छोड़ दें ताकि वे आपसे संपर्क कर सकें।",
  },
  de: {
    greet: "Hallo{n}! Wie kann ich Ihnen heute helfen?",
    howare: "Danke, mir geht es gut! Wie kann ich Ihnen heute helfen?",
    thanks: "Gern geschehen! Kann ich Ihnen noch bei etwas helfen?",
    bye: "Vielen Dank für das Gespräch. Dieser Chat wird zur Qualitätssicherung aufgezeichnet; bitte geben Sie beim Schließen des Chats kurz eine Bewertung ab. Einen schönen Tag noch!",
    who: "Ich bin {bot}, der Chat-Assistent von Al Anfal Doc. Ich beantworte Fragen zu unseren Leistungen oder verbinde Sie mit dem Team. Was möchten Sie wissen?",
    services: "Wir unterstützen bei Firmengründung und Gewerbelizenzen, PRO-Diensten und Behördengenehmigungen, Visa und Emirates ID (Dokumentenvorbereitung und Antragsunterstützung), Beglaubigungen und Notar, Ejari sowie bei der Kontoeröffnung. Wofür interessieren Sie sich?",
    hours: "Unsere Bürozeiten: {hours} (Dubai-Zeit). Sie können uns hier jederzeit schreiben; das Team antwortet, sobald das Büro geöffnet ist.",
    location: "Wir sind in {address}. Sagen Sie mir, was Sie brauchen, dann erkläre ich Ihnen die nächsten Schritte.",
    contact: "Sie erreichen das Team unter {phone} (Anruf oder WhatsApp) oder per E-Mail an {email}.",
    price: "Die Kosten hängen von Ihrem Fall ab, zum Beispiel von der Leistung, Ihrer Staatsangehörigkeit und der Art der Lizenz oder des Visums. Sagen Sie mir, was Sie brauchen und wo Sie ansässig sind, dann erstellt das Team ein genaues Angebot.",
    late: "Entschuldigung für die Wartezeit, ich bearbeite Ihre Frage und melde mich gleich bei Ihnen.",
    ack: "Sehr gut. Kann ich Ihnen noch bei etwas helfen?",
    welcome: "Willkommen zurück{n}! Schön, wieder von Ihnen zu hören. Wie kann ich Ihnen heute helfen?",
    hold: "Ich möchte sicherstellen, dass Sie die richtige Antwort bekommen, und gebe Ihre Frage deshalb an unser Team weiter; es antwortet in Kürze hier. Gern können Sie Ihre E-Mail-Adresse oder WhatsApp-Nummer hinterlassen.",
  },
  fr: {
    greet: "Bonjour{n} ! Comment puis-je vous aider aujourd'hui ?",
    howare: "Je vais bien, merci ! Comment puis-je vous aider aujourd'hui ?",
    thanks: "Je vous en prie ! Puis-je vous aider pour autre chose ?",
    bye: "Merci d'avoir échangé avec nous. Cette conversation est enregistrée à des fins de qualité ; merci de laisser une courte évaluation en fermant le chat. Bonne journée !",
    who: "Je suis {bot}, l'assistant de chat d'Al Anfal Doc. Je peux répondre à vos questions sur nos services ou vous passer à l'équipe. Que souhaitez-vous savoir ?",
    services: "Nous aidons pour la création de sociétés et les licences commerciales, les services PRO et autorisations administratives, les visas et l'Emirates ID (préparation des documents et aide aux demandes), les attestations et le notaire, Ejari et l'ouverture de compte bancaire. Lequel vous intéresse ?",
    hours: "Nos horaires : {hours} (heure de Dubaï). Vous pouvez nous écrire ici à tout moment ; l'équipe répond à l'ouverture du bureau.",
    location: "Nous sommes à {address}. Dites-moi ce dont vous avez besoin et je vous expliquerai les prochaines étapes.",
    contact: "Vous pouvez joindre l'équipe au {phone} (appel ou WhatsApp) ou par e-mail à {email}.",
    price: "Le coût dépend de votre situation : service, nationalité, type de licence ou de visa. Dites-moi ce dont vous avez besoin et où vous résidez, et l'équipe préparera un devis précis.",
    late: "Désolé pour l'attente, je m'occupe de votre question et reviens vers vous dans un instant.",
    ack: "Très bien. Puis-je vous aider pour autre chose ?",
    welcome: "Bon retour{n} ! Ravi de vous retrouver. Comment puis-je vous aider aujourd'hui ?",
    hold: "Je souhaite que vous obteniez la bonne réponse, je transmets donc votre question à notre équipe qui vous répondra ici sous peu. Vous pouvez laisser votre e-mail ou votre numéro WhatsApp.",
  },
  ja: {
    greet: "こんにちは{n}。本日はどのようなご用件でしょうか?",
    howare: "ありがとうございます、元気です。本日はどのようなご用件でしょうか?",
    thanks: "どういたしまして。他にお手伝いできることはございますか?",
    bye: "ご利用ありがとうございました。このチャットは品質向上のため記録されています。チャットを閉じる際に簡単な評価をお願いいたします。良い一日をお過ごしください。",
    who: "私は Al Anfal Doc のチャットアシスタント{bot}です。サービスに関するご質問にお答えしたり、担当チームにおつなぎしたりできます。何をお知りになりたいですか?",
    services: "会社設立・事業ライセンス、PRO・政府手続き、ビザとエミレーツID(書類準備と申請サポート)、認証・公証、Ejari、銀行口座開設のサポートをしております。どれにご興味がありますか?",
    hours: "営業時間は{hours}(ドバイ時間)です。いつでもこちらにメッセージをお送りいただければ、営業時間内にチームが返信いたします。",
    location: "所在地は{address}です。ご希望をお知らせいただければ、次のステップをご案内します。",
    contact: "チームへは {phone}(電話・WhatsApp)または {email} までご連絡ください。",
    price: "費用はサービスの種類、国籍、ライセンスやビザの種類など、お客様の状況によって異なります。ご希望の内容とお住まいの国をお知らせいただければ、チームが正確なお見積りを作成します。",
    late: "お待たせして申し訳ありません。ご質問を確認しておりますので、少々お待ちください。",
    ack: "承知しました。他にお手伝いできることはございますか?",
    welcome: "おかえりなさい{n}。またお話しできてうれしいです。本日はどのようなご用件でしょうか?",
    hold: "正確な回答をお届けするため、ご質問を担当チームに引き継ぎます。まもなくこちらで返信いたします。メールアドレスまたはWhatsApp番号をお知らせいただいても構いません。",
  },
  ko: {
    greet: "안녕하세요{n}! 오늘은 무엇을 도와드릴까요?",
    howare: "네, 잘 지내고 있습니다. 감사합니다! 오늘은 무엇을 도와드릴까요?",
    thanks: "천만에요! 더 도와드릴 일이 있을까요?",
    bye: "문의해 주셔서 감사합니다. 이 대화는 품질 관리를 위해 기록됩니다. 채팅을 닫을 때 간단한 평가를 남겨 주세요. 좋은 하루 되세요!",
    who: "저는 Al Anfal Doc의 채팅 도우미 {bot}입니다. 서비스에 대한 질문에 답하거나 담당 팀으로 연결해 드릴 수 있습니다. 무엇이 궁금하신가요?",
    services: "법인 설립 및 사업 라이선스, PRO 및 정부 승인, 비자와 에미레이트 ID(서류 준비 및 신청 지원), 인증·공증, Ejari, 은행 계좌 개설 지원을 도와드립니다. 어떤 것이 궁금하신가요?",
    hours: "업무 시간은 {hours}(두바이 시간)입니다. 언제든지 여기에 메시지를 남기시면 업무 시간에 팀이 답변드립니다.",
    location: "저희는 {address}에 있습니다. 필요하신 내용을 알려 주시면 다음 절차를 안내해 드리겠습니다.",
    contact: "팀에는 {phone}(전화 또는 WhatsApp) 또는 {email}로 연락하실 수 있습니다.",
    price: "비용은 서비스, 국적, 라이선스 또는 비자 종류 등 고객님의 상황에 따라 달라집니다. 필요하신 내용과 거주 국가를 알려 주시면 팀이 정확한 견적을 준비해 드립니다.",
    late: "기다리게 해서 죄송합니다. 문의하신 내용을 확인 중이며 곧 답변드리겠습니다.",
    ack: "알겠습니다. 더 도와드릴 일이 있을까요?",
    welcome: "다시 오신 것을 환영합니다{n}! 또 뵙게 되어 반갑습니다. 오늘은 무엇을 도와드릴까요?",
    hold: "정확한 답변을 드리기 위해 문의 내용을 담당 팀에 전달하겠습니다. 곧 이곳에서 답변드릴 것입니다. 원하시면 이메일 또는 WhatsApp 번호를 남겨 주세요.",
  },
  it: {
    greet: "Buongiorno{n}! Come posso aiutarla oggi?",
    howare: "Sto bene, grazie! Come posso aiutarla oggi?",
    thanks: "Prego! Posso aiutarla con qualcos'altro?",
    bye: "Grazie per aver chattato con noi. Questa conversazione viene registrata per la qualità: lasci una breve valutazione quando chiude la chat. Buona giornata!",
    who: "Sono {bot}, l'assistente chat di Al Anfal Doc. Posso rispondere alle domande sui nostri servizi o metterla in contatto con il team. Cosa desidera sapere?",
    services: "Aiutiamo con la costituzione di società e le licenze commerciali, i servizi PRO e le autorizzazioni, i visti e l'Emirates ID (preparazione dei documenti e supporto alle pratiche), attestazioni e notaio, Ejari e apertura del conto bancario. Cosa le interessa?",
    hours: "I nostri orari: {hours} (ora di Dubai). Può scriverci qui in qualsiasi momento; il team risponde quando l'ufficio è aperto.",
    location: "Siamo a {address}. Mi dica di cosa ha bisogno e le spiegherò i prossimi passi.",
    contact: "Può contattare il team al {phone} (chiamata o WhatsApp) o via e-mail a {email}.",
    price: "Il costo dipende dal suo caso: servizio, nazionalità, tipo di licenza o di visto. Mi dica di cosa ha bisogno e dove risiede, e il team preparerà un preventivo preciso.",
    late: "Mi scusi per l'attesa, sto lavorando alla sua domanda e le rispondo tra un attimo.",
    ack: "Perfetto. Posso aiutarla con qualcos'altro?",
    welcome: "Bentornato{n}! Fa piacere risentirla. Come posso aiutarla oggi?",
    hold: "Vorrei che ricevesse la risposta giusta, quindi passo la sua domanda al nostro team che risponderà qui a breve. Se vuole, lasci la sua e-mail o il numero WhatsApp.",
  },
  es: {
    greet: "¡Hola{n}! ¿En qué puedo ayudarle hoy?",
    howare: "¡Muy bien, gracias! ¿En qué puedo ayudarle hoy?",
    thanks: "¡De nada! ¿Puedo ayudarle con algo más?",
    bye: "Gracias por chatear con nosotros. Esta conversación se registra por motivos de calidad; deje una breve valoración al cerrar el chat. ¡Que tenga un buen día!",
    who: "Soy {bot}, el asistente de chat de Al Anfal Doc. Puedo responder preguntas sobre nuestros servicios o pasarle con el equipo. ¿Qué desea saber?",
    services: "Ayudamos con la constitución de empresas y licencias comerciales, servicios PRO y autorizaciones, visados y Emirates ID (preparación de documentos y apoyo en solicitudes), legalizaciones y notaría, Ejari y apertura de cuenta bancaria. ¿Cuál le interesa?",
    hours: "Nuestro horario: {hours} (hora de Dubái). Puede escribirnos aquí en cualquier momento; el equipo responde cuando la oficina está abierta.",
    location: "Estamos en {address}. Dígame qué necesita y le explicaré los siguientes pasos.",
    contact: "Puede contactar con el equipo en el {phone} (llamada o WhatsApp) o por correo en {email}.",
    price: "El coste depende de su caso: servicio, nacionalidad, tipo de licencia o visado. Dígame qué necesita y dónde reside, y el equipo preparará un presupuesto exacto.",
    late: "Disculpe la espera, estoy trabajando en su consulta y le respondo enseguida.",
    ack: "Perfecto. ¿Puedo ayudarle con algo más?",
    welcome: "¡Bienvenido de nuevo{n}! Me alegra saber de usted otra vez. ¿En qué puedo ayudarle hoy?",
    hold: "Quiero que reciba la respuesta correcta, así que paso su consulta a nuestro equipo, que responderá aquí en breve. Si lo desea, deje su correo o número de WhatsApp.",
  },
  nl: {
    greet: "Hallo{n}! Waarmee kan ik u vandaag helpen?",
    howare: "Goed, dank u! Waarmee kan ik u vandaag helpen?",
    thanks: "Graag gedaan! Kan ik u nog ergens mee helpen?",
    bye: "Bedankt voor uw bericht. Dit gesprek wordt voor kwaliteitsdoeleinden opgeslagen; laat bij het sluiten van de chat even een beoordeling achter. Een prettige dag!",
    who: "Ik ben {bot}, de chatassistent van Al Anfal Doc. Ik beantwoord vragen over onze diensten of verbind u door met het team. Wat wilt u weten?",
    services: "Wij helpen bij bedrijfsoprichting en handelsvergunningen, PRO-diensten en overheidsgoedkeuringen, visa en Emirates ID (documentvoorbereiding en ondersteuning bij aanvragen), legalisatie en notaris, Ejari en hulp bij het openen van een bankrekening. Waarin bent u geïnteresseerd?",
    hours: "Onze kantooruren: {hours} (Dubai-tijd). U kunt ons hier altijd schrijven; het team antwoordt zodra het kantoor open is.",
    location: "Wij zijn gevestigd in {address}. Vertel me wat u nodig hebt, dan leg ik de volgende stappen uit.",
    contact: "U kunt het team bereiken op {phone} (bellen of WhatsApp) of via {email}.",
    price: "De kosten hangen af van uw situatie: dienst, nationaliteit en het type vergunning of visum. Vertel me wat u nodig hebt en waar u woont, dan maakt het team een exacte offerte.",
    late: "Excuses voor het wachten, ik werk aan uw vraag en kom zo bij u terug.",
    ack: "Prima. Kan ik u nog ergens mee helpen?",
    welcome: "Welkom terug{n}! Fijn om u weer te spreken. Waarmee kan ik u vandaag helpen?",
    hold: "Ik wil dat u het juiste antwoord krijgt, daarom geef ik uw vraag door aan ons team; zij antwoorden hier binnenkort. U kunt ook uw e-mailadres of WhatsApp-nummer achterlaten.",
  },
};

const HOURS: Record<LangCode, string> = {
  en: "", // taken from data/site.ts
  ar: "الاثنين–الجمعة 9:00 ص – 6:30 م، السبت 8:30 ص – 3:30 م، الأحد مغلق",
  zh: "周一至周五 9:00-18:30,周六 8:30-15:30,周日休息",
  hi: "सोम-शुक्र 9:00 AM - 6:30 PM, शनिवार 8:30 AM - 3:30 PM, रविवार बंद",
  de: "Mo-Fr 9:00-18:30 Uhr, Sa 8:30-15:30 Uhr, So geschlossen",
  fr: "lun-ven 9h00-18h30, sam 8h30-15h30, dimanche fermé",
  ja: "月〜金 9:00〜18:30、土 8:30〜15:30、日曜休業",
  ko: "월~금 9:00~18:30, 토 8:30~15:30, 일요일 휴무",
  it: "lun-ven 9:00-18:30, sab 8:30-15:30, domenica chiuso",
  es: "lun-vie 9:00-18:30, sáb 8:30-15:30, domingo cerrado",
  nl: "ma-vr 9:00-18:30, za 8:30-15:30, zondag gesloten",
};

const SEP: Partial<Record<LangCode, string>> = { ar: " ", zh: " ", hi: " ", ja: " ", ko: " " };

/** a ready-to-send message in the visitor's language */
export function template(lang: string, key: TemplateKey, v: { name?: string } = {}): string {
  const l = (LOCAL_LANGS as string[]).includes(lang) ? (lang as LangCode) : "en";
  const first = (v.name ?? "").trim().split(/\s+/)[0];
  const n = first ? `${SEP[l] ?? ", "}${first}` : "";
  const hours = l === "en" ? site.hours.join(", ") : HOURS[l];
  return T[l][key].replace("{n}", n).replace("{bot}", AI_NAME).replace("{hours}", hours).replace("{address}", site.address).replace("{phone}", site.phone).replace("{email}", site.email);
}

/* ---------------- language ---------------- */

const CUES: [LangCode, RegExp][] = [
  ["es", /\b(hola|gracias|buenos|buenas|necesito|quiero|cuánto|cuanto|precio|servicios|empresa|visado|por favor|qué|cómo)\b/i],
  ["fr", /\b(bonjour|bonsoir|salut|merci|besoin|je voudrais|combien|prix|société|entreprise|s'il vous plaît|quels|comment|vous)\b/i],
  ["de", /\b(hallo|guten (tag|morgen|abend)|danke|ich (brauche|möchte|will)|wie viel|preis|kosten|firma|gründung|bitte|welche|wie)\b/i],
  ["it", /\b(ciao|buongiorno|buonasera|grazie|ho bisogno|vorrei|quanto|prezzo|società|azienda|per favore|quali|come)\b/i],
  ["nl", /\b(hallo|goedemorgen|goedemiddag|goedenavond|bedankt|dank u|ik heb|ik wil|hoeveel|prijs|bedrijf|alstublieft|welke|hoe)\b/i],
];
/** language of what the visitor wrote: script first (Arabic, Chinese, Japanese, Korean, Hindi), then telltale words, then the site language they chose */
export function detectLang(text: string, hint?: string): LangCode {
  if (/[؀-ۿ]/.test(text)) return "ar";
  if (/[぀-ヿ]/.test(text)) return "ja";
  if (/[가-힯]/.test(text)) return "ko";
  if (/[ऀ-ॿ]/.test(text)) return "hi";
  if (/[一-鿿]/.test(text)) return "zh";
  for (const [l, re] of CUES) if (re.test(text)) return l;
  return ((LOCAL_LANGS as string[]).includes(hint ?? "") ? hint : "en") as LangCode;
}

/* ---------------- everyday intents ---------------- */

const GREET = "hi|hello|hey|hiya|howdy|good (?:morning|afternoon|evening|day)|greetings|salam|assalam(?:u)? ?alaikum|مرحبا|مرحباً|اهلا|أهلا|أهلاً|السلام عليكم|صباح الخير|مساء الخير|hola|buenos (?:días|dias|tardes)|buenas|bonjour|salut|bonsoir|hallo|guten (?:tag|morgen|abend)|moin|ciao|buongiorno|buonasera|goedemorgen|goedemiddag|goedenavond|hoi|नमस्ते|नमस्कार|你好|您好|哈喽|こんにちは|こんばんは|おはよう|おはようございます|안녕하세요|안녕";
const RX = {
  greetOnly: new RegExp(`^(?:${GREET})(?: (?:there|team|everyone|all|sir|madam|friend|guys|al anfal|al anfal doc))?$`, "iu"),
  howare: /\b(how are you|how r u|how are u|how's it going|كيف حالك|cómo estás|como estas|comment ça va|comment vas-tu|wie geht'?s|wie geht es|come stai|hoe gaat het)\b|आप कैसे हैं|你好吗|お元気ですか|잘 지내/iu,
  thanks: /^(?:thanks|thank you|thank u|thx|ty|many thanks|thanks a lot|thank you very much|شكرا|شكراً|شكرا لك|شكرا جزيلا|gracias|muchas gracias|merci|merci beaucoup|danke|vielen dank|grazie|grazie mille|bedankt|dank u|dank je|धन्यवाद|शुक्रिया|谢谢|谢谢你|感謝|ありがとう|ありがとうございます|감사합니다|고맙습니다)(?: so much| a lot)?[!. ]*$/iu,
  bye: /^(?:bye|goodbye|good bye|see you|see ya|that'?s all|that is all|no thanks|no thank you|nothing else|i'?m good|مع السلامة|وداعا|adios|adiós|hasta luego|au revoir|à bientôt|tschüss|auf wiedersehen|arrivederci|tot ziens|अलविदा|再见|さようなら|안녕히 계세요|안녕히 가세요)[!. ]*$/iu,
  who: /\b(your name|who are you|who is this|who am i (?:talking|chatting)|are you (?:a )?(?:bot|robot|human|real|person))\b|ما اسمك|من أنت|cómo te llamas|quién eres|comment t'appelles|qui êtes-vous|wie heißt du|wie heißen sie|wer bist du|come ti chiami|chi sei|hoe heet je|wie ben je|आपका नाम|तुम्हारा नाम|你叫什么|你是谁|お名前|あなたは誰|이름이|누구세요/iu,
  services: /\b(what services|which services|services do you|your services|what do you (?:do|offer|provide|help)|what can you (?:do|help)|tell me about (?:your )?(?:services|company)|what is al anfal)\b|ما هي خدماتكم|خدماتكم|ماذا تقدمون|qué servicios|quels services|welche dienstleistungen|welche leistungen|che servizi|welke diensten|आपकी सेवाएं|आपकी सेवाएँ|你们提供什么|你们有什么服务|どんなサービス|어떤 서비스/iu,
  hours: /\b(working hours|opening hours|office hours|business hours|what time (?:do you|are you)|when (?:do you|are you) (?:open|close)|are you open|open on (?:friday|saturday|sunday))\b|ساعات العمل|متى تفتحون|horario|horaires|öffnungszeiten|orari di apertura|openingstijden|营业时间|営業時間|영업시간|कार्य समय/iu,
  location: /\b(where are you|your location|your address|office address|where is your office|where (?:is|are) (?:you|the office)|office location)\b|عنوانكم|أين مكتبكم|dónde están|adresse|wo sind sie|dove siete|waar zijn jullie|आपका पता|地址|住所|주소/iu,
  contact: /\b(phone number|contact number|contact details|your number|whatsapp(?: number)?|email address|your email|how (?:can|do) i (?:contact|reach)|how to contact|call you|number to call)\b|رقم الهاتف|رقم الواتساب|teléfono|téléphone|telefonnummer|numero di telefono|telefoonnummer|फोन नंबर|电话|電話番号|전화번호/iu,
  price: /\b(how much|price|prices|pricing|cost|costs|fee|fees|charges|charge|quote|quotation|rates|cheap|expensive)\b|كم (?:السعر|التكلفة)|سعر|تكلفة|cuánto cuesta|precio|combien|prix|tarif|wie viel|preis|kosten|quanto costa|prezzo|hoeveel|कीमत|कितना|多少钱|价格|費用|いくら|가격|비용/iu,
  late: /(?:^|\b)(are you there|anyone there|any one there|still there|still waiting|why (?:so )?(?:slow|late)|taking (?:so )?long|no reply|no response|respond please|reply please|hello\?+|hi\?+|\?\?+)(?:$|\b)|هل أنت هنا|هل من أحد|¿hay alguien|y a-t-il quelqu'un|ist da jemand|c'è qualcuno|is er iemand|कोई है|有人吗|誰かいますか|계세요/iu,
  ack: /^(?:ok|okay|k|kk|alright|all right|fine|sure|got it|understood|good|great|cool|nice|perfect|تمام|حسنا|حسناً|طيب|vale|d'accord|gut|va bene|goed|ठीक है|好的|わかりました|알겠습니다)[!. ]*$/iu,
};
const TOPIC = /\b(licen[cs]e|visa|company|formation|attest|ejari|bank|translation|poa|power of attorney|moa|memorandum|pro services|emirates id|golden|renewal|residence|labou?r|municipality|notary|insurance)\b/i;

export type Intent = "greet" | "howare" | "thanks" | "bye" | "who" | "services" | "hours" | "location" | "contact" | "price" | "late" | "ack";

const clean = (s: string) => s.trim().replace(/[‏‎]/g, "").replace(/\s+/g, " ");
const bare = (s: string) => clean(s).replace(/[!.,;:؟?¿¡'"()\-_~…،。！？]+$/gu, "").replace(/^[!.,;:¿¡'"()\-_~…،。！？]+/gu, "").trim();

/** the everyday intent of a short message, or null */
export function detectIntent(raw: string): Intent | null {
  const t = clean(raw);
  if (!t || t.length > 120) return null;
  const words = t.split(/\s+/).length;
  const b = bare(t);
  if (RX.late.test(t) && words <= 8) return "late";
  if (RX.greetOnly.test(b)) return "greet";
  if (RX.thanks.test(b)) return "thanks";
  if (RX.bye.test(b)) return "bye";
  if (RX.ack.test(b)) return "ack";
  if (words > 9) return null;
  if (RX.howare.test(t)) return "howare";
  if (RX.who.test(t)) return "who";
  if (RX.services.test(t)) return "services";
  if (RX.hours.test(t)) return "hours";
  if (RX.contact.test(t)) return "contact";
  if (RX.location.test(t)) return "location";
  if (RX.price.test(t) && words <= 7 && !TOPIC.test(t)) return "price";
  return null;
}

/* ---------------- retrieval ---------------- */

const STOP_EN = new Set("the a an is are was were do does did i you we can could would should to of in for on and or my your our it be will what how when where which who with me am if so as at by that this there any have has not no please".split(" "));
const LATIN: LangCode[] = ["en", "de", "fr", "it", "es", "nl"];

function tokens(text: string, lang: LangCode): string[] {
  let s = text.toLowerCase();
  if (lang === "ar") s = s.replace(/[ً-ٟـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
  if (LATIN.includes(lang)) s = s.normalize("NFD").replace(/\p{M}/gu, "");
  if (lang === "zh" || lang === "ja" || lang === "ko") {
    const out: string[] = [];
    for (const part of s.split(/[^\p{L}\p{N}]+/u)) {
      const chars = [...part];
      if (chars.length === 1) out.push(chars[0]);
      for (let i = 0; i < chars.length - 1; i++) out.push(chars[i] + chars[i + 1]);
    }
    return out;
  }
  let words = s.split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length > 1 || /\d/.test(w));
  if (lang === "ar") words = words.map((w) => (w.length > 3 && w.startsWith("ال") ? w.slice(2) : w));
  if (lang === "en") words = words.filter((w) => !STOP_EN.has(w)).map((w) => (w.length > 3 ? w.replace(/(ing|ed|es|s)$/, "") : w));
  return words;
}

type Doc = { q: string; a: string; kind: "faq" | "knowledge" | "service"; boost: number; qt: Set<string>; at: Set<string> };
type Index = { docs: Doc[]; idf: Map<string, number>; at: number };
const cache = new Map<string, Index>();

async function buildIndex(lang: LangCode): Promise<Index> {
  const hit = cache.get(lang);
  if (hit && Date.now() - hit.at < 15_000) return hit;
  const [groups, services, knowledge] = await Promise.all([getFaqGroups(), getServices(), readAll("knowledge")]);
  const tr = async (t: string) => (lang === "en" ? t : await cachedTranslation(lang, t));
  const raw: { q: string; a: string; kind: Doc["kind"]; boost: number }[] = [];
  for (const g of groups) for (const f of g.faqs) raw.push({ q: f.question, a: f.answer, kind: "faq", boost: 1 });
  for (const s of services) {
    for (const f of s.faqs ?? []) raw.push({ q: f.question, a: f.answer, kind: "faq", boost: 1 });
    raw.push({ q: s.title, a: `${s.summary} ${site.url}/services/${s.slug}`.trim(), kind: "service", boost: 0.9 });
  }
  const docs: Doc[] = [];
  for (const r of raw) {
    const q = await tr(r.q);
    if (!q) continue; // not translated yet: this question cannot be matched in this language
    const base = r.kind === "service" ? r.a.replace(/ https?:\/\/\S+$/, "") : r.a;
    const a = await tr(base);
    if (!a) continue;
    docs.push({ q, a: r.kind === "service" ? `${a} ${site.url}/services/${r.a.split("/services/")[1]}` : a, kind: r.kind, boost: r.boost, qt: new Set(tokens(q, lang)), at: new Set(tokens(a, lang)) });
  }
  for (const k of knowledge as { status?: string; question: string; answer: string }[]) {
    if (k.status === "draft" || detectLang(k.question) !== lang) continue; // approved answers are used in the language they were written in
    docs.push({ q: k.question, a: k.answer, kind: "knowledge", boost: 1.15, qt: new Set(tokens(k.question, lang)), at: new Set(tokens(k.answer, lang)) });
  }
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set([...d.qt, ...d.at])) df.set(t, (df.get(t) ?? 0) + 1);
  const idf = new Map<string, number>();
  for (const [t, n] of df) idf.set(t, Math.log(1 + docs.length / (1 + n)));
  const idx = { docs, idf, at: Date.now() };
  cache.set(lang, idx);
  return idx;
}

/** the visitor describes their own situation (needs a real conversation, not a library answer) */
export function looksPersonal(text: string): boolean {
  return /\b(i am|i'm|im|i live|i have|i want to|i need to|i would like|we are|we're|we have|my name is|from (?:india|pakistan|uk|usa|china|germany|france|canada|australia|saudi|dubai|sharjah))\b/i.test(text) || /[\w.+-]+@[\w-]+\.[\w.]+/.test(text) || /\+?\d[\d\s-]{8,}/.test(text);
}

export type LocalResult = { text: string; kind: "intent" | "faq" | "service" | "knowledge"; intent?: Intent };

/** Answer from our own library, or null when it is not confident (then Groq or the team takes over). */
export async function localReply(raw: string, opts: { lang?: string; name?: string } = {}): Promise<LocalResult | null> {
  const text = clean(raw);
  if (!text) return null;
  const lang = detectLang(text, opts.lang);
  const intent = detectIntent(text);
  if (intent) {
    const key: TemplateKey = intent === "greet" ? "greet" : intent;
    return { text: template(lang, key, { name: opts.name }), kind: "intent", intent };
  }
  // a longer message that describes the visitor's own case goes to the conversation, not to the library
  if (looksPersonal(text) || text.length > 160) return null;
  const idx = await buildIndex(lang);
  const q = [...new Set(tokens(text, lang))];
  if (q.length === 0 || idx.docs.length === 0) return null;
  const idf = (t: string) => idx.idf.get(t) ?? Math.log(1 + idx.docs.length);
  const total = q.reduce((n, t) => n + idf(t), 0);
  const scored = idx.docs.map((d) => {
    let mq = 0, ma = 0;
    for (const t of q) { if (d.qt.has(t)) mq += idf(t); else if (d.at.has(t)) ma += idf(t); }
    const qtw = [...d.qt].reduce((n, t) => n + idf(t), 0) || 1;
    const covered = [...d.qt].filter((t) => q.includes(t)).reduce((n, t) => n + idf(t), 0);
    const coverage = (mq + 0.3 * ma) / total;
    const precision = covered / qtw;
    return { d, mq, score: (0.7 * coverage + 0.3 * precision) * d.boost };
  }).sort((a, b) => b.score - a.score);
  const best = scored[0], second = scored[1];
  if (!best || best.mq <= 0) return null;
  const matchedQ = q.filter((t) => best.d.qt.has(t)).length;
  if (best.score < 0.5 || (matchedQ < 2 && q.length > 1)) return null;
  // two different topics scoring alike = ambiguous; two phrasings of the same question are fine
  if (second && best.score - second.score < 0.04) {
    const inter = [...best.d.qt].filter((t) => second.d.qt.has(t)).length;
    const union = new Set([...best.d.qt, ...second.d.qt]).size || 1;
    if (inter / union < 0.5) return null;
  }
  return { text: best.d.a.slice(0, 700), kind: best.d.kind };
}

/* ---------------- small helpers used by the chat routes ---------------- */

/** digits only, so +971 50 805 1192 and 00971508051192 match */
export const normalizePhone = (p: string) => p.replace(/\D/g, "").replace(/^00/, "").slice(-12);

/** a question key for the daily record (null = not a question worth recording) */
export function questionKey(text: string, lang: LangCode): string | null {
  if (detectIntent(text)) return null;
  const t = [...new Set(tokens(text, lang))].filter((w) => w.length > 2).sort();
  return t.length >= 2 ? t.slice(0, 10).join(" ") : null;
}

/** remove e-mail addresses and phone numbers before a question is stored */
export const scrubPII = (s: string) => s.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]").replace(/\+?\d[\d\s().-]{7,}\d/g, "[number]").slice(0, 200);
