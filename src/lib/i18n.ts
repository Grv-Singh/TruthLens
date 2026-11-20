import type { Language } from '../types/truthlens';

export const copy = {
  en: {
    tagline: 'Break the Deepfake Loop.',
    subtitle:
      'Systems Thinking + Multimodal AI to detect synthetic media, dampen viral loops, and enforce court-ready law.',
    badge: 'REAL-TIME MULTIMODAL FORENSICS & COUNTER-VIRALITY',
    nav: {
      overview: 'Home',
      deck: 'Pitch Deck',
      detect: 'Forensics Scanner',
      vault: 'Origin Vault',
      dampen: 'Virality Simulator',
      heal: 'Legal Shield',
      solutions: 'Solutions',
      system: 'API & Gateway',
    },
    navSub: {
      overview: 'System Architecture',
      deck: 'Executive Presentation',
      detect: 'Photos, Audio & Text',
      vault: 'Perceptual Hash',
      dampen: '24h Contagion & Wellbeing',
      heal: 'BSA 63 & Takedown Notices',
      solutions: 'Industry Modules',
      system: 'Live Endpoints',
    },
    liveMode: 'Live Server',
    edgeDemoMode: 'Edge Demo Mode',
    serverUrl: 'Backend Base URL',
    pingHealth: 'Ping /health',
    downloadApk: 'Android APK',
    quickActions: {
      scanNow: 'Run Edge Forensics',
      registerOriginal: 'Protect in Vault (L1)',
      simulateSpread: 'Simulate 24h Virality (L2)',
      openHeal: 'WhatsApp Debunk & Legal (L3)',
    },
    crisisWelcome:
      "Take a slow breath. You are safe right now, and you do not have to face this alone. Let's pause for 10 seconds, then secure cryptographic proof and trigger a 24-hour legal takedown together.",
    crisisPrompts: [
      'Someone morphed my photo on WhatsApp',
      'I am panicking, it is spreading in college groups',
      'How do I file a Cyber Cell complaint fast?',
      'Help me calm down first',
    ],
  },
  hi: {
    tagline: 'डीपफेक लूप को तोड़ें।',
    subtitle:
      'सिस्टम्स थिंकिंग + AI: सिंथेटिक मीडिया पहचानें, वायरलिटी रोकें और क़ानूनी कार्रवाई करें।',
    badge: 'रीयल-टाइम डीपफेक फॉरेन्सिक व रक्षा मंच',
    nav: {
      overview: 'होम',
      deck: 'पिच डेक',
      detect: 'फॉरेन्सिक स्कैनर',
      vault: 'ओरिजिन वॉल्ट',
      dampen: 'वायरलिटी सिम्युलेटर',
      heal: 'लीगल शील्ड',
      solutions: 'सोल्यूशंस',
      system: 'API और गेटवे',
    },
    navSub: {
      overview: 'सिस्टम आर्किटेक्चर',
      deck: 'कार्यकारी प्रस्तुति',
      detect: 'फोटो, आवाज़ व टेक्स्ट',
      vault: 'परसेप्चुअल हैश',
      dampen: '24h प्रसार मॉडल',
      heal: 'BSA 63 व टेकडाउन',
      solutions: 'इंडस्ट्री मॉड्यूल्स',
      system: 'लाइव एंडपॉइंट्स',
    },
    liveMode: 'लाइव सर्वर',
    edgeDemoMode: 'एज डेमो मोड',
    serverUrl: 'बैकएंड बेस URL',
    pingHealth: '/health जांचें',
    downloadApk: 'एंड्रॉइड APK',
    quickActions: {
      scanNow: 'एज फ़ॉरेंसिक्स चलाएं',
      registerOriginal: 'वॉल्ट में सुरक्षित करें (L1)',
      simulateSpread: '24 घंटे की वायरलिटी देखें (L2)',
      openHeal: 'व्हाट्सएप डिबंक व क़ानूनी नोटिस (L3)',
    },
    crisisWelcome:
      'धीरे-धीरे लंबी सांस लें। आप इस समय सुरक्षित हैं और आपको इसका अकेले सामना नहीं करना है। पहले 10 सेकंड शांत हों, फिर हम साथ मिलकर क्रिप्टोग्राफ़िक सबूत तैयार करेंगे और 24 घंटे का क़ानूनी टेकडाउन नोटिस भेजेंगे।',
    crisisPrompts: [
      'किसी ने WhatsApp पर मेरी फ़ोटो मॉर्फ़ कर दी है',
      'मुझे घबराहट हो रही है, यह ग्रुप में फैल रहा है',
      'साइबर सेल में तुरंत शिकायत कैसे दर्ज करें?',
      'पहले मुझे शांत होने में मदद करें',
    ],
  },
} as const;

export function t(lang: Language) {
  return copy[lang];
}
