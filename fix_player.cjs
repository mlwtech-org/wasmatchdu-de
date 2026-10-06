const fs = require('fs');
let c = fs.readFileSync('src/components/LivePlayer.tsx', 'utf8');

c = c.replace(
  'xhrSetup: function (xhr, url) {\n          if (useProxy && url.startsWith("http")) {',
  `xhrSetup: function (xhr, url) {
          const isNative = !!((window as any)?.Capacitor?.isNative) || navigator.userAgent.toLowerCase().includes(' electron/');
          if (useProxy && !isNative && url.startsWith("http")) {`
);

fs.writeFileSync('src/components/LivePlayer.tsx', c);
