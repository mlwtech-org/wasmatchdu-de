import React from "react";
import {
  Tv,
  Music,
  Newspaper,
  Film,
  Trophy,
  Baby,
  BookOpen,
  Radio,
  Globe,
  Camera,
  Car,
} from "lucide-react";
import { Channel } from "../types";

interface CategoryIconProps {
  channel?: Channel | null;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  channel,
  className = "w-6 h-6 text-slate-400",
}) => {
  if (!channel) return <Tv className={className} />;

  const cat = (channel.gemeinwohlCategory || channel.group || "").toLowerCase();

  if (cat.includes("music") || cat.includes("musik"))
    return <Music className={className} />;
  if (cat.includes("news") || cat.includes("nachrichten"))
    return <Newspaper className={className} />;
  if (cat.includes("sport") || cat.includes("action") || cat.includes("sports"))
    return <Trophy className={className} />;
  if (
    cat.includes("movie") ||
    cat.includes("film") ||
    cat.includes("cinema") ||
    cat.includes("series")
  )
    return <Film className={className} />;
  if (cat.includes("kids") || cat.includes("kinder") || cat.includes("family"))
    return <Baby className={className} />;
  if (cat.includes("docu") || cat.includes("wissen") || cat.includes("science"))
    return <BookOpen className={className} />;
  if (cat.includes("radio")) return <Radio className={className} />;
  if (cat.includes("cam") || cat.includes("earth"))
    return <Camera className={className} />;
  if (cat.includes("auto") || cat.includes("motor"))
    return <Car className={className} />;
  if (cat.includes("international") || cat.includes("world"))
    return <Globe className={className} />;

  // fallback for radio channels that might not have a radio category
  if (
    channel.id.startsWith("radio-") ||
    channel.id.includes("radio") ||
    channel.url.includes("mp3") ||
    channel.url.includes("audio")
  ) {
    return <Radio className={className} />;
  }

  return <Tv className={className} />;
};
