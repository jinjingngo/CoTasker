interface FormButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

const FormButton: React.FC<FormButtonProps> = ({
  onClick,
  disabled,
  children,
}) => (
  <button
    className='absolute right-2 text-gray-700 hover:text-[salmon] disabled:cursor-not-allowed disabled:text-gray-400'
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export default FormButton;
