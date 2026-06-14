import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export function InfoTooltip({ content }: { content: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 ml-1.5 inline-block text-white/30 hover:text-white/80 cursor-help transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px] bg-[#050505] border border-white/10 text-white/80 p-3 text-xs leading-relaxed shadow-xl" sideOffset={6}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
