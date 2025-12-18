import { Input } from "../../../../components/ui/input";
interface InputRowProps {
    icon: React.ElementType;
    id: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export function InputRow({ icon: Icon, id, type, value, onChange }: InputRowProps) {
    return (
        <div className="relative">
            <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                className="pl-10"
            />
        </div>
    );
}