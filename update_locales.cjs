const fs = require('fs');

const files = {
  'en.ts': {
    features: "Features",
    mission: "Our Mission",
    login: "Log In",
    signup: "Sign Up Free",
    installApp: "Install App",
    nowAvailable: "Now Available Globally",
    heroTitle: "Free Live TV for Everyone.",
    heroSubtitle: "Experience high-quality regional and international television channels on any device. No subscriptions, no hidden fees.",
    startWatching: "Start Watching Now",
    installDesktopApp: "Install Desktop App",
    designedForEveryone: "Designed for Everyone.",
    seniorSafeTitle: "Senior Safe Mode",
    seniorSafeDesc: "We prioritize accessibility. Enable our Senior Safe mode to dramatically increase font sizes, improve contrast, and simplify navigation for older users.",
    kidsModeTitle: "Kids Mode",
    kidsModeDesc: "Instantly lock the platform into a safe, visual-first environment. We strictly filter out everything except trusted, educational channels.",
    localRegionalTitle: "Local & Regional",
    localRegionalDesc: "Stay connected to your roots. We automatically organize regional broadcasters so you never miss local news and community updates.",
    missionTitle: "Our Mission: Best-In-Class Community Service",
    missionDesc: "We believe that free, open access to high-quality information and entertainment is a fundamental digital right. Our platform is built on the principle of democratizing broadcasting.",
    verifiedSafeTitle: "Verified & Safe",
    verifiedSafeDesc: "We combat broken links and misinformation by aggressively curating and validating public streams. Our built-in Kids Mode and Senior-Safe UI ensure a secure environment for every generation.",
    globalRegionalTitle: "Global & Regional",
    globalRegionalDesc: "From local news broadcasts to the NASA ISS live feed, we bridge the gap between global events and your local community without hidden fees, subscriptions, or invasive tracking."
  },
  'hi.ts': {
    features: "विशेषताएं",
    mission: "हमारा मिशन",
    login: "लॉग इन करें",
    signup: "मुफ़्त साइन अप करें",
    installApp: "ऐप इंस्टॉल करें",
    nowAvailable: "अब विश्व स्तर पर उपलब्ध है",
    heroTitle: "सबके लिए मुफ़्त लाइव टीवी।",
    heroSubtitle: "किसी भी डिवाइस पर उच्च गुणवत्ता वाले क्षेत्रीय और अंतर्राष्ट्रीय टेलीविजन चैनलों का अनुभव करें। कोई सदस्यता नहीं, कोई छिपा हुआ शुल्क नहीं।",
    startWatching: "अभी देखना शुरू करें",
    installDesktopApp: "डेस्कटॉप ऐप इंस्टॉल करें",
    designedForEveryone: "सभी के लिए डिज़ाइन किया गया।",
    seniorSafeTitle: "सीनियर सेफ मोड",
    seniorSafeDesc: "हम पहुंच को प्राथमिकता देते हैं। बड़े उपयोगकर्ताओं के लिए फ़ॉन्ट आकार बढ़ाने और नेविगेशन को आसान बनाने के लिए हमारा सीनियर सेफ मोड सक्षम करें।",
    kidsModeTitle: "किड्स मोड",
    kidsModeDesc: "मंच को तुरंत एक सुरक्षित वातावरण में लॉक करें। हम विश्वसनीय, शैक्षिक चैनलों के अलावा सब कुछ सख्ती से फ़िल्टर करते हैं।",
    localRegionalTitle: "स्थानीय और क्षेत्रीय",
    localRegionalDesc: "अपनी जड़ों से जुड़े रहें। हम क्षेत्रीय प्रसारकों को स्वचालित रूप से व्यवस्थित करते हैं ताकि आप कभी भी स्थानीय समाचारों को याद न करें।",
    missionTitle: "हमारा मिशन: सर्वश्रेष्ठ सामुदायिक सेवा",
    missionDesc: "हम मानते हैं कि उच्च गुणवत्ता वाली जानकारी और मनोरंजन तक मुफ़्त, खुली पहुँच एक मौलिक डिजिटल अधिकार है। हमारा मंच प्रसारण के लोकतंत्रीकरण के सिद्धांत पर बना है।",
    verifiedSafeTitle: "सत्यापित और सुरक्षित",
    verifiedSafeDesc: "हम सार्वजनिक स्ट्रीम को सख्ती से क्यूरेट करके टूटे हुए लिंक और गलत सूचनाओं का मुकाबला करते हैं। किड्स मोड और सीनियर-सेफ यूआई सुरक्षित वातावरण सुनिश्चित करते हैं।",
    globalRegionalTitle: "वैश्विक और क्षेत्रीय",
    globalRegionalDesc: "स्थानीय समाचार प्रसारण से लेकर नासा फीड तक, हम बिना किसी छिपे शुल्क के वैश्विक घटनाओं और आपके स्थानीय समुदाय के बीच की खाई को पाटते हैं।"
  },
  'te.ts': {
    features: "లక్షణాలు",
    mission: "మా లక్ష్యం",
    login: "లాగిన్",
    signup: "ఉచిత సైన్ అప్",
    installApp: "యాప్ ఇన్‌స్టాల్ చేయండి",
    nowAvailable: "ఇప్పుడు ప్రపంచవ్యాప్తంగా అందుబాటులో ఉంది",
    heroTitle: "అందరికీ ఉచిత లైవ్ టీవీ.",
    heroSubtitle: "ఏదైనా పరికరంలో అధిక-నాణ్యత ప్రాంతీయ మరియు అంతర్జాతీయ టెలివిజన్ ఛానెల్‌లను అనుభవించండి. చందాలు లేవు, దాచిన రుసుములు లేవు.",
    startWatching: "ఇప్పుడే చూడటం ప్రారంభించండి",
    installDesktopApp: "డెస్క్‌టాప్ యాప్ ఇన్‌స్టాల్ చేయండి",
    designedForEveryone: "అందరి కోసం రూపొందించబడింది.",
    seniorSafeTitle: "సీనియర్ సేఫ్ మోడ్",
    seniorSafeDesc: "మేము ప్రాప్యతకు ప్రాధాన్యత ఇస్తాము. పాత వినియోగదారుల కోసం ఫాంట్ పరిమాణాలను పెంచడానికి మరియు నావిగేషన్‌ను సులభతరం చేయడానికి మా సీనియర్ సేఫ్ మోడ్‌ను ప్రారంభించండి.",
    kidsModeTitle: "కిడ్స్ మోడ్",
    kidsModeDesc: "ప్లాట్‌ఫారమ్‌ను తక్షణమే సురక్షితమైన వాతావరణంలోకి లాక్ చేయండి. విశ్వసనీయ, విద్యా ఛానెల్‌లు మినహా మేము అన్నింటినీ ఖచ్చితంగా ఫిల్టర్ చేస్తాము.",
    localRegionalTitle: "స్థానిక & ప్రాంతీయ",
    localRegionalDesc: "మీ మూలాలకు కనెక్ట్ అయి ఉండండి. మీరు స్థానిక వార్తలను ఎప్పటికీ కోల్పోకుండా మేము ప్రాంతీయ ప్రసారకర్తలను స్వయంచాలకంగా నిర్వహిస్తాము.",
    missionTitle: "మా లక్ష్యం: ఉత్తమ కమ్యూనిటీ సేవ",
    missionDesc: "అధిక-నాణ్యత సమాచారం మరియు వినోదానికి ఉచిత, బహిరంగ ప్రాప్యత ప్రాథమిక డిజిటల్ హక్కు అని మేము నమ్ముతున్నాము. ప్రసారాన్ని ప్రజాస్వామ్యీకరించే సూత్రంపై మా ప్లాట్‌ఫాం నిర్మించబడింది.",
    verifiedSafeTitle: "ధృవీకరించబడిన & సురక్షితం",
    verifiedSafeDesc: "పబ్లిక్ స్ట్రీమ్‌లను క్యూరేట్ చేయడం ద్వారా మేము విరిగిన లింక్‌లు మరియు తప్పుడు సమాచారాన్ని ఎదుర్కొంటాము. కిడ్స్ మోడ్ మరియు సీనియర్-సేఫ్ UI సురక్షితమైన వాతావరణాన్ని నిర్ధారిస్తాయి.",
    globalRegionalTitle: "గ్లోబల్ & ప్రాంతీయ",
    globalRegionalDesc: "స్థానిక వార్తల ప్రసారాల నుండి నాసా ఫీడ్ వరకు, మేము దాచిన రుసుములు లేకుండా ప్రపంచ సంఘటనలు మరియు మీ స్థానిక కమ్యూనిటీ మధ్య అంతరాన్ని తగ్గిస్తాము."
  }
};

for (const [file, contentObj] of Object.entries(files)) {
  const path = `src/locales/${file}`;
  if (!fs.existsSync(path)) continue;
  
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes('homepage: {')) {
    // Inject right after translation: {
    const jsonStr = JSON.stringify(contentObj, null, 4).replace(/^/gm, '      ').trim();
    content = content.replace('translation: {', `translation: {\n    homepage: ${jsonStr},`);
    fs.writeFileSync(path, content);
  } else {
    // If it exists, replace it
    const jsonStr = JSON.stringify(contentObj, null, 4).replace(/^/gm, '      ').trim();
    content = content.replace(/homepage:\s*{[\s\S]*?},/, `homepage: ${jsonStr},`);
    fs.writeFileSync(path, content);
  }
}
