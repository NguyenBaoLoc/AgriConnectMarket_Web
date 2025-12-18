import { User, type LucideProps } from "lucide-react";
import type { ElementType } from "react";
interface InfoRowProps {
    icon: ElementType<LucideProps>;
    value: string;
}
export function InfoRow({ icon: Icon, value }: InfoRowProps) {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Icon className="w-5 h-5 text-gray-400" />
            <span>{value}</span>
        </div>
    );
}