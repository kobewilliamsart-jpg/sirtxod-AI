import { VoiceModel } from '../types/tts';

export interface LocalizedVoiceMeta {
  gender: 'Female' | 'Male' | 'Neutral';
  localizedGender: string;
  localizedAge: string;
  accent: string;
  description: string;
  sampleText: string;
  tags: string[];
}

export interface CalibrationSnippet {
  id: string;
  title: string;
  text: string;
  focus: string;
}

// Translations per language code (prefix-matched, e.g., 'es' covers 'es-ES' and 'es-MX')
export const VOICE_LOCALIZATIONS: Record<string, Record<string, LocalizedVoiceMeta>> = {
  en: {
    Kore: {
      gender: 'Female',
      localizedGender: 'Female',
      localizedAge: 'Adult',
      accent: 'Neutral International',
      description: 'Warm, articulate, balanced, and remarkably natural. Superb for storytelling, audiobooks, and customer communication.',
      sampleText: 'Welcome to sirtxod-AI. Every phrase you craft is transformed with neural precision and natural acoustic warmth.',
      tags: ['Warm', 'Articulate', 'Storytelling', 'Balanced', 'Popular'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'Male',
      localizedAge: 'Young',
      accent: 'Vibrant Dynamic',
      description: 'Energetic, engaging, and dynamic. Ideal for commercials, podcasts, YouTube narrations, and upbeat social media content.',
      sampleText: 'Hey everyone! This is sirtxod-AI. Ready to take your audio production to the next level?',
      tags: ['Energetic', 'Dynamic', 'Commercial', 'Podcast', 'Youthful'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'Male',
      localizedAge: 'Mature',
      accent: 'Rich Baritone',
      description: 'Authoritative, resonant, deep, and cinematic. Perfect for documentary voiceovers, trailers, drama, and formal announcements.',
      sampleText: 'In a world shaped by innovation, the human voice remains our most profound instrument.',
      tags: ['Authoritative', 'Deep', 'Cinematic', 'Documentary', 'Baritone'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'Female',
      localizedAge: 'Young',
      accent: 'Soft & Serene',
      description: 'Soothing, gentle, calm, and intimate. Outstanding for meditation guides, ASMR, sleep stories, and ambient narrations.',
      sampleText: 'Take a deep breath. Allow your mind to settle into this moment of calm and clarity.',
      tags: ['Calm', 'Soothing', 'Meditation', 'Gentle', 'Intimate'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'Male',
      localizedAge: 'Mature',
      accent: 'Distinguished Executive',
      description: 'Scholarly, distinguished, trustworthy, and refined. Ideal for e-learning, technical whitepapers, news summaries, and executive presentations.',
      sampleText: 'Analysis shows that neural speech synthesis achieves unprecedented phonetic realism across multilingual domains.',
      tags: ['Refined', 'Executive', 'Scholarly', 'Trustworthy', 'News'],
    },
  },

  es: {
    Kore: {
      gender: 'Female',
      localizedGender: 'Femenino',
      localizedAge: 'Adulta',
      accent: 'Español Neutro Internacional',
      description: 'Cálida, articulada, equilibrada y notablemente natural. Excelente para narraciones, audiolibros y comunicación corporativa.',
      sampleText: 'Bienvenido a sirtxod-AI. Cada frase que escribes se transforma con precisión neuronal y una calidez acústica totalmente natural.',
      tags: ['Cálida', 'Articulada', 'Narración', 'Equilibrada', 'Popular'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'Masculino',
      localizedAge: 'Joven',
      accent: 'Dinámico y Enérgico',
      description: 'Enérgico, cercano y vibrante. Ideal para comerciales, podcasts, videos de YouTube y contenido dinámico en redes sociales.',
      sampleText: '¡Hola a todos! Esto es sirtxod-AI. ¿Listos para llevar sus producciones de audio al siguiente nivel?',
      tags: ['Enérgico', 'Dinámico', 'Comercial', 'Podcast', 'Juvenil'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'Masculino',
      localizedAge: 'Maduro',
      accent: 'Barítono Profundo',
      description: 'Autoritario, resonante, solemne y cinematográfico. Perfecto para documentales, tráilers, locuciones dramáticas y anuncios oficiales.',
      sampleText: 'En un mundo forjado por la innovación constante, la voz humana sigue siendo nuestro instrumento más profundo.',
      tags: ['Autoritario', 'Profundo', 'Cinematográfico', 'Documental', 'Barítono'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'Femenino',
      localizedAge: 'Joven',
      accent: 'Suave y Sereno',
      description: 'Calmante, delicada y envolvente. Excepcional para guías de meditación, historias para dormir, relajación y locuciones íntimas.',
      sampleText: 'Inhala profundamente por la nariz. Permite que tu mente repose en este instante de calma y serenidad absoluta.',
      tags: ['Calmante', 'Suave', 'Meditación', 'Delicada', 'Íntima'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'Masculino',
      localizedAge: 'Maduro',
      accent: 'Ejecutivo y Distinguido',
      description: 'Académico, confiable, sobrio y refinado. Ideal para e-learning, artículos científicos, resúmenes informativos y discursos corporativos.',
      sampleText: 'El análisis confirma que la síntesis de voz neuronal alcanza un realismo fonético sin precedentes en todos los idiomas.',
      tags: ['Refinado', 'Ejecutivo', 'Académico', 'Confiable', 'Noticias'],
    },
  },

  fr: {
    Kore: {
      gender: 'Female',
      localizedGender: 'Féminin',
      localizedAge: 'Adulte',
      accent: 'Français Neutre et Équilibré',
      description: 'Chaleureuse, articulée, fluide et remarquablement naturelle. Idéale pour les récits, les livres audio et la communication professionnelle.',
      sampleText: 'Bienvenue sur sirtxod-AI. Chaque phrase est transformée avec une précision neuronale et une chaleur acoustique d’un naturel absolu.',
      tags: ['Chaleureuse', 'Articulée', 'Livre audio', 'Équilibrée', 'Populaire'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'Masculin',
      localizedAge: 'Jeune',
      accent: 'Dynamique et Rythmé',
      description: 'Énergique, enthousiaste et captivant. Parfait pour les publicités, les podcasts, les vidéos modernes et les réseaux sociaux.',
      sampleText: 'Salut à tous ! Ici sirtxod-AI. Prêt à propulser vos créations audio vers une toute nouvelle dimension ?',
      tags: ['Énergique', 'Dynamique', 'Publicité', 'Podcast', 'Jeune'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'Masculin',
      localizedAge: 'Mûr',
      accent: 'Baryton Profond et Puissant',
      description: 'Autoritaire, résonant, solennel et cinématographique. Idéal pour les documentaires, bandes-annonces et narrations historiques.',
      sampleText: 'Dans un monde façonné par l’innovation, la voix humaine demeure notre instrument d’expression le plus profond.',
      tags: ['Autoritaire', 'Grave', 'Cinématique', 'Documentaire', 'Baryton'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'Féminin',
      localizedAge: 'Jeune',
      accent: 'Doux et Apaisant',
      description: 'Apaisante, délicate, intime et relaxante. Recommandée pour la méditation guidée, la relaxation et les récits du soir.',
      sampleText: 'Respirez profondément. Laissez votre esprit s’installer dans ce moment précieux de calme et de sérénité.',
      tags: ['Calme', 'Apaisant', 'Méditation', 'Doux', 'Intime'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'Masculin',
      localizedAge: 'Mûr',
      accent: 'Élégant et Institutionnel',
      description: 'Distingué, rigoureux, académique et rassurant. Recommandé pour l’e-learning, la vulgarisation scientifique et les discours institutionnels.',
      sampleText: 'Les analyses démontrent que la synthèse vocale neuronale atteint un réalisme acoustique inédit dans toutes les langues.',
      tags: ['Élégant', 'Cadre', 'Académique', 'Crédible', 'Information'],
    },
  },

  de: {
    Kore: {
      gender: 'Female',
      localizedGender: 'Weiblich',
      localizedAge: 'Erwachsen',
      accent: 'Hochdeutsch Natürlich',
      description: 'Warm, artikuliert, ausgewogen und bemerkenswert natürlich. Ideal für Hörbücher, Storytelling und anspruchsvolle Kundenansprache.',
      sampleText: 'Willkommen bei sirtxod-AI. Jeder geschriebene Satz verwandelt sich mit neuronaler Präzision in lebendige, warme Sprachklänge.',
      tags: ['Warm', 'Artikuliert', 'Hörbuch', 'Ausgewogen', 'Beliebt'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'Männlich',
      localizedAge: 'Jung',
      accent: 'Dynamisch und Lebendig',
      description: 'Energiegeladen, motivierend und mitreißend. Perfekt für Werbespots, Podcasts, YouTube und moderne Social-Media-Inhalte.',
      sampleText: 'Hallo zusammen! Hier ist sirtxod-AI. Bereit, deine Audioproduktion auf ein völlig neues Level zu heben?',
      tags: ['Dynamisch', 'Lebendig', 'Werbung', 'Podcast', 'Jung'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'Männlich',
      localizedAge: 'Reif',
      accent: 'Tiefer Bariton',
      description: 'Autoritär, resonant, tief und filmreif. Hervorragend geeignet für Dokumentationen, Filmtrailer und feierliche Ansagen.',
      sampleText: 'In einer von rasanter Innovation geprägten Welt bleibt die menschliche Stimme unser tiefgründigstes Instrument.',
      tags: ['Autoritär', 'Tief', 'Filmmusik', 'Dokumentation', 'Bariton'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'Weiblich',
      localizedAge: 'Jung',
      accent: 'Sanft und Beruhigend',
      description: 'Beruhigend, feinfühlig und intim. Perfekt für Meditationsanleitungen, Schlafgeschichten und Achtsamkeitsübungen.',
      sampleText: 'Atme tief ein. Schenke deinen Gedanken einen Moment vollkommener Ruhe, Ausgeglichenheit und Klarheit.',
      tags: ['Ruhig', 'Beruhigend', 'Meditation', 'Sanft', 'Intim'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'Männlich',
      localizedAge: 'Reif',
      accent: 'Souverän und Präzise',
      description: 'Akademisch, vertrauenswürdig, prägnant und elegant. Bestens geeignet für E-Learning, Fachbeiträge und Nachrichten.',
      sampleText: 'Analysen belegen, dass neuronale Sprachsynthese einen bisher unerreichten phonetischen Realismus erzielt.',
      tags: ['Souverän', 'Präzise', 'Wissenschaftlich', 'Vertrauenswürdig', 'Nachrichten'],
    },
  },

  it: {
    Kore: {
      gender: 'Female',
      localizedGender: 'Femminile',
      localizedAge: 'Adulta',
      accent: 'Italiano Neutro Naturale',
      description: 'Calda, espressiva, equilibrata e straordinariamente naturale. Ideale per narrazioni, audiolibri e doppiaggio professionale.',
      sampleText: 'Benvenuti su sirtxod-AI. Ogni frase prende vita con precisione neurale e una naturalezza acustica senza precedenti.',
      tags: ['Calda', 'Espressiva', 'Audiolibri', 'Equilibrata', 'Popolare'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'Maschile',
      localizedAge: 'Giovane',
      accent: 'Vivace e Brillante',
      description: 'Frizzante, coinvolgente e solare. Perfetto per pubblicità, podcast, canali YouTube e contenuti per i social media.',
      sampleText: 'Ciao a tutti! Questo è sirtxod-AI. Siete pronti a rivoluzionare la vostra produzione audio?',
      tags: ['Vivace', 'Dinamico', 'Spot', 'Podcast', 'Giovane'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'Maschile',
      localizedAge: 'Maturo',
      accent: 'Baritono Profondo',
      description: 'Autorevole, solenne, profondo e cinematografico. Magnifico per documentari d’autore, trailer e annunci epici.',
      sampleText: 'In un mondo plasmato dall’innovazione continua, la voce umana rimane il nostro strumento più intimo e potente.',
      tags: ['Autorevole', 'Profondo', 'Epico', 'Documentari', 'Baritono'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'Femminile',
      localizedAge: 'Giovane',
      accent: 'Dolce e Rilassante',
      description: 'Morbida, soave e intima. Progettata appositamente per meditazioni guidate, percorsi di rilassamento e fiabe della buonanotte.',
      sampleText: 'Fai un respiro profondo. Lascia che la tua mente trovi la calma e la quiete di questo momento presente.',
      tags: ['Rilassante', 'Dolce', 'Meditazione', 'Soave', 'Intima'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'Maschile',
      localizedAge: 'Maturo',
      accent: 'Raffinato ed Istituzionale',
      description: 'Colto, rassicurante, professionale e distinto. Ideale per formazione aziendale, notiziari ed esposizioni scientifiche.',
      sampleText: 'Le ricerche dimostrano che la sintesi vocale neurale garantisce una naturalezza fonetica perfetta in tutte le lingue.',
      tags: ['Raffinato', 'Professionale', 'Istituzionale', 'Credibile', 'News'],
    },
  },

  pt: {
    Kore: {
      gender: 'Female',
      localizedGender: 'Feminino',
      localizedAge: 'Adulta',
      accent: 'Português Neutro e Articulado',
      description: 'Calorosa, articulada, equilibrada e incrivelmente natural. Perfeita para audiolivros, narração de vídeos e atendimento.',
      sampleText: 'Bem-vindo ao sirtxod-AI. Cada frase digitada ganha vida com precisão neural e uma acústica calorosa e autêntica.',
      tags: ['Calorosa', 'Articulada', 'Audiolivro', 'Equilibrada', 'Popular'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'Masculino',
      localizedAge: 'Jovem',
      accent: 'Dinâmico e Contagiante',
      description: 'Enérgico, carismático e vibrante. Ideal para podcasts, anúncios publicitários, tutoriais e mídias sociais.',
      sampleText: 'E aí, pessoal! Aqui é o sirtxod-AI. Prontos para transformar suas produções de voz com tecnologia de ponta?',
      tags: ['Enérgico', 'Dinâmico', 'Comercial', 'Podcast', 'Jovem'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'Masculino',
      localizedAge: 'Maduro',
      accent: 'Barítono Envolvente',
      description: 'Marcante, firme, profundo e cinematográfico. Excelente para trailers, documentários e narrações dramáticas.',
      sampleText: 'Em um mundo transformado pela tecnologia, a voz humana continua sendo nosso instrumento mais expressivo.',
      tags: ['Autoritário', 'Grave', 'Cinematográfico', 'Documentário', 'Barítono'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'Feminino',
      localizedAge: 'Jovem',
      accent: 'Suave e Aconchegante',
      description: 'Tranquila, doce e acolhedora. Sob medida para meditações guiadas, histórias relaxantes e mensagens inspiradoras.',
      sampleText: 'Inspire suavemente pelo nariz. Permita que sua mente encontre um refúgio de paz, equilíbrio e serenidade.',
      tags: ['Calma', 'Aconchegante', 'Meditação', 'Doce', 'Íntima'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'Masculino',
      localizedAge: 'Maduro',
      accent: 'Executivo e Confiável',
      description: 'Erudito, confiável, focado e requintado. Ideal para e-learning corporativo, relatórios, palestras e notícias.',
      sampleText: 'Dados analíticos comprovam que os modelos neurais reproduzem com precisão a cadência e fonética natural da fala.',
      tags: ['Erudito', 'Executivo', 'Confiável', 'Notícias', 'Didático'],
    },
  },

  ja: {
    Kore: {
      gender: 'Female',
      localizedGender: '女性',
      localizedAge: '成人',
      accent: '標準日本語・自然で明瞭',
      description: '温かみがあり、明瞭で自然な語り口。オーディオブック、朗読、企業のナレーションに最適です。',
      sampleText: 'sirtxod-AIへようこそ。入力された言葉をニューラルの高精度と自然な温かみで音声へと変換します。',
      tags: ['温かみ', '明瞭', '朗読', 'バランス重視', '人気モデル'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: '男性',
      localizedAge: '青年',
      accent: '活気あるエネルギッシュなトーン',
      description: '元気で親しみやすくダイナミック。YouTube、ポッドキャスト、プロモーション動画に最適です。',
      sampleText: '皆さん、こんにちは！sirtxod-AIで最高品質の音声制作を今すぐ体験しましょう。',
      tags: ['元気', 'アクティブ', '広告向け', 'ポッドキャスト', '若々しい'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: '男性',
      localizedAge: '重厚',
      accent: '深みのある重厚なバリトン',
      description: '重厚で威厳に満ちたシネマティックボイス。ドキュメンタリー、映画予告、ドラマのナレーションに最適。',
      sampleText: '技術革新が世界を変える今、人間の声こそがもっとも深遠なる表現の力です。',
      tags: ['重厚', '威厳', '映画的', 'ドキュメンタリー', '低音'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: '女性',
      localizedAge: '若年',
      accent: '優しく穏やかなヒーリングトーン',
      description: '安らぎを与える穏やかで繊細な声。瞑想、睡眠導入、リラクゼーションに特化しています。',
      sampleText: 'ゆっくりと深呼吸をしてください。この静寂のひとときに、心と体をゆったりと委ねましょう。',
      tags: ['穏やか', '癒やし', '瞑想', 'ささやき', '優しい'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: '男性',
      localizedAge: '熟練',
      accent: '知性的で洗練された語り口',
      description: '知性的で信頼感にあふれた語り。Eラーニング、ニュース解説、学術・ビジネス発表に推奨。',
      sampleText: '最新のニューラル音声合成は、極めて高精度な音響リアリズムと自然な発音を実現します。',
      tags: ['知性的', '信頼感', '教育向け', 'ビジネス', 'ニュース'],
    },
  },

  zh: {
    Kore: {
      gender: 'Female',
      localizedGender: '女性',
      localizedAge: '成年',
      accent: '标准普通话・温和明晰',
      description: '音色温润、吐字清晰、韵律自然平衡。极度适用于有声书演播、纪录解说与企业宣传。',
      sampleText: '欢迎使用 sirtxod-AI。每一句文本都将以神经网络的超高精度与自然声学质感生动呈现。',
      tags: ['温润', '清晰', '有声读物', '均衡', '高人气'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: '男性',
      localizedAge: '青年',
      accent: '热情充满活力',
      description: '充满朝气、亲和力强且极富节奏感。专为短视频、播客开场、商业广告量身打造。',
      sampleText: '大家好！这里是 sirtxod-AI，准备好开启全新的高品质音频创作体验了吗？',
      tags: ['活力', '动感', '广告宣发', '播客', '朝气'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: '男性',
      localizedAge: '沉稳成熟',
      accent: '浑厚电影质感低音',
      description: '雄浑庄重、穿透力强且极具叙事张力。特别推荐影视大片预告、历史纪实与深度讲演。',
      sampleText: '在科技创新的浪潮中，人类的声音始终是最富感染力与温度的表达乐章。',
      tags: ['浑厚', '沉稳', '电影感', '纪录片', '男低音'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: '女性',
      localizedAge: '青年',
      accent: '柔和舒缓疗愈',
      description: '轻柔安宁、耳语般细腻动听。非常适合冥想正念、助眠故事与心灵慰藉播音。',
      sampleText: '请轻轻闭上双眼，深吸一口气，让心灵在这一刻重获恬静、平和与舒展。',
      tags: ['柔和', '舒缓', '冥想正念', '疗愈', '轻声'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: '男性',
      localizedAge: '资深',
      accent: '沉着专业播音腔',
      description: '典雅睿智、严谨权威、值得信赖。适合线上课程教育、行业白皮书解读与高端政企汇报。',
      sampleText: '权威数据表明，神经网络语音合成在多语种声学特征与音素还原上已取得突破性进展。',
      tags: ['典雅', '专业', '学术教育', '权威信赖', '新闻播音'],
    },
  },

  ko: {
    Kore: {
      gender: 'Female',
      localizedGender: '여성',
      localizedAge: '성인',
      accent: '표준 한국어・따뜻하고 명확함',
      description: '따뜻하고 발음이 명확하며 자연스러운 톤. 오디오북, 낭독, 고객 안내에 매우 적합합니다.',
      sampleText: 'sirtxod-AI에 오신 것을 환영합니다. 입력하신 문장이 뉴럴 정밀도와 따뜻한 음색으로 변환됩니다.',
      tags: ['따뜻함', '명확한 발음', '오디오북', '균형감', '인기 모델'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: '남성',
      localizedAge: '청년',
      accent: '생동감 넘치는 활기찬 톤',
      description: '에너지가 넘치고 친근하며 역동적인 목소리. 유튜브, 팟캐스트, 광고 콘텐츠에 이상적입니다.',
      sampleText: '여러분 안녕하세요! sirtxod-AI와 함께 오디오 프로덕션의 새로운 차원을 경험해 보세요.',
      tags: ['활기참', '역동적', '광고용', '팟캐스트', '청년에너지'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: '남성',
      localizedAge: '중후함',
      accent: '깊고 웅장한 바리톤',
      description: '신뢰감 있고 깊은 울림의 시네마틱 보이스. 다큐멘터리, 영화 트레일러, 극적 내레이션에 탁월합니다.',
      sampleText: '혁신이 가득한 세상 속에서도 인간의 목소리는 가장 깊은 감동을 전하는 울림입니다.',
      tags: ['웅장함', '중저음', '시네마틱', '다큐멘터리', '바리톤'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: '여성',
      localizedAge: '청년',
      accent: '포근하고 편안한 힐링 톤',
      description: '마음을 편안하게 해주는 부드럽고 잔잔한 음색. 명상 가이드, 수면 유도 오디오에 최적화되어 있습니다.',
      sampleText: '숨을 깊게 들이쉬고, 이 순간의 고요함과 평온함을 온전히 느껴보세요.',
      tags: ['차분함', '힐링', '명상', '부드러움', '안정감'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: '남성',
      localizedAge: '성숙함',
      accent: '지적이고 신뢰감 있는 톤',
      description: '품격 있고 정확한 전달력. 온라인 교육 강의, 뉴스 요약, 비즈니스 프레젠테이션에 추천합니다.',
      sampleText: '뉴럴 음성 합성은 다국어 발음과 억양에서 전례 없는 자연스러움과 완성도를 선사합니다.',
      tags: ['지적임', '신뢰도', '교육강의', '비즈니스', '뉴스전달'],
    },
  },

  ar: {
    Kore: {
      gender: 'Female',
      localizedGender: 'أنثى',
      localizedAge: 'بالغة',
      accent: 'عربية فصحى طبيعية ومتوازنة',
      description: 'دافئة، فصيحة النطق، متوازنة وطبيعية للغاية. رائعة للسرد والكتب الصوتية والتواصل الراقي.',
      sampleText: 'مرحباً بكم في sirtxod-AI. تتحول كل عبارة تصنعها بدقة عصبية ودفء صوتي طبيعي متقن.',
      tags: ['دافئ', 'فصيح', 'كتب صوتية', 'متوازن', 'شائع'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'ذكر',
      localizedAge: 'شاب',
      accent: 'حيوي وديناميكي مشرق',
      description: 'مفعم بالحيوية والحماس والجاذبية. مثالي للإعلانات التجارية والبودكاست ومحتوى وسائل التواصل الاجتماعي.',
      sampleText: 'مرحباً بالجميع! هذا هو sirtxod-AI. هل أنتم مستعدون للارتقاء بإنتاجكم الصوتي إلى آفاق جديدة؟',
      tags: ['حيوي', 'ديناميكي', 'إعلانات', 'بودكاست', 'شبابي'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'ذكر',
      localizedAge: 'ناضج',
      accent: 'جهوري وسينمائي عميق',
      description: 'صوت جهوري وقوي وسينمائي ذو هيبة بالغة. مخصص للوثائقيات والإعلانات الرسمية والمشاهد الدرامية.',
      sampleText: 'في عالم تصنعه الابتكارات المتسارعة، يبقى الصوت البشري أعظم وأعمق أدواتنا للتعبير والتأثير.',
      tags: ['مهيب', 'عميق', 'سينمائي', 'وثائقي', 'جهوري'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'أنثى',
      localizedAge: 'شابة',
      accent: 'هادئ ومريح ومطمئن',
      description: 'مهدئة وناعمة ورقيقة للغاية. مناسبة لجلسات التأمل والنوم والقصص الهادئة والتطبيقات الروحانية.',
      sampleText: 'خذ نفساً عميقاً بهدوء، ودع عقلك ينعم بلحظة من السكينة التامة والصفاء الداخلي.',
      tags: ['هادئ', 'مريح', 'تأمل', 'لطيف', 'طمأنينة'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'ذكر',
      localizedAge: 'ناضج',
      accent: 'رسمي وأكاديمي رزين',
      description: 'أكاديمي ورصين وموثوق ورفيع المستوى. ملائم للشروحات العلمية والتقارير الإخبارية والعروض التنفيذية.',
      sampleText: 'تؤكد التحليلات العلمية أن التوليد الصوتي العصبي يحقق واقعية صوتية فائقة وغير مسبوقة في كافة اللغات.',
      tags: ['أكاديمي', 'رسمي', 'موثوق', 'إخباري', 'رزين'],
    },
  },

  ru: {
    Kore: {
      gender: 'Female',
      localizedGender: 'Женский',
      localizedAge: 'Взрослый',
      accent: 'Естественный Русский Литературный',
      description: 'Тёплый, чистый, гармоничный и необычайно естественный голос. Превосходно для аудиокниг и повествований.',
      sampleText: 'Добро пожаловать в sirtxod-AI. Каждая фраза преображается с нейронной точностью и естественной акустической теплотой.',
      tags: ['Тёплый', 'Чёткий', 'Аудиокниги', 'Гармоничный', 'Популярный'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'Мужской',
      localizedAge: 'Молодой',
      accent: 'Энергичный и Выразительный',
      description: 'Динамичный, воодушевляющий и яркий. Идеален для рекламы, подкастов, YouTube-роликов и соцсетей.',
      sampleText: 'Всем привет! Это sirtxod-AI. Готовы вывести создание аудио на совершенно новый качественный уровень?',
      tags: ['Энергичный', 'Динамичный', 'Реклама', 'Подкаст', 'Молодёжный'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'Мужской',
      localizedAge: 'Зрелый',
      accent: 'Глубокий Бархатный Баритон',
      description: 'Властный, резонансный, кинематографичный и монументальный голос. Создан для документальных фильмов и трейлеров.',
      sampleText: 'В мире непрерывных технологических открытий человеческий голос остаётся нашим самым глубоким инструментом.',
      tags: ['Авторитетный', 'Глубокий', 'Кино', 'Документальный', 'Баритон'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'Женский',
      localizedAge: 'Молодой',
      accent: 'Нежный и Умиротворяющий',
      description: 'Мягкий, умиротворяющий, ласковый и проникновенный. Идеален для медитаций, релаксации и сказок на ночь.',
      sampleText: 'Сделайте медленный глубокий вдох. Позвольте вашему разуму погрузиться в этот момент покоя и безмятежности.',
      tags: ['Спокойный', 'Умиротворяющий', 'Медитация', 'Нежный', 'Интимный'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'Мужской',
      localizedAge: 'Зрелый',
      accent: 'Академичный и Деловит',
      description: 'Интеллигентный, солидный, вызывающий безусловное доверие. Рекомендован для обучающих курсов и новостей.',
      sampleText: 'Аналитические исследования подтверждают, что нейросетевой синтез речи достигает абсолютной фонетической точности.',
      tags: ['Интеллигентный', 'Деловой', 'Обучение', 'Надёжный', 'Новости'],
    },
  },

  hi: {
    Kore: {
      gender: 'Female',
      localizedGender: 'महिला',
      localizedAge: 'वयस्क',
      accent: 'मानक हिंदी・स्पष्ट एवं मधुर',
      description: 'मधुर, स्पष्ट, संतुलित और प्राकृतिक ध्वनि। कहानी सुनाने, ऑडियोबुक्स और संचार के लिए आदर्श।',
      sampleText: 'sirtxod-AI में आपका स्वागत है। आपके हर वाक्य को न्यूरल सटीकता और स्वाभाविक ध्वनि के साथ प्रस्तुत किया जाता है।',
      tags: ['मधुर', 'स्पष्ट', 'ऑडियोबुक', 'संतुलित', 'लोकप्रिय'],
    },
    Puck: {
      gender: 'Male',
      localizedGender: 'पुरुष',
      localizedAge: 'युवा',
      accent: 'ऊर्जावान और जीवंत स्वर',
      description: 'उत्साही, आकर्षक और प्रभावशाली। विज्ञापनों, पॉडकास्ट और सोशल मीडिया सामग्री के लिए उपयुक्त।',
      sampleText: 'नमस्ते दोस्तों! यह है sirtxod-AI। क्या आप अपने ऑडियो निर्माण को एक नई ऊँचाई देने के लिए तैयार हैं?',
      tags: ['ऊर्जावान', 'सक्रिय', 'विज्ञापन', 'पॉडकास्ट', 'युवा'],
    },
    Fenrir: {
      gender: 'Male',
      localizedGender: 'पुरुष',
      localizedAge: 'परिपक्व',
      accent: 'गंभीर सिनेमाई बैरिटोन',
      description: 'गंभीर, गहरा, प्रभावशाली और नाटकीय। वृत्तचित्रों, ट्रेलर और ऐतिहासिक घोषणाओं के लिए सर्वश्रेष्ठ।',
      sampleText: 'नवाचार की इस आधुनिक दुनिया में, मानव आवाज़ हमारा सबसे गहरा और प्रभावशाली माध्यम है।',
      tags: ['गंभीर', 'गहरा', 'सिनेमाई', 'डॉक्यूमेंट्री', 'गंभीर स्वर'],
    },
    Zephyr: {
      gender: 'Female',
      localizedGender: 'महिला',
      localizedAge: 'युवा',
      accent: 'शांत एवं सुकूनदायक',
      description: 'मन को शांति देने वाली, कोमल और सुखद आवाज़। ध्यान, योग, और सोने से पहले की कहानियों के लिए निर्मित।',
      sampleText: 'एक गहरी और धीमी सांस लें। अपने मन को इस शांत और सुखद क्षण में पूरी तरह स्थिर होने दें।',
      tags: ['शांत', 'सुकून', 'ध्यान', 'कोमल', 'मधुर'],
    },
    Charon: {
      gender: 'Male',
      localizedGender: 'पुरुष',
      localizedAge: 'परिपक्व',
      accent: 'विद्वान एवं आधिकारिक',
      description: 'ज्ञानपूर्ण, विश्वसनीय, सटीक और गरिमामय स्वर। ई-लर्निंग, वैज्ञानिक व्याख्यान और समाचारों के लिए।',
      sampleText: 'विश्लेषण दर्शाता है कि न्यूरल स्पीच सिंथेसिस ध्वन्यात्मक यथार्थवाद के नए वैश्विक मानक स्थापित कर रहा है।',
      tags: ['विद्वान', 'आधिकारिक', 'शैक्षणिक', 'विश्वसनीय', 'समाचार'],
    },
  },
};

// Return a localized version of a VoiceModel based on target language code
export function getLocalizedVoice(voice: VoiceModel, languageCode: string = 'en-US'): VoiceModel {
  if (!voice) return voice;
  if (voice.isCustomClone) {
    return voice;
  }

  // Get primary language prefix (e.g., 'es-ES' -> 'es')
  const langKey = (languageCode || 'en').split('-')[0].toLowerCase();
  const langMap = VOICE_LOCALIZATIONS[langKey] || VOICE_LOCALIZATIONS['en'];
  const localizedData = langMap?.[voice.baseVoice] || VOICE_LOCALIZATIONS['en']?.[voice.baseVoice];

  if (!localizedData) {
    return voice;
  }

  return {
    ...voice,
    gender: localizedData.gender || voice.gender,
    accent: localizedData.accent || voice.accent,
    description: localizedData.description || voice.description,
    sampleText: localizedData.sampleText || voice.sampleText,
    tags: localizedData.tags || voice.tags,
  };
}

// Return pre-listening sample text in the chosen language
export function getLocalizedSampleText(voiceBaseName: string, languageCode: string = 'en-US'): string {
  const langKey = (languageCode || 'en').split('-')[0].toLowerCase();
  const langMap = VOICE_LOCALIZATIONS[langKey] || VOICE_LOCALIZATIONS['en'];
  const voiceData = langMap?.[voiceBaseName] || VOICE_LOCALIZATIONS['en']?.[voiceBaseName];
  return voiceData?.sampleText || 'Welcome to sirtxod-AI neural speech studio.';
}

// Multilingual Calibration Snippets for Voice Cloning
export const MULTILINGUAL_CLONING_SNIPPETS: Record<string, CalibrationSnippet[]> = {
  en: [
    {
      id: 'acoustic',
      title: 'Phonetic & Resonance (Recommended)',
      focus: 'Vowel formants, harmonic warmth, and throat acoustic resonance',
      text: 'The mysterious sound of the violin echoed through the ancient stone cathedral, carrying harmonics of warmth and forgotten memories.',
    },
    {
      id: 'conversational',
      title: 'Conversational Pacing & Energy',
      focus: 'Natural breath pacing, pitch inflections, and conversational cadence',
      text: 'Every morning brings a new beginning. We build ideas from scratch, speak with passion, and share our vision with the entire world.',
    },
    {
      id: 'broadcast',
      title: 'Precision & Clarity',
      focus: 'Crisp consonant articulation, projection, and dynamic range',
      text: 'Neural acoustics continue to push the boundaries of speech synthesis, enabling seamless human expression across every language.',
    },
  ],

  es: [
    {
      id: 'acoustic',
      title: 'Fonética y Resonancia (Recomendado)',
      focus: 'Formantes vocálicos, armónicos cálidos y resonancia acústica',
      text: 'El misterioso sonido del violín resonaba por la antigua catedral de piedra, transportando armónicos de calidez y recuerdos lejanos.',
    },
    {
      id: 'conversational',
      title: 'Ritmo y Puntos de Pausa Conversacional',
      focus: 'Inflexión natural, respiración espontánea y musicalidad del habla',
      text: 'Cada mañana nos ofrece una nueva oportunidad. Creamos ideas desde cero, hablamos con pasión y compartimos nuestra visión con el mundo entero.',
    },
    {
      id: 'broadcast',
      title: 'Claridad y Precisión Articulatoria',
      focus: 'Ataque de consonantes, proyección vocal y dicción impecable',
      text: 'Los modelos acústicos neuronales transforman la síntesis de voz, permitiendo una expresión humana libre de fronteras en cualquier idioma.',
    },
  ],

  fr: [
    {
      id: 'acoustic',
      title: 'Phonétique et Résonance (Recommandé)',
      focus: 'Clarté des voyelles nasales et harmoniques profondes',
      text: 'Le son envoûtant du violon résonnait à travers l’ancienne cathédrale de pierre, éveillant des harmonies chaleureuses et des souvenirs oubliés.',
    },
    {
      id: 'conversational',
      title: 'Cadence et Énergie Conversationnelle',
      focus: 'Souffle naturel, rythme fluide et intonation vivante',
      text: 'Chaque matin apporte un renouveau. Nous bâtissons des projets avec passion, exprimons nos idées et partageons notre voix avec le monde entier.',
    },
    {
      id: 'broadcast',
      title: 'Précision et Articulation',
      focus: 'Attaque consonantique et netteté acoustique studio',
      text: 'L’acoustique neuronale repousse sans cesse les limites de la synthèse vocale, offrant une authenticité humaine inégalée dans toutes les langues.',
    },
  ],

  de: [
    {
      id: 'acoustic',
      title: 'Phonetik und Resonanz (Empfohlen)',
      focus: 'Vokalformanten, harmonische Fülle und Brustresonanz',
      text: 'Der geheimnisvolle Klang der Violine hallte durch die alte Steinkathedrale und trug eine Welle wohliger Wärme und vergessener Erinnerungen mit sich.',
    },
    {
      id: 'conversational',
      title: 'Gesprächsrhythmus und Dynamik',
      focus: 'Natürliche Atmung, lebendige Sprachmelodie und Satzmelodie',
      text: 'Jeder Morgen schenkt uns einen Neuanfang. Wir entwickeln Ideen von Grund auf, sprechen mit Begeisterung und teilen unsere Vision mit der ganzen Welt.',
    },
    {
      id: 'broadcast',
      title: 'Präzision und Deutlichkeit',
      focus: 'Präzise Konsonantenartikulation und Studio-Dynamik',
      text: 'Neuronale Akustikmodelle eröffnen völlig neue Dimensionen der Sprachsynthese und ermöglichen eine fließende menschliche Kommunikation über alle Grenzen hinweg.',
    },
  ],

  it: [
    {
      id: 'acoustic',
      title: 'Fonetica e Risonanza (Consigliato)',
      focus: 'Formanti vocalici aperti, calore armonico e risonanza',
      text: 'Il suono misterioso del violino risuonava attraverso l’antica cattedrale di pietra, trasportando armonie calde e ricordi lontani nel tempo.',
    },
    {
      id: 'conversational',
      title: 'Ritmo Naturale ed Espressività',
      focus: 'Musicalità della frase, respirazione naturale ed entusiasmo',
      text: 'Ogni mattina porta con sé un nuovo inizio. Diamo vita alle nostre idee, parliamo con passione autentica e condividiamo la nostra visione con il mondo.',
    },
    {
      id: 'broadcast',
      title: 'Precisione e Chiarezza',
      focus: 'Articolazione consonantica e brillantezza timbrica',
      text: 'I modelli acustici neurali continuano a superare ogni confine nella sintesi vocale, rendendo l’espressione umana universale e immediata.',
    },
  ],

  pt: [
    {
      id: 'acoustic',
      title: 'Fonética e Ressonância (Recomendado)',
      focus: 'Formantes vocálicos, timbre caloroso e sustentação',
      text: 'O som misterioso do violino ecoava pela antiga catedral de pedra, trazendo harmônicos de calor humano e memórias inesquecíveis.',
    },
    {
      id: 'conversational',
      title: 'Cadência e Energia de Conversação',
      focus: 'Respiração suave, entonação natural e cadência ritmada',
      text: 'Cada manhã nos presenteia com um novo recomeço. Criamos ideias inovadoras, falamos com paixão e compartilhamos nossa visão com o mundo.',
    },
    {
      id: 'broadcast',
      title: 'Precisão e Dicção',
      focus: 'Articulação firme de consoantes e projeção sonora',
      text: 'A acústica neural continua rompendo barreiras na síntese de voz, permitindo uma comunicação humana fluida e autêntica em todos os idiomas.',
    },
  ],

  ja: [
    {
      id: 'acoustic',
      title: '音響共鳴と母音フォルマント（推奨）',
      focus: '美しい母音の伸び、深みのある響きと倍音成分の測定',
      text: '古い石造りの大聖堂にバイオリンの幻想的な調べが響き渡り、温かな記憶の余韻が静かに広がっていきました。',
    },
    {
      id: 'conversational',
      title: '自然な会話リズムと抑揚',
      focus: '自然なブレス（息継ぎ）、会話のテンポとイントネーション',
      text: '新しい朝はいつだって新しい可能性を運んでくれます。私たちは情熱を持って語り、この声を世界へと届けていきます。',
    },
    {
      id: 'broadcast',
      title: '子音の明瞭さと発音の正確性',
      focus: 'クリアな子音のアタック、正確な調音とダイナミクス',
      text: 'ニューラル音響モデルは音声合成の可能性を革新し、言葉の壁を越えた自由で豊かな表現を実現します。',
    },
  ],

  zh: [
    {
      id: 'acoustic',
      title: '声学共鸣与元音饱满度（推荐）',
      focus: '元音共振峰、胸腔共鸣与自然谐波质感',
      text: '神秘悠扬的小提琴声在古老的石砌大教堂中回荡，激荡起温暖的泛音与久远的回忆。',
    },
    {
      id: 'conversational',
      title: '自然对话节奏与情感起伏',
      focus: '呼吸节律、语调起伏与真实的交谈感',
      text: '每一个清晨都孕育着全新的可能。我们从零构建灵感，用饱满的热情发声，将心中的愿景传递给整个世界。',
    },
    {
      id: 'broadcast',
      title: '字正腔圆与声学清晰度',
      focus: '清晰有力的辅音咬字与广播级动态范围',
      text: '神经网络声学技术正不断拓展语音合成的疆界，让跨越语种界限的人类真实情感表达得以自由流淌。',
    },
  ],

  ko: [
    {
      id: 'acoustic',
      title: '음향 공명과 모음 포먼트 (추천)',
      focus: '모음의 명확한 울림과 따뜻한 하모닉 배음 측정',
      text: '오래된 석조 성당 안으로 바이올린의 신비로운 선율이 울려 퍼지며, 따스한 온기와 잊혀진 추억의 숨결을 전해 주었습니다.',
    },
    {
      id: 'conversational',
      title: '자연스러운 대화 호흡과 리듬',
      focus: '부드러운 호흡 쉼표, 활기찬 억양과 자연스러운 말씨',
      text: '매일 아침은 새로운 시작을 선물합니다. 우리는 열정을 담아 목소리를 내고, 우리의 비전을 온 세상과 함께 나눕니다.',
    },
    {
      id: 'broadcast',
      title: '명확한 자음 발음과 전달력',
      focus: '선명한 자음 조음과 고품질 스튜디오 음향 다이내믹스',
      text: '뉴럴 음향 모델은 음성 합성의 지평을 넓히며, 모든 언어의 장벽을 넘어 인간다운 감정과 표현을 생생하게 이어줍니다.',
    },
  ],

  ar: [
    {
      id: 'acoustic',
      title: 'الرنين الصوتي ومخارج الحروف (موصى به)',
      focus: 'رنين الأحرف الحلقية، الترددات التوافقية والعمق الصوتي',
      text: 'تردد صدى الكمان الساحر في أرجاء الكاتدرائية الحجرية العريقة، حاملاً معه نغمات من الدفء والذكريات العذبة.',
    },
    {
      id: 'conversational',
      title: 'التدفق الطبيعي وإيقاع المحادثة',
      focus: 'التنفس الطبيعي، نبرة الصوت وتناغم الجمل في الحديث اليومي',
      text: 'كل صباح يحمل في طياته بداية جديدة ملهمة. نصنع أفكارنا بشغف حقيقي، ونشارك أصواتنا وأحلامنا مع العالم بأسره.',
    },
    {
      id: 'broadcast',
      title: 'الفصاحة ومخارج الحروف الدقيقة',
      focus: 'وضوح النطق الفصيح وثبات الأداء الصوتي المحترف',
      text: 'تواصل النماذج العصبية الصوتية إعادة صياغة حدود الذكاء الاصطناعي، متيحة تعبيراً إنسانياً فائق الواقعية عبر شتى اللغات.',
    },
  ],

  ru: [
    {
      id: 'acoustic',
      title: 'Фонетика и Акустический Резонанс (Рекомендуется)',
      focus: 'Глубина гласных, грудной резонатор и тёплые гармоники',
      text: 'Таинственные звуки скрипки мягко разносились под сводами старинного собора, пробуждая тёплые воспоминания и гармонию.',
    },
    {
      id: 'conversational',
      title: 'Живая Интонация и Ритм Речи',
      focus: 'Естественное дыхание, микропаузы и выразительность',
      text: 'Каждое утро открывает новую страницу. Мы создаём смелые идеи, говорим с искренней страстью и делимся своими мыслями со всем миром.',
    },
    {
      id: 'broadcast',
      title: 'Чёткая Артикуляция и Динамика',
      focus: 'Атака согласных звуков, дикционная ясность и плотность',
      text: 'Нейросетевые акустические технологии стирают языковые границы, делая живую выразительную речь доступной каждому.',
    },
  ],

  hi: [
    {
      id: 'acoustic',
      title: 'ध्वन्यात्मक प्रतिध्वनि एवं स्वर गूँज (अनुशंसित)',
      focus: 'स्वरों की स्पष्ट गूँज और स्वाभाविक कर्णप्रिय प्रतिध्वनि',
      text: 'प्राचीन पत्थरों वाले भव्य भवन में वायलिन की रहस्यमयी धुन गूँज उठी, जो अपने साथ गर्माहट और पुरानी यादों की मधुर तरंगें ले आई।',
    },
    {
      id: 'conversational',
      title: 'संवादात्मक गति एवं ऊर्जा',
      focus: 'प्राकृतिक श्वास चक्र, जीवंत लय एवं स्पष्ट भाव-प्रवाह',
      text: 'हर सुबह अपने साथ एक नई उम्मीद लेकर आती है। हम नए विचार बनाते हैं, उत्साह से बोलते हैं और दुनिया के साथ अपने सपने साझा करते हैं।',
    },
    {
      id: 'broadcast',
      title: 'स्पष्ट उच्चारण एवं परिशुद्धता',
      focus: 'व्यंजनों का सटीक उच्चारण, स्पष्टता एवं प्रभावी स्वर',
      text: 'न्यूरल ध्वनिक मॉडल भाषा संश्लेषण की सीमाओं को विस्तार दे रहे हैं, जिससे हर भाषा में मानव अभिव्यक्ति सहज और सजीव हो गई है।',
    },
  ],
};

export function getCloningSnippetsForLanguage(languageCode: string): CalibrationSnippet[] {
  const langKey = languageCode.split('-')[0].toLowerCase();
  return MULTILINGUAL_CLONING_SNIPPETS[langKey] || MULTILINGUAL_CLONING_SNIPPETS['en'];
}
