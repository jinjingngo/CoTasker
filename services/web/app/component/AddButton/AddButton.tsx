import { FC, ReactNode } from 'react';

interface AddButtonProps {
  onClick: () => void;
  className?: string;
  disabled: boolean;
  children: ReactNode;
}

const AddButton: FC<AddButtonProps> = ({
  onClick,
  className = '',
  disabled,
  children,
}) => (
  <button
    className={`${className} text-gray-700 hover:text-[salmon] disabled:cursor-not-allowed disabled:text-gray-400`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export default AddButton;
