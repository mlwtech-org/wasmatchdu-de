const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
const importStr = `const Legal = lazy(() =>
  import("./components/Legal").then((m) => ({ default: m.Legal })),
);
const Download = lazy(() =>
  import("./components/Download").then((m) => ({ default: m.Download })),
);`;

app = app.replace(/const Legal = lazy\(\(\) =>\s+import\("\.\/components\/Legal"\)\.then\(\(m\) => \(\{ default: m\.Legal \}\)\),\s+\);/, importStr);

// Add route
const routeStr = `<Route path="/legal" element={<Legal />} />
            <Route path="/download" element={<Download />} />`;

app = app.replace('<Route path="/legal" element={<Legal />} />', routeStr);

fs.writeFileSync('src/App.tsx', app);
