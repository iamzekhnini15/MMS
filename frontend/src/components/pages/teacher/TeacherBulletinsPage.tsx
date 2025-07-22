import React, { useEffect, useState, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import type { BulletinPeriod } from '../../../types';

const TeacherBulletinsPage: React.FC = () => {
  const { periods, loading, error, fetchActivePeriods } = useContext(
    BulletinPeriodContext,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    academicYear: '2024-2025',
    description: '',
  });

  useEffect(() => {
    fetchActivePeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/bulletin-periods/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create period');
      }

      // Reset form and close
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        academicYear: '2024-2025',
        description: '',
      });
      setShowCreateForm(false);

      // Refresh periods
      fetchActivePeriods();
    } catch (err) {
      console.error('Error creating period:', err);
    }
  };

  const deletePeriod = async (periodId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette période ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bulletin-periods/${periodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete period');
      }

      fetchActivePeriods();
    } catch (err) {
      console.error('Error deleting period:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isDateInRange = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">
            Chargement des périodes...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Périodes de Bulletin
            </h1>
            <p className="text-gray-600">
              Gérez les périodes d'évaluation (trimestres, semestres...)
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvelle période
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Créer une nouvelle période</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la période
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Premier trimestre 2024-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année académique
                  </label>
                  <Input
                    required
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYear: e.target.value })
                    }
                    placeholder="2024-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnelle)
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description de la période..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Créer la période</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Periods List */}
      {!periods || periods.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune période trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre première période de bulletin pour organiser vos
              évaluations.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Créer une période
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {periods.map((period: BulletinPeriod) => (
            <Card
              key={period.idPeriod}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {period.name}
                    </CardTitle>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="h-4 w-4" />
                          {formatDate(period.startDate)} -{' '}
                          {formatDate(period.endDate)}
                        </span>
                        <span>
                          <strong>Année:</strong> {period.academicYear}
                        </span>
                      </div>
                      {period.description && (
                        <p className="text-sm text-gray-600">
                          {period.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={period.isActive ? 'default' : 'secondary'}>
                      {period.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge
                      variant={
                        isDateInRange(period.startDate, period.endDate)
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {isDateInRange(period.startDate, period.endDate)
                        ? 'En cours'
                        : 'Fermée'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Période pour la gestion des bulletins et évaluations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        console.log('View period:', period.idPeriod)
                      }
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        console.log('Edit period:', period.idPeriod)
                      }
                    >
                      <PencilSquareIcon className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        period.idPeriod && deletePeriod(period.idPeriod)
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherBulletinsPage;
