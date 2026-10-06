const fs = require('fs');

let h = fs.readFileSync('src/components/Homepage.tsx', 'utf8');

h = h.replace(
  '<Download className="w-4 h-4" /> Install App',
  '<Download className="w-4 h-4" /> {t("homepage.installApp", { defaultValue: "Install App" })}'
);

h = h.replace(
  '<Download className="w-6 h-6" /> Install Desktop App',
  '<Download className="w-6 h-6" /> {t("homepage.installDesktopApp", { defaultValue: "Install Desktop App" })}'
);

h = h.replace(
  'Our Mission: Best-In-Class Community Service',
  '{t("homepage.missionTitle", { defaultValue: "Our Mission: Best-In-Class Community Service" })}'
);

h = h.replace(
  /<p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 font-light">[\s\S]*?<\/p>/m,
  '<p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 font-light">\n            {t("homepage.missionDesc", { defaultValue: "We believe that free, open access to high-quality information and entertainment is a fundamental digital right. Our platform is built on the principle of democratizing broadcasting." })}\n          </p>'
);

h = h.replace(
  '>\n                Verified & Safe\n              </h3>',
  '>\n                {t("homepage.verifiedSafeTitle", { defaultValue: "Verified & Safe" })}\n              </h3>'
);

h = h.replace(
  '>\n                Global & Regional\n              </h3>',
  '>\n                {t("homepage.globalRegionalTitle", { defaultValue: "Global & Regional" })}\n              </h3>'
);

h = h.replace(
  /<p className="text-slate-400 leading-relaxed">\n                We combat broken links[\s\S]*?generation\.\n              <\/p>/m,
  '<p className="text-slate-400 leading-relaxed">\n                {t("homepage.verifiedSafeDesc", { defaultValue: "We combat broken links and misinformation by aggressively curating and validating public streams. Our built-in Kids Mode and Senior-Safe UI ensure a secure environment for every generation." })}\n              </p>'
);

h = h.replace(
  /<p className="text-slate-400 leading-relaxed">\n                From local news[\s\S]*?tracking\.\n              <\/p>/m,
  '<p className="text-slate-400 leading-relaxed">\n                {t("homepage.globalRegionalDesc", { defaultValue: "From local news broadcasts to the NASA ISS live feed, we bridge the gap between global events and your local community without hidden fees, subscriptions, or invasive tracking." })}\n              </p>'
);

h = h.replace('src="/logo.png"', 'src="/icon.png"');
h = h.replace('alt="WMD Streams Logo"', 'alt="JanataTv Logo"');
h = h.replace('Ac 2026 Wasmatch-du Open Source Project.', '© 2026 JanataTv.');

fs.writeFileSync('src/components/Homepage.tsx', h);
