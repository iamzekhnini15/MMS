import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import {
  getAuthenticatedUser,
  clearAuthenticatedUser,
} from '../../utils/session';
import { UserContextType } from '../../types';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DarkModeToggle from '@/components/ui/dark-mode-toggle';

// Icons
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  Mail,
  Phone,
  Settings,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
} from 'lucide-react';

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  gradeNotifications: boolean;
  courseNotifications: boolean;
  bulletinNotifications: boolean;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { authenticatedUser, clearUser } =
    useContext<UserContextType>(UserContext);

  // Password change state
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    gradeNotifications: true,
    courseNotifications: true,
    bulletinNotifications: true,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(
    null,
  );

  // Profile info state
  const [profileInfo, setProfileInfo] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
  });

  // Load user data and notification settings on component mount
  useEffect(() => {
    if (authenticatedUser?.user) {
      setProfileInfo({
        firstname: authenticatedUser.user.firstname || '',
        lastname: authenticatedUser.user.lastname || '',
        email: authenticatedUser.user.email || '',
        phone: authenticatedUser.user.phone || '',
      });

      // Load notification settings
      loadNotificationSettings();
    }
  }, [authenticatedUser]);

  const loadNotificationSettings = async () => {
    const auth = getAuthenticatedUser();
    if (!auth) return;

    try {
      const response = await fetch('/api/users/me/notifications', {
        headers: {
          Authorization: `${auth.token}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        setNotifications(settings);
      }
    } catch (err) {
      console.error('Failed to load notification settings:', err);
    }
  };

  const saveNotificationSettings = async (
    newSettings: NotificationSettings,
  ) => {
    const auth = getAuthenticatedUser();
    if (!auth) return;

    setNotificationsLoading(true);
    setNotificationError(null);
    setNotificationSuccess(null);

    try {
      const response = await fetch('/api/users/me/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${auth.token}`,
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setNotificationSuccess(
          'Préférences de notification sauvegardées avec succès',
        );
        setTimeout(() => setNotificationSuccess(null), 3000);
      } else {
        setNotificationError('Erreur lors de la sauvegarde des préférences');
      }
    } catch (err) {
      setNotificationError(
        (err as { message?: string })?.message || 'Erreur inconnue',
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  const testEmailNotification = async () => {
    const auth = getAuthenticatedUser();
    if (!auth) return;

    setNotificationsLoading(true);
    setNotificationError(null);
    setNotificationSuccess(null);
    try {
      const response = await fetch('/api/users/me/notifications/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${auth.token}`,
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        setNotificationSuccess('Email de test envoyé avec succès');
        setTimeout(() => setNotificationSuccess(null), 3000);
      } else {
        const text = await response.text();
        try {
          const body = JSON.parse(text);
          if (body?.message) setNotificationError(body.message);
          else if (body?.error) setNotificationError(body.error);
          else
            setNotificationError(
              `Erreur lors de l'envoi de l'email de test: ${response.status}`,
            );
        } catch (e) {
          setNotificationError(
            `Erreur lors de l'envoi de l'email de test: ${response.status} ${text}`,
          );
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNotificationError(err.message);
      } else {
        setNotificationError('Erreur inconnue');
      }
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(
        'Le nouveau mot de passe doit contenir au moins 6 caractères',
      );
      setPasswordLoading(false);
      return;
    }

    const auth = getAuthenticatedUser();
    if (!auth) {
      setPasswordError('Utilisateur non authentifié');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auths/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${auth.token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          newPasswordConfirmation: passwordForm.confirmPassword,
        }),
      });

      if (response.ok) {
        setPasswordSuccess(
          'Mot de passe modifié avec succès. Vous allez être redirigé vers la page de connexion.',
        );
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // Clear auth and redirect after delay
        setTimeout(() => {
          clearUser();
          clearAuthenticatedUser();
          navigate('/login');
        }, 2000);
      } else if (response.status === 403) {
        setPasswordError("L'ancien mot de passe est incorrect");
      } else {
        const text = await response.text();
        setPasswordError(
          `Erreur lors du changement de mot de passe: ${response.status} ${text}`,
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Erreur inconnue');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = async (
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    const newSettings = {
      ...notifications,
      [key]: value,
    };
    setNotifications(newSettings);

    // Save to backend
    await saveNotificationSettings(newSettings);
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getUserRoleBadge = () => {
    if (!authenticatedUser?.user) return null;

    const role = authenticatedUser.user.role;
    const roleColors = {
      ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      TEACHER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      STUDENT:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };

    return (
      <Badge
        className={
          roleColors[role as keyof typeof roleColors] ||
          'bg-gray-100 text-gray-800'
        }
      >
        {role}
      </Badge>
    );
  };

  if (!authenticatedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Accès non autorisé</h3>
              <p className="text-muted-foreground mb-4">
                Vous devez être connecté pour accéder aux paramètres.
              </p>
              <Button onClick={() => navigate('/login')}>Se connecter</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Paramètres
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gérez vos préférences et paramètres de compte
          </p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src=""
                    alt={`${profileInfo.firstname} ${profileInfo.lastname}`}
                  />
                  <AvatarFallback className="text-lg">
                    {profileInfo.firstname?.charAt(0)?.toUpperCase()}
                    {profileInfo.lastname?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-semibold">
                      {profileInfo.firstname} {profileInfo.lastname}
                    </h2>
                    {getUserRoleBadge()}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profileInfo.email}
                  </p>
                  {profileInfo.phone && (
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      {profileInfo.phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Apparence
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations du profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">Prénom</Label>
                      <Input
                        id="firstname"
                        value={profileInfo.firstname}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Nom</Label>
                      <Input
                        id="lastname"
                        value={profileInfo.lastname}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileInfo.email}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={profileInfo.phone}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          Modification du profil
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                          Pour modifier vos informations personnelles, veuillez
                          contacter l'administration.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Sécurité et confidentialité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Changer le mot de passe
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="oldPassword">
                            Mot de passe actuel
                          </Label>
                          <div className="relative">
                            <Input
                              id="oldPassword"
                              type={showPasswords.old ? 'text' : 'password'}
                              value={passwordForm.oldPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  oldPassword: e.target.value,
                                }))
                              }
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => togglePasswordVisibility('old')}
                            >
                              {showPasswords.old ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">
                            Nouveau mot de passe
                          </Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => togglePasswordVisibility('new')}
                            >
                              {showPasswords.new ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirmer le nouveau mot de passe
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                togglePasswordVisibility('confirm')
                              }
                            >
                              {showPasswords.confirm ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {passwordError && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                          <p className="text-sm text-red-700 dark:text-red-200">
                            {passwordError}
                          </p>
                        </div>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <p className="text-sm text-green-700 dark:text-green-200">
                            {passwordSuccess}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full md:w-auto"
                    >
                      {passwordLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Modification en cours...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Changer le mot de passe
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Préférences de notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifications par email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des notifications importantes par email
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(value) =>
                          handleNotificationChange('emailNotifications', value)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifications SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des notifications importantes par SMS
                        </p>
                      </div>
                      <Switch
                        checked={notifications.smsNotifications}
                        onCheckedChange={(value) =>
                          handleNotificationChange('smsNotifications', value)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifications de notes</Label>
                        <p className="text-sm text-muted-foreground">
                          Être notifié lors de la publication de nouvelles notes
                        </p>
                      </div>
                      <Switch
                        checked={notifications.gradeNotifications}
                        onCheckedChange={(value) =>
                          handleNotificationChange('gradeNotifications', value)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifications de cours</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir des notifications sur les changements de
                          cours
                        </p>
                      </div>
                      <Switch
                        checked={notifications.courseNotifications}
                        onCheckedChange={(value) =>
                          handleNotificationChange('courseNotifications', value)
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifications de bulletins</Label>
                        <p className="text-sm text-muted-foreground">
                          Être notifié lors de la publication de nouveaux
                          bulletins
                        </p>
                      </div>
                      <Switch
                        checked={notifications.bulletinNotifications}
                        onCheckedChange={(value) =>
                          handleNotificationChange(
                            'bulletinNotifications',
                            value,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Status Messages */}
                  {notificationError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-200">
                          {notificationError}
                        </p>
                      </div>
                    </div>
                  )}

                  {notificationSuccess && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <p className="text-sm text-green-700 dark:text-green-200">
                          {notificationSuccess}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Test Button */}
                  <div className="flex gap-4">
                    <Button
                      onClick={testEmailNotification}
                      disabled={notificationsLoading}
                      variant="outline"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Tester l'email
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          Note sur les notifications
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                          Certaines notifications importantes ne peuvent pas
                          être désactivées pour des raisons de sécurité.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Apparence et thème
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Mode sombre</Label>
                        <p className="text-sm text-muted-foreground">
                          Basculer entre le thème clair et sombre
                        </p>
                      </div>
                      <DarkModeToggle />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Langue de l'interface</Label>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Français</span>
                          <Badge variant="secondary">Actuel</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                          Fonctionnalités à venir
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                          Plus d'options de personnalisation seront disponibles
                          dans les futures mises à jour.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
