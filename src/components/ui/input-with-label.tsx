import { Input } from "./input";
import { Label } from "./label";

export interface InputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export default function InputWithLabel({ id, label, type, ...props }: InputWithLabelProps) {
  return (
    <div className="relative w-full">
      <Input
        className="peer flex h-10 w-full appearance-none border-2 border-primary border-opacity-40 bg-background px-4 pb-2.5 pt-3 text-sm hover:border-opacity-100 focus:border-[3px] focus:border-opacity-100 focus:outline-none"
        id={id}
        type={type}
        {...props}
        placeholder=""
      />
      <Label
        className="sm sm: absolute left-1 top-1.5 z-10 origin-[0] -translate-y-3 scale-75 transform rounded-sm bg-background px-3 text-xs text-black duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-xs peer-focus:top-2.5 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 sm:-translate-y-4 sm:text-sm sm:peer-focus:top-1.5 sm:peer-focus:text-sm"
        htmlFor={id}
      >
        {label}
      </Label>
    </div>
  );
}
