const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.tsx', 'utf8').split('\n');

const adBannerHtml = `
          {/* Top Ad Banner */}
          <div className="w-full max-w-[1600px] mx-auto pt-24 px-4 z-[90] relative">
            <AdBanner />
          </div>
`;

let heroBannerIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<HeroBanner />')) {
    heroBannerIndex = i;
    break;
  }
}

// The HeroBanner block is usually:
// {/* Premium Hero Banner */}
// <div className="...">
//   <HeroBanner />
// </div>
// So heroBannerIndex - 2 is before the comment.
if (heroBannerIndex !== -1) {
  // Inject AdBanner right before the HeroBanner comment
  lines.splice(heroBannerIndex - 2, 0, adBannerHtml);
}

fs.writeFileSync('src/components/Dashboard.tsx', lines.join('\n'));
