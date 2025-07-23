import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  PlusIcon, 
  TrashIcon, 
  CalendarIcon,
  PencilSquareIcon as EditIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import BulletinPeriodContext from '../../../contexts/BulletinPeriodContext';
import { BulletinPeriod } from '../../../types';

const BulletinPeriodsManagement: React.FC = () => {
  const {
    periods,
    currentPeriod,
    loading,
    error,
    fetchActivePeriods,
    fetchAllPeriods,
    fetchCurrentPeriod,
    createPeriod,
    updatePeriod,
    deletePeriod,
  } = useContext(BulletinPeriodContext);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<BulletinPeriod | null>(
    null,
  );

  const [newPeriod, setNewPeriod] = useState<Partial<BulletinPeriod>>({
    name: '',
    startDate: '',
    endDate: '',
    academicYear: '',
    isActive: true,
  });

  useEffect(() => {
    if (showAllPeriods) {
      fetchAllPeriods();
    } else {
      fetchActivePeriods();
    }
    fetchCurrentPeriod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllPeriods]);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriod.name || !newPeriod.startDate || !newPeriod.endDate) return;

    try {
      if (editingPeriod) {
        await updatePeriod(editingPeriod.idPeriod!, {
          ...newPeriod,
          idPeriod: editingPeriod.idPeriod,
        } as BulletinPeriod);
      } else {
        await createPeriod(newPeriod as BulletinPeriod);
      }
      setShowCreateForm(false);
      setEditingPeriod(null);
      resetForm();
    } catch (err) {
      console.error('Failed to save period:', err);
    }
  };

  const handleEditPeriod = (period: BulletinPeriod) => {
    setEditingPeriod(period);
    setNewPeriod({
      name: period.name,
      startDate: period.startDate.split('T')[0],
      endDate: period.endDate.split('T')[0],
      academicYear: period.academicYear,
      isActive: period.isActive,
    });
    setShowCreateForm(true);
  };

  const handleToggleActive = async (period: BulletinPeriod) => {
    try {
      await updatePeriod(period.idPeriod!, {
        ...period,
        isActive: !period.isActive,
      });
    } catch (err) {
      console.error('Failed to toggle period status:', err);
    }
  };

  const handleDeletePeriod = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette période ?')) {
      try {
        await deletePeriod(id);
      } catch (err) {
        console.error('Failed to delete period:', err);
      }
    }
  };

  const resetForm = () => {
    setNewPeriod({
      name: '',
      startDate: '',
      endDate: '',
      academicYear: '',
      isActive: true,
    });
    setEditingPeriod(null);
  };

  const handleCancelEdit = () => {
    setShowCreateForm(false);
    setEditingPeriod(null);
    resetForm();
  };

  const isCurrentPeriod = (period: BulletinPeriod) => {
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return now >= start && now <= end && (period.isActive || false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Erreur: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des Périodes de Bulletin
        </h1>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Switch 
              checked={showAllPeriods}
              onCheckedChange={setShowAllPeriods}
            />
            <span className="text-sm">Afficher toutes les périodes</span>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvelle Période
          </Button>
        </div>
      </div>

      {/* Période actuelle */}
      {currentPeriod && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">
                Période actuelle: {currentPeriod.name}
              </span>
              <Badge className="bg-green-100 text-green-800">
                {new Date(currentPeriod.startDate).toLocaleDateString()} -{' '}
                {new Date(currentPeriod.endDate).toLocaleDateString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              {editingPeriod ? 'Modifier la période' : 'Créer une nouvelle période'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la période *</Label>
                <Input
                  id="name"
                  value={newPeriod.name || ''}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, name: e.target.value })
                  }
                  placeholder="Ex: Trimestre 1, Semestre 2..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="academicYear">Année académique *</Label>
                <Input
                  id="academicYear"
                  value={newPeriod.academicYear || ''}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, academicYear: e.target.value })
                  }
                  placeholder="Ex: 2024-2025"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newPeriod.startDate || ''}
                    onChange={(e) =>
                      setNewPeriod({ ...newPeriod, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newPeriod.endDate || ''}
                    onChange={(e) =>
                      setNewPeriod({ ...newPeriod, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={newPeriod.isActive || false}
                  onChange={(e) =>
                    setNewPeriod({ ...newPeriod, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="active">Période active</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {editingPeriod ? 'Modifier la période' : 'Créer la période'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}



      {/* Liste des périodes */}
      <div className="grid gap-4">
        {(showAllPeriods ? periods : periods?.filter(p => p.isActive))?.map((period: BulletinPeriod) => (
          <Card
            key={period.idPeriod}
            className={`hover:shadow-md transition-shadow ${
              isCurrentPeriod(period) ? 'border-green-300 bg-green-50' : ''
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{period.name}</h3>
                    {isCurrentPeriod(period) && (
                      <Badge className="bg-green-100 text-green-800">
                        Période actuelle
                      </Badge>
                    )}
                    <Badge
                      variant={
                        period.isActive || false ? 'default' : 'secondary'
                      }
                    >
                      {period.isActive || false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>
                      📅 Début:{' '}
                      {new Date(period.startDate).toLocaleDateString()}
                    </span>
                    <span>
                      📅 Fin: {new Date(period.endDate).toLocaleDateString()}
                    </span>
                    <span>
                      ⏱️{' '}
                      {Math.ceil(
                        (new Date(period.endDate).getTime() -
                          new Date(period.startDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{' '}
                      jours
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={period.isActive ? "default" : "outline"}
                    className={period.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => handleToggleActive(period)}
                    title={period.isActive ? "Désactiver" : "Activer"}
                  >
                    {period.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPeriod(period)}
                    title="Modifier la période"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeletePeriod(period.idPeriod!)}
                    disabled={isCurrentPeriod(period)}
                    title="Supprimer la période"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!periods || periods.length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 mb-4">Aucune période trouvée</p>
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                Créer votre première période
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BulletinPeriodsManagement;
