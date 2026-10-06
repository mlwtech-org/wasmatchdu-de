const fs = require('fs');

let l = fs.readFileSync('src/components/LanguageSwitcher.tsx', 'utf8');

l = l.replace(
  '<div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">',
  `{isOpen && (
        <div className="fixed inset-0 z-[40]" onClick={() => setIsOpen(false)} />
      )}
      <div className={cn(
        "absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl transition-all duration-200 z-50 overflow-hidden",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}>`
);

fs.writeFileSync('src/components/LanguageSwitcher.tsx', l);
