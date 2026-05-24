import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton = ({ to }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors mb-4 text-sm"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
};
