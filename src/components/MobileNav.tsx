import React from "react";
import { Home, LayoutGrid, Heart, PlayCircle, Tv } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

import { useNavigate } from "react-router-dom";

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { t } = useTranslation();

  const navItems = [
    { id: "home", icon: Home, label: t("dashboard.defaultTitle") || "Home" },
    { id: "categories", icon: LayoutGrid, label: "Categories" },
    { id: "sports", icon: Tv, label: "Sports", action: () => navigate('/sports') },
    { id: "kids", icon: Heart, label: "Kids" },
    { id: "live", icon: PlayCircle, label: "Live TV" },
  ];

  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 pb-safe lg:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map(({ id, icon: Icon, label, action }) => (
          <button
            key={id}
            onClick={() => action ? action() : setCurrentTab(id)}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all",
              currentTab === id
                ? "text-blue-500"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            <Icon
              className={cn(
                "w-6 h-6 mb-1 transition-transform",
                currentTab === id && "scale-110",
              )}
            />
            <span className="text-[10px] font-medium tracking-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};
