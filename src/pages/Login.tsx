import { useState, useEffect } from 'react';
import { Brain, Mail, Lock, Loader2, UserPlus, AlertCircle, ArrowLeft, Crown, Users, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { companyCodeService } from '../services/companyCodeService';
import { supabase } from '../lib/supabase';

type LoginMode = 'choice' | 'manager' | 'employee';

export const Login = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();
  const selectedRole = sessionStorage.getItem('selectedRole');
  const initialMode: LoginMode = selectedRole === 'manager' ? 'manager' : selectedRole === 'member' ? 'employee' : 'choice';
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isManagerSignUp, setIsManagerSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && mode === 'choice') {
      console.log('[Login] Auto-redirection basée sur le rôle');
      const checkUserRole = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, assigned_team_id')
          .eq('id', user.id)
          .maybeSingle();

        console.log('[Login] Profil trouvé pour auto-redirect:', profile);

        if (profile?.role === 'manager' && profile?.assigned_team_id) {
          const { data: team } = await supabase
            .from('teams')
            .select('slug')
            .eq('id', profile.assigned_team_id)
            .single();

          if (team) {
            console.log('[Login] Redirection manager vers:', `/manager/${team.slug}`);
            window.location.href = `/manager/${team.slug}`;
          } else {
            navigate('/role-selection');
          }
        } else if (profile?.role === 'member') {
          console.log('[Login] Redirection membre vers /app');
          window.location.href = '/app';
        } else {
          console.log('[Login] Pas de rôle, vers role-selection');
          navigate('/role-selection');
        }
      };

      checkUserRole();
    }
  }, [user, loading, navigate, mode]);

  const handleModeChange = async (newMode: LoginMode) => {
    if (user && newMode !== 'choice') {
      await signOut();
    }
    setMode(newMode);
    setError(null);
  };

  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('1. Vérification du code entreprise:', companyCode);
      const company = await companyCodeService.getCompanyByCode(companyCode);
      console.log('2. Company trouvée:', company);

      if (!company) {
        throw new Error('Code Entreprise invalide. Accès refusé.');
      }

      let userData;

      if (isManagerSignUp) {
        console.log('3. Création du compte manager avec:', email);
        const { error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) throw signUpError;

        console.log('4. Connexion après inscription...');
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        if (!data?.user) throw new Error('Échec de connexion après inscription');
        userData = data;
      } else {
        console.log('3. Tentative de connexion avec:', email);
        const { data, error } = await signIn(email, password);
        console.log('4. Résultat connexion:', { data, error });

        if (error) throw error;
        if (!data?.user) throw new Error('Échec de connexion');
        userData = data;
      }

      const teamSlug = company.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('5. Team slug généré:', teamSlug);

      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id, slug')
        .eq('slug', teamSlug)
        .maybeSingle();

      console.log('6. Équipe existante:', existingTeam);

      let teamId = existingTeam?.id;

      if (!existingTeam) {
        console.log('7. Création de la nouvelle équipe...');
        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert({
            name: company.company_name,
            slug: teamSlug,
            created_by: userData.user.id
          })
          .select('id, slug')
          .single();

        console.log('8. Nouvelle équipe créée:', newTeam, 'Erreur:', teamError);
        if (teamError) throw teamError;
        teamId = newTeam.id;

        await supabase.from('team_members').insert({
          team_id: teamId,
          user_id: userData.user.id,
          role: 'owner'
        });
        console.log('9. Membre de l\'équipe ajouté');
      }

      console.log('10. Mise à jour du profil avec teamId:', teamId);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'manager',
          company_code: companyCode.toUpperCase(),
          assigned_team_id: teamId
        })
        .eq('id', userData.user.id);

      if (profileError) {
        console.error('Erreur mise à jour profil:', profileError);
        throw profileError;
      }

      console.log('11. Profil mis à jour avec succès');

      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('12. Vérification du profil mis à jour...');
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('role, assigned_team_id')
        .eq('id', userData.user.id)
        .single();

      console.log('13. Profil vérifié:', updatedProfile);

      if (!updatedProfile || updatedProfile.role !== 'manager' || !updatedProfile.assigned_team_id) {
        throw new Error('Le profil n\'a pas été correctement mis à jour');
      }

      const redirectUrl = `/manager/${existingTeam?.slug || teamSlug}`;
      console.log('14. Redirection vers:', redirectUrl);
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('Erreur complète:', err);
      setError(err.message || 'Échec de l\'authentification Manager');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        navigate('/role-selection');
      } else {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        if (!data?.user) throw new Error('Échec de connexion');

        await supabase
          .from('profiles')
          .update({ role: 'member' })
          .eq('id', data.user.id);

        window.location.href = '/app';
      }
    } catch (err: any) {
      setError(err.message || 'Échec de l\'authentification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/5 to-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <button
        onClick={() => {
          if (mode === 'choice') {
            navigate('/');
          } else {
            sessionStorage.removeItem('selectedRole');
            navigate('/role-selection');
          }
        }}
        className="absolute top-6 left-6 z-10 p-3 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm border border-slate-700/50 rounded-xl transition-all text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
              <Brain className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Flux.AI</h1>
            <p className="text-slate-400 text-center">
              {mode === 'choice' ? 'Choisissez votre espace' : mode === 'manager' ? 'Espace Manager' : 'Espace Employé'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
              >
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => handleModeChange('manager')}
                  className="w-full p-6 bg-gradient-to-r from-amber-500/10 to-orange-600/10 hover:from-amber-500/20 hover:to-orange-600/20 border border-amber-500/30 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-bold text-white mb-1">Accéder à l'Espace Manager</h3>
                      <p className="text-sm text-slate-400">Pour piloter les équipes et la stratégie</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleModeChange('employee')}
                  className="w-full p-6 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 border border-cyan-500/30 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-bold text-white mb-1">Accéder à l'Espace Employé</h3>
                      <p className="text-sm text-slate-400">Pour gérer vos outils et votre progression</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}

            {mode === 'manager' && (
              <motion.form
                key="manager"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleManagerLogin}
                className="space-y-5"
              >
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <Key className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-amber-400 font-semibold text-sm mb-1">
                        {isManagerSignUp ? 'Créer Compte Manager' : 'Connexion Sécurisée'}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {isManagerSignUp
                          ? 'Créez votre compte Manager avec un Code Entreprise valide'
                          : 'Entrez votre Code Entreprise et vos identifiants Manager'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Code Entreprise
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                      placeholder="MARKETING, COMPTABILITE, RH..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all uppercase"
                      required
                    />
                  </div>
                </div>

                {isManagerSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nom Complet
                    </label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Administrateur
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="manager@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mot de Passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg py-3 font-semibold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>{isManagerSignUp ? 'Création...' : 'Vérification...'}</span>
                    </>
                  ) : (
                    <>
                      <Crown size={18} />
                      <span>{isManagerSignUp ? 'Créer Compte Manager' : 'Accéder à l\'Espace Manager'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsManagerSignUp(!isManagerSignUp);
                    setError(null);
                  }}
                  className="w-full text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {isManagerSignUp ? 'Déjà inscrit ? Se connecter' : 'Pas encore inscrit ? Créer un compte'}
                </button>
              </motion.form>
            )}

            {mode === 'employee' && (
              <motion.form
                key="employee"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmployeeAuth}
                className="space-y-5"
              >
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nom Complet
                    </label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Professionnel
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mot de Passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg py-3 font-semibold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <span>{isSignUp ? 'Créer mon compte' : 'Se Connecter'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="w-full text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {isSignUp ? 'Déjà inscrit ? Se connecter' : 'Pas encore inscrit ? Créer un compte'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
