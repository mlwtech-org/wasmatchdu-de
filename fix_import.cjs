const fs = require('fs');
let h = fs.readFileSync('src/components/HeroBanner.tsx', 'utf8');
if (!h.includes('import { useTranslation }')) {
  h = "import { useTranslation } from 'react-i18next';\n" + h;
  fs.writeFileSync('src/components/HeroBanner.tsx', h);
}
