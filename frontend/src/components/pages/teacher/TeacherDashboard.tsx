import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const TeacherDashboard: React.FC = () => {
  const navigationCards = [
    {
      title: 'Gestion des Évaluations',
      description: 'Créer, modifier et organiser vos évaluations',
      icon: ClipboardDocumentListIcon,
      href: '/teacher/evaluations',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Saisie des Notes',
      description:
        'Interface de saisie par évaluation avec liste des étudiants',
      icon: AcademicCapIcon,
      href: '/teacher/grades',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Périodes de Bulletin',
      description: "Gérer les périodes d'évaluation (trimestres, semestres...)",
      icon: CalendarDaysIcon,
      href: '/teacher/periods',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Coefficients par Matière',
      description: 'Configurer les coefficients pour chaque matière et classe',
      icon: ChartBarIcon,
      href: '/teacher/coefficients',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Mes Classes',
      description: "Vue d'ensemble de vos classes et étudiants",
      icon: UserGroupIcon,
      href: '/teacher/classes',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Bulletins',
      description: 'Générer et consulter les bulletins de notes',
      icon: DocumentTextIcon,
      href: '/teacher/bulletins',
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header responsive */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Tableau de Bord Enseignant
        </h1>
        <p className="text-base sm:text-lg text-gray-600 px-2">
          Système de Gestion des Évaluations et des Notes
        </p>
      </div>

      {/* Quick stats responsive */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2">
              🎓 Bienvenue dans votre espace enseignant
            </h2>
            <p className="text-sm sm:text-base text-blue-700">
              Gérez facilement vos évaluations, notes et bulletins depuis cette
              interface unifiée.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {navigationCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className={`${card.color} transition-colors cursor-pointer group`}
              onClick={() => (window.location.href = card.href)}
            >
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`p-2 rounded-lg bg-white shadow-sm ${card.iconColor}`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <CardTitle className="text-base sm:text-lg group-hover:underline">
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions responsive */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            ⚡ Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Button
              className="h-10 sm:h-12 text-sm sm:text-base bg-blue-600 hover:bg-blue-700"
              onClick={() => (window.location.href = '/teacher/evaluations')}
            >
              ➕ Nouvelle Évaluation
            </Button>
            <Button
              variant="outline"
              className="h-10 sm:h-12 text-sm sm:text-base border-green-300 hover:bg-green-50"
              onClick={() => (window.location.href = '/teacher/periods')}
            >
              📅 Gérer les Périodes
            </Button>
            <Button
              variant="outline"
              className="h-10 sm:h-12 text-sm sm:text-base border-purple-300 hover:bg-purple-50"
              onClick={() => (window.location.href = '/teacher/bulletins')}
            >
              📋 Consulter Bulletins
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section responsive */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
              💡 Aide et Support
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Besoin d'aide pour utiliser le système de gestion des notes ?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <Button size="sm" variant="outline" className="text-xs sm:text-sm h-8 sm:h-9">
                📖 Guide d'utilisation
              </Button>
              <Button size="sm" variant="outline" className="text-xs sm:text-sm h-8 sm:h-9">
                💬 Support technique
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
