import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { TooltipArrow } from "@radix-ui/react-tooltip";
interface LabelTooltipProps {
  className?: string;
  label: React.ReactNode;
  description?: string;
}

export const LabelTooltip = ({
  className,
  label,
  description,
}: LabelTooltipProps) => {
  return (
    <>
      <TooltipProvider>
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Label className={`${className}`}>{label}</Label>
          </TooltipTrigger>
          <TooltipContent side={"right"}>
            <p>{description}</p>
            <TooltipArrow className="fill-primary" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
