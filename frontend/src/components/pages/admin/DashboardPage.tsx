import React, { useContext } from 'react';
import { KpiContext } from '../../../contexts/DashboardContext';
import { KpiData } from '../../../types';

const Dashboard: React.FC = () => {
  const { kpis, error } = useContext(KpiContext);

  const stats = [
    {
      key: 'teachers',
      title: 'Enseignants',
      icon: 'fa-solid fa-chalkboard-teacher',
      color: 'bg-green-500',
    },
    {
      key: 'classes',
      title: 'Classes',
      icon: 'fa-solid fa-school',
      color: 'bg-yellow-500',
    },
    {
      key: 'students',
      title: 'Élèves',
      icon: 'fa-solid fa-user-graduate',
      color: 'bg-blue-500',
    },
    {
      key: 'events',
      title: 'Événements',
      icon: 'fa-solid fa-calendar-check',
      color: 'bg-purple-500',
    },
  ];

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  console.log(kpis);

  return (
    <div className="p-6 space-y-8">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats
          .filter(
            (stat) => kpis && kpis[stat.key as keyof KpiData] !== undefined,
          )
          .map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  <i className={`${stat.icon} text-xl`}></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {kpis?.[stat.key as keyof KpiData]}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Statistiques
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total des cours</span>
              <span className="font-medium text-gray-800">127</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Salles utilisées</span>
              <span className="font-medium text-gray-800">15/20</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Heures de cours</span>
              <span className="font-medium text-gray-800">180h</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Absences & Retards
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-2 bg-red-50 rounded-lg">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <i className="fa-solid fa-user-xmark"></i>
              </div>
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-800">
                  3 absences
                </span>
                <span className="text-xs text-gray-500">Aujourd'hui</span>
              </div>
            </div>
            <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-800">
                  2 retards
                </span>
                <span className="text-xs text-gray-500">Aujourd'hui</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Actions rapides
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap !rounded-button">
              <i className="fa-solid fa-exchange-alt text-blue-600 mr-3"></i>
              <span className="text-gray-700">Modifier un cours</span>
            </button>
            <button className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap !rounded-button">
              <i className="fa-solid fa-ban text-red-600 mr-3"></i>
              <span className="text-gray-700">Signaler une absence</span>
            </button>
            <button className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap !rounded-button">
              <i className="fa-solid fa-print text-gray-600 mr-3"></i>
              <span className="text-gray-700">Imprimer le planning</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendrier et Messages récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Calendrier des événements
            </h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tout <i className="fa-solid fa-arrow-right ml-1"></i>
            </button>
          </div>
          <div className="space-y-4">
            {[
              {
                date: '18 Mai',
                title: 'Conseil de classe 3ème A',
                time: '14:00 - 16:00',
                type: 'Réunion',
              },
              {
                date: '20 Mai',
                title: 'Sortie scolaire 5ème B',
                time: '08:30 - 17:00',
                type: 'Sortie',
              },
              {
                date: '25 Mai',
                title: 'Conférence pédagogique',
                time: '09:00 - 12:00',
                type: 'Conférence',
              },
              {
                date: '01 Juin',
                title: 'Remise des bulletins',
                time: '16:30 - 19:00',
                type: 'Événement',
              },
            ].map((event, index) => (
              <div
                key={index}
                className="flex items-start p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="bg-blue-50 text-blue-600 rounded-lg p-2 text-center min-w-[60px]">
                  <span className="block text-sm font-medium">
                    {event.date}
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <i className="fa-regular fa-clock mr-1"></i>
                    <span>{event.time}</span>
                    <span className="mx-2">•</span>
                    <span>{event.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages récents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Messages récents
            </h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir tous les messages
            </button>
          </div>
          <div className="space-y-4">
            {[
              {
                sender: 'Marie Laurent',
                role: 'Enseignante',
                time: 'Il y a 30 min',
                message:
                  'Concernant la réunion de demain, pouvons-nous la décaler à 15h ?',
                unread: true,
              },
              {
                sender: 'Thomas Dubois',
                role: 'Parent',
                time: 'Il y a 2h',
                message:
                  'Je souhaiterais prendre rendez-vous pour discuter des résultats de mon fils.',
                unread: true,
              },
              {
                sender: 'Sophie Moreau',
                role: 'Enseignante',
                time: 'Hier',
                message:
                  'Les notes du dernier contrôle ont été saisies dans le système.',
                unread: false,
              },
              {
                sender: 'Philippe Leroy',
                role: 'Administration',
                time: 'Hier',
                message: 'Rappel : la formation aura lieu lundi prochain à 9h.',
                unread: false,
              },
            ].map((msg, index) => (
              <div
                key={index}
                className={`flex items-start p-3 ${msg.unread ? 'bg-blue-50' : 'hover:bg-gray-50'} rounded-lg`}
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                  {msg.sender
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-gray-800">{msg.sender}</h4>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <span className="text-xs text-gray-500 block">
                    {msg.role}
                  </span>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {msg.message}
                  </p>
                </div>
                {msg.unread && (
                  <div className="ml-2 h-2 w-2 rounded-full bg-blue-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tâches en attente */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Tâches en attente
          </h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ajouter une tâche
          </button>
        </div>
        <div className="space-y-3">
          {[
            {
              task: 'Valider les bulletins du 2ème trimestre',
              deadline: '18 Mai',
              priority: 'Haute',
              status: 'En cours',
            },
            {
              task: 'Préparer la réunion parents-professeurs',
              deadline: '20 Mai',
              priority: 'Moyenne',
              status: 'À faire',
            },
            {
              task: 'Finaliser le planning des examens',
              deadline: '25 Mai',
              priority: 'Haute',
              status: 'À faire',
            },
            {
              task: 'Mettre à jour les dossiers des élèves',
              deadline: '01 Juin',
              priority: 'Basse',
              status: 'En cours',
            },
            {
              task: 'Commander les fournitures scolaires',
              deadline: '15 Juin',
              priority: 'Moyenne',
              status: 'À faire',
            },
          ].map((task, index) => (
            <div
              key={index}
              className="flex items-center p-3 hover:bg-gray-50 rounded-lg"
            >
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{task.task}</h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <i className="fa-regular fa-calendar mr-1"></i>
                  <span>Échéance: {task.deadline}</span>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    task.priority === 'Haute'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'Moyenne'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {task.priority}
                </span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    task.status === 'En cours'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
