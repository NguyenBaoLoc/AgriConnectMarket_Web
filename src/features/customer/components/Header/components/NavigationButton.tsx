import type { ElementType } from "react";
import { Button } from "../../../../../components/ui/button";
import type { LucideProps } from "lucide-react";

interface NavigationButtonProps {
    icon: ElementType<LucideProps>;
    onClick: () => void;
    count?: number;
    badgeColor?: string;
}
export function NavigationButton({ icon: Icon, onClick, count, badgeColor = "green" }: NavigationButtonProps) {
    return (
        <Button variant="ghost" size="icon" className="relative" onClick={onClick}>
            <Icon className="h-5 w-5" />
            {count !== undefined && count > 0 && (
                <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full bg-${badgeColor}-600 text-white flex items-center justify-center text-xs`}>
                    {count}
                </span>
            )}
        </Button>
    )
}

