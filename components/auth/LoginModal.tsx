import React from 'react';
import { Shield, X, AlertCircle, Check, Loader2, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRegistering: boolean;
  setIsRegistering: (val: boolean) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  authError: string;
  authSuccess: string;
  handleAuth: (e: React.FormEvent) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen, onClose, isRegistering, setIsRegistering,
  email, setEmail, password, setPassword,
  loading, authError, authSuccess, handleAuth
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 border border-slate-100 overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full"></div>

        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors group">
          <X className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
        </button>

        <div className="text-center mb-10 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/50">
            <KeyRound className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {isRegistering ? 'Crea Account' : 'Accesso Riservato'}
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {isRegistering ? 'Unisciti alla piattaforma MWS PIATTAFORMA COD' : 'Gestisci le tue landing page e i tuoi ordini'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 relative">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Aziendale</label>
            <input 
              type="email" 
              placeholder="nome@azienda.it" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-300 shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Sicura</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-300 shadow-sm"
            />
          </div>

          {authError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in shake-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-bold leading-tight">{authError}</p>
            </div>
          )}

          {authSuccess && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-600 font-bold leading-tight">{authSuccess}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-400"/> : (
              <>
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>{isRegistering ? 'Inizia Ora' : 'Entra nel Portale'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center relative">
          <p className="text-xs text-slate-500 font-medium">
            {isRegistering ? 'Hai già un account abilitato?' : 'Non hai ancora un account?'} 
            <button 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="ml-1.5 font-black text-emerald-600 hover:text-emerald-700 transition-colors underline decoration-emerald-500/30 underline-offset-4"
            >
              {isRegistering ? 'Accedi' : 'Contatta Amministratore'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};