const fs = require('fs');

// 1. Dashboard.tsx Hardcoded Translations
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

d = d.replace('title="Top Picks for You"', 'title={t("dashboard.topPicks", { defaultValue: "Top Picks for You" })}');
d = d.replace('title="🔴 Live Events & Breaking News"', 'title={t("dashboard.liveEvents", { defaultValue: "🔴 Live Events & Breaking News" })}');
d = d.replace('title="🔥 Trending Now"', 'title={t("dashboard.trendingNow", { defaultValue: "🔥 Trending Now" })}');
d = d.replace('title="Recently Watched"', 'title={t("dashboard.recentlyWatched", { defaultValue: "Recently Watched" })}');
d = d.replace('title="My Space"', 'title={t("dashboard.mySpace", { defaultValue: "My Space" })}');

fs.writeFileSync('src/components/Dashboard.tsx', d);

// 2. Hindi Translations
const hiContent = `export const hi = {
  translation: {
    app: {
      title: "JanataTv IPTV"
    },
    dashboard: {
      searchChannels: "चैनलों की खोज करें...",
      topPicks: "आपके लिए शीर्ष पसंद",
      liveEvents: "🔴 लाइव इवेंट और ब्रेकिंग न्यूज़",
      trendingNow: "🔥 अब ट्रेंडिंग",
      recentlyWatched: "हाल ही में देखा गया",
      category: "श्रेणी",
      favoritesOnly: "केवल पसंदीदा",
      noChannelsFound: "कोई चैनल नहीं मिला।"
    },
    categories: {
      "Nachrichten & Info": "समाचार और जानकारी"
    }
  }
};
`;
fs.writeFileSync('src/locales/hi.ts', hiContent);

// 3. Telugu Translations
const teContent = `export const te = {
  translation: {
    app: {
      title: "JanataTv IPTV"
    },
    dashboard: {
      searchChannels: "ఛానెల్‌లను శోధించండి...",
      topPicks: "మీ కోసం ఎంపికలు",
      liveEvents: "🔴 లైవ్ ఈవెంట్స్ & బ్రేకింగ్ న్యూస్",
      trendingNow: "🔥 ఇప్పుడు ట్రెండింగ్",
      recentlyWatched: "ఇటీవల చూసినవి",
      category: "వర్గం",
      favoritesOnly: "ఇష్టమైనవి మాత్రమే",
      noChannelsFound: "ఏ ఛానెల్‌లు కనుగొనబడలేదు."
    },
    categories: {
      "Nachrichten & Info": "వార్తలు & సమాచారం"
    }
  }
};
`;
fs.writeFileSync('src/locales/te.ts', teContent);
