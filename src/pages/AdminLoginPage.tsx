import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { adminLogin } from '../services/storage';

interface AdminLoginPageProps {
  onSuccess: () => void;
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, navigate }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="bg-[#f5f5f0] min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#e0e4da] bg-white p-8 sm:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#101318] text-[#c8fa55] flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck size={24} />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#647f20] tracking-wider block pt-2">
            PRIVATE CONTROL CENTER
          </span>
          <h1 className="text-2xl font-black text-[#101318]">دخول الإدارة</h1>
          <p className="text-xs text-[#687078] leading-relaxed">
            هذه المنطقة مخصصة لإدارة العملاء المحتملين وطلبات التسعير والعروض وسجلات المساعد الذكي.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
            كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#101318] mb-1.5 flex items-center gap-1.5">
              <Lock size={14} className="text-[#647f20]" />
              <span>كلمة مرور الإدارة</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#e0e4da] bg-[#fbfcf8] text-xs outline-none focus:border-[#647f20] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#101318] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#2b3038] transition-all cursor-pointer shadow-sm"
          >
            دخول آمن ←
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-[#788590] border-t border-[#edf0e9] space-y-2">
          <p>
            تلميح للتجربة: كلمة المرور الافتراضية هي <code className="bg-[#edf4df] text-[#2d421d] px-2 py-0.5 rounded font-mono font-bold">victoria2026</code>
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-[#647f20] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
