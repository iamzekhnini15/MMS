import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '@/contexts/UserContext';
import { UserContextType } from '@/types';
import { useRoleBasedRedirect } from '@/hooks/useRoleBasedRedirect';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, authenticatedUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const { redirectBasedOnRole } = useRoleBasedRedirect();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Tous les champs sont requis.');
      return;
    }

    setError('');
    try {
      await loginUser({ email, password }, rememberMe);
      // La redirection sera gérée par un useEffect qui surveille authenticatedUser
    } catch (err) {
      console.error('LoginForm::error:', err);
      setError('Email ou mot de passe incorrect.');
    }
  };

  // Effect pour rediriger l'utilisateur après la connexion
  useEffect(() => {
    if (authenticatedUser) {
      redirectBasedOnRole(authenticatedUser);
    }
  }, [authenticatedUser, redirectBasedOnRole]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Section gauche - Informations */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl"></div>
            <div className="relative p-12 space-y-8">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Badge variant="secondary" className="w-fit">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                    </motion.div>
                    Système MMS
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-4xl font-bold text-gray-900"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Bienvenue sur
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {' '}
                    MMS
                  </span>
                </motion.h1>

                <motion.p
                  className="text-lg text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Connectez-vous à votre plateforme de gestion des matières
                  scolaires
                </motion.p>
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Gestion Complète
                    </h3>
                    <p className="text-sm text-gray-600">
                      Cours, enseignants, étudiants et ressources
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Shield className="w-5 h-5 text-green-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sécurisé</h3>
                    <p className="text-sm text-gray-600">
                      Vos données sont protégées
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-3"
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Fiable</h3>
                    <p className="text-sm text-gray-600">
                      Disponible 24h/24, 7j/7
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <BookOpen className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Connexion
                  </h2>
                  <p className="text-gray-600">Accédez à votre espace MMS</p>
                </motion.div>

                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Adresse email
                    </Label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </motion.div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </motion.div>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Votre mot de passe"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm text-gray-700"
                      >
                        Se souvenir de moi
                      </Label>
                    </div>
                    <motion.button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Mot de passe oublié ?
                    </motion.button>
                  </motion.div>

                  {error && (
                    <motion.div
                      className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                    >
                      Se connecter
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>

                  <motion.div
                    className="text-center pt-4 border-t border-gray-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                  >
                    <p className="text-sm text-gray-600">
                      Pas encore de compte ?{' '}
                      <motion.button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Créer un compte
                      </motion.button>
                    </p>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
