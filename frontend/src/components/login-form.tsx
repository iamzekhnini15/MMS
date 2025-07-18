import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '@/contexts/UserContext';
import { UserContextType } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { loginUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Tous les champs sont requis.');
      return;
    }

    setError('');
    try {
      await loginUser({ email, password }, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      console.error('LoginForm::error:', err);
      setError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div
        className={cn(
          'w-full max-w-[900px] flex flex-col gap-6',
          className,
        )}
        {...props}
      >
        <Card className="overflow-hidden p-0">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0">
            {/* Formulaire de connexion */}
            <form
              className="p-6 md:p-10 flex flex-col gap-6"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col items-center text-center gap-1">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground">
                  Login to your Acme Inc account
                </p>
              </div>

              {/* Boutons sociaux */}
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-center"
                >
                  <FcGoogle className="text-xl" />
                  Se connecter avec Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-center"
                >
                  <FaGithub className="text-xl" />
                  Se connecter avec GitHub
                </Button>
              </div>

              <div className="relative my-2">
                <hr className="border-gray-300" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-500">
                  ou
                </span>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-900">
                  Se souvenir de moi
                </Label>
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>

            {/* Image à droite */}
            <div className="hidden md:flex items-center justify-center bg-gray-100">
              <img
                src="/assets/login-illustration.svg"
                alt="Login Illustration"
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
