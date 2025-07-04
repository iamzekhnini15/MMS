import React, { useContext, useState } from 'react';
import { RegisterFormData, UserContextType } from '@/types'; // adapte le chemin selon ton projet
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { UserContext } from '@/contexts/UserContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    phone: '',
    role: 'ADMIN',
    civility: '',
    active: true,
    address: {
      street: '',
      number: '',
      postalCode: '',
      commune: '',
      country: '',
      box: '',
      idAddress: 0,
    },
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerUser }: UserContextType = useContext(UserContext);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setIsSubmitting(false);
      return;
    }

    try {
      await registerUser(formData);

      setSuccess('Compte créé avec succès !');
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        phone: '',
        role: 'USER',
        civility: '',
        active: true,
        address: {
          street: '',
          number: '',
          postalCode: '',
          commune: '',
          country: '',
          box: '',
          idAddress: 0,
        },
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 mt-10">
      <CardContent>
        <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstname">Prénom</Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastname">Nom</Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Civilité</Label>
              <Select
                value={formData.civility}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, civility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une civilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Monsieur</SelectItem>
                  <SelectItem value="F">Madame</SelectItem>
                  <SelectItem value="X">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                disabled
                className="cursor-not-allowed opacity-70"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="passwordConfirmation">Confirmation</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                name="passwordConfirmation"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-8">Adresse</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Rue</Label>
              <Input
                id="street"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="number">Numéro</Label>
              <Input
                id="number"
                name="number"
                value={formData.address.number}
                onChange={handleAddressChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="box">Boîte</Label>
              <Input
                id="box"
                name="box"
                value={formData.address.box}
                onChange={handleAddressChange}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.address.postalCode}
                onChange={handleAddressChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="commune">Commune</Label>
              <Input
                id="commune"
                name="commune"
                value={formData.address.commune}
                onChange={handleAddressChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                name="country"
                value={formData.address.country}
                onChange={handleAddressChange}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className={cn('mt-6 w-full')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Créer un compte'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
