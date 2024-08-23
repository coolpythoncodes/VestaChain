type Props = {
    error?: string;
};
const ErrorText = ({ error }: Props) => {
    return error && <p className="text-xs text-red-500 mt-[6px]">{error}</p>;
};

export default ErrorText;
