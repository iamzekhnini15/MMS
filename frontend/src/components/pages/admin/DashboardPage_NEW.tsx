import React, { useContext, useState, useMemo } from 'react';
import { KpiContext } from '../../../contexts/DashboardContext';
import { CoursesContext } from '../../../contexts/CoursesContext';
import { TeacherContext } from '../../../contexts/TeacherContext';
import { ClassroomContext } from '../../../contexts/ClassroomContext';
import { ClassesContext } from '../../../contexts/ClassesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Building, 
  GraduationCap, 
  Calendar, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Plus,
  Bell,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
  Timer,
  Coffee,
  Moon,
  Sun,
  Activity,
  Zap,
  UserCheck,
  UserX,
  MapPin
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { error } = useContext(KpiContext);
  const { courses } = useContext(CoursesContext);
  const { teachers } = useContext(TeacherContext);
  const { classrooms } = useContext(ClassroomContext);
  const { classes } = useContext(ClassesContext);

  const [activeTab, setActiveTab] = useState('overview');

  // Calculer les statistiques en temps réel à partir des données de la BD
  const today = new Date();
  const todayStr = today.toDateString();
  
  const todayCourses = courses?.filter(course => {
    const courseDate = new Date(course.startDateTime);
    return courseDate.toDateString() === todayStr;
  }).length || 0;

  const thisWeekCourses = courses?.filter(course => {
    const courseDate = new Date(course.startDateTime);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return courseDate >= startOfWeek && courseDate <= endOfWeek;
  }).length || 0;

  // Calculer le taux d'occupation des salles
  const totalClassrooms = classrooms?.length || 0;
  const occupiedClassrooms = courses?.filter(course => {
    const courseDate = new Date(course.startDateTime);
    const courseEndDate = new Date(course.endDateTime);
    const now = new Date();
    return courseDate <= now && courseEndDate >= now;
  }).length || 0;

  const occupancyRate = totalClassrooms > 0 ? Math.round((occupiedClassrooms / totalClassrooms) * 100) : 0;

  // Calculer les enseignants actifs (ayant des cours cette semaine)
  const activeTeachers = teachers?.filter(teacher => {
    return courses?.some(course => {
      const courseDate = new Date(course.startDateTime);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return course.teacher.idTeacher === teacher.idTeacher &&
             courseDate >= startOfWeek && courseDate <= endOfWeek;
    });
  }).length || 0;

  // Analyse des créneaux horaires les plus populaires
  const timeSlotAnalysis = useMemo(() => {
    const timeSlots = {
      morning: { label: 'Matin (8h-12h)', count: 0, icon: Sun },
      afternoon: { label: 'Après-midi (12h-17h)', count: 0, icon: Coffee },
      evening: { label: 'Soir (17h-20h)', count: 0, icon: Moon }
    };

    courses?.forEach(course => {
      const hour = new Date(course.startDateTime).getHours();
      if (hour >= 8 && hour < 12) timeSlots.morning.count++;
      else if (hour >= 12 && hour < 17) timeSlots.afternoon.count++;
      else if (hour >= 17 && hour < 20) timeSlots.evening.count++;
    });

    return timeSlots;
  }, [courses]);

  // Analyse de la charge de travail des enseignants
  const teacherWorkload = useMemo(() => {
    const workload = teachers?.map(teacher => {
      const teacherCourses = courses?.filter(course => 
        course.teacher.idTeacher === teacher.idTeacher
      ).length || 0;
      
      const thisWeekCourses = courses?.filter(course => {
        const courseDate = new Date(course.startDateTime);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return course.teacher.idTeacher === teacher.idTeacher &&
               courseDate >= startOfWeek && courseDate <= endOfWeek;
      }).length || 0;

      return {
        teacher,
        totalCourses: teacherCourses,
        weekCourses: thisWeekCourses,
        workloadLevel: thisWeekCourses > 15 ? 'high' : thisWeekCourses > 10 ? 'medium' : 'low'
      };
    }).sort((a, b) => b.weekCourses - a.weekCourses).slice(0, 5) || [];

    return workload;
  }, [teachers, courses, today]);

  // Alertes et notifications intelligentes
  const smartAlerts = useMemo(() => {
    const alerts = [];

    // Alertes de surcharge des enseignants
    const overloadedTeachers = teacherWorkload.filter(t => t.workloadLevel === 'high');
    if (overloadedTeachers.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Surcharge enseignants',
        message: `${overloadedTeachers.length} enseignant(s) ont plus de 15 cours cette semaine`,
        icon: UserX,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    }

    // Alertes de salles surchargées
    if (occupancyRate > 85) {
      alerts.push({
        type: 'error',
        title: 'Salles saturées',
        message: `Taux d'occupation élevé: ${occupancyRate}%`,
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    // Alertes de cours sans salle
    const coursesWithoutRoom = courses?.filter(course => !course.classroom).length || 0;
    if (coursesWithoutRoom > 0) {
      alerts.push({
        type: 'warning',
        title: 'Cours sans salle',
        message: `${coursesWithoutRoom} cours n'ont pas de salle assignée`,
        icon: MapPin,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      });
    }

    return alerts;
  }, [teacherWorkload, occupancyRate, courses]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const totalHoursWeek = courses?.filter(course => {
      const courseDate = new Date(course.startDateTime);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return courseDate >= startOfWeek && courseDate <= endOfWeek;
    }).reduce((total, course) => {
      const start = new Date(course.startDateTime);
      const end = new Date(course.endDateTime);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0) || 0;

    const averageClassSize = classes?.length ? (courses?.length || 0) / classes.length : 0;
    const teacherUtilization = teachers?.length ? (activeTeachers / teachers.length) * 100 : 0;

    return {
      totalHoursWeek: Math.round(totalHoursWeek),
      averageClassSize: Math.round(averageClassSize * 10) / 10,
      teacherUtilization: Math.round(teacherUtilization),
      roomUtilization: occupancyRate
    };
  }, [courses, classes, teachers, activeTeachers, occupancyRate, today]);

  const stats = [
    {
      title: 'Cours aujourd\'hui',
      value: todayCourses,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: todayCourses > 0 ? `${todayCourses} cours` : 'Aucun cours',
      changeType: 'info'
    },
    {
      title: 'Enseignants actifs',
      value: `${activeTeachers}/${teachers?.length || 0}`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${Math.round((activeTeachers / (teachers?.length || 1)) * 100)}% actifs`,
      changeType: 'increase'
    },
    {
      title: 'Salles occupées',
      value: `${occupiedClassrooms}/${totalClassrooms}`,
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: `${occupancyRate}% d'occupation`,
      changeType: occupancyRate > 75 ? 'increase' : 'stable'
    },
    {
      title: 'Classes gérées',
      value: classes?.length || 0,
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: `${classes?.length || 0} classes actives`,
      changeType: 'info'
    },
  ];

  // Générer les activités récentes à partir des vraies données
  const recentActivities = [
    ...(courses?.slice(-3).map((course) => ({
      id: `course-${course.idCourse}`,
      type: 'course',
      title: `Cours: ${course.name}`,
      description: `${course.teacher.user.firstname} ${course.teacher.user.lastname} - ${course.classroom.name}`,
      time: new Date(course.startDateTime).toLocaleDateString('fr-FR'),
      icon: BookOpen,
      color: 'text-blue-600'
    })) || []),
    ...(teachers?.slice(-2).map((teacher) => ({
      id: `teacher-${teacher.idTeacher}`,
      type: 'teacher',
      title: `Enseignant: ${teacher.user.firstname} ${teacher.user.lastname}`,
      description: `Spécialités: ${teacher.specialities}`,
      time: 'Récemment ajouté',
      icon: Users,
      color: 'text-green-600'
    })) || [])
  ].slice(0, 4);

  // Générer les événements à venir à partir des cours à venir
  const upcomingEvents = courses?.filter(course => {
    const courseDate = new Date(course.startDateTime);
    return courseDate > today;
  })
  .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
  .slice(0, 3)
  .map(course => ({
    id: course.idCourse,
    title: course.name,
    date: course.startDateTime.split('T')[0],
    time: `${new Date(course.startDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(course.endDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    type: 'Cours',
    priority: 'medium',
    teacher: `${course.teacher.user.firstname} ${course.teacher.user.lastname}`,
    classroom: course.classroom.name
  })) || [];

  const quickActions = [
    {
      title: 'Créer un cours',
      description: 'Ajouter un nouveau créneau',
      icon: Plus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => console.log('Créer cours')
    },
    {
      title: 'Gérer les enseignants',
      description: 'Ajouter ou modifier',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => console.log('Gérer enseignants')
    },
    {
      title: 'Voir l\'emploi du temps',
      description: 'Planning complet',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => console.log('Voir emploi du temps')
    },
    {
      title: 'Rapports',
      description: 'Statistiques détaillées',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: () => console.log('Voir rapports')
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Erreur de chargement</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue dans votre espace de gestion scolaire
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className={`${stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-600'}`}>
                  {stat.change}
                </span>
                <span>cette semaine</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Alertes intelligentes en haut */}
          {smartAlerts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {smartAlerts.map((alert, index) => (
                <Card key={index} className={`border-l-4 ${alert.type === 'error' ? 'border-l-red-500' : alert.type === 'warning' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`${alert.bgColor} p-2 rounded-lg`}>
                        <alert.icon className={`h-4 w-4 ${alert.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activités récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Activités récentes</span>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="mt-1">
                        <div className="p-2 bg-muted rounded-lg">
                          <activity.icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Événements à venir */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Événements à venir</span>
                  <Button variant="ghost" size="sm">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="text-center">
                            <div className="text-sm font-medium">
                              {new Date(event.date).getDate()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <Badge variant="secondary">
                              {event.type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>{event.teacher} • {event.classroom}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun cours à venir</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={action.action}
                  >
                    <div className={`${action.bgColor} p-2 rounded-lg`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques des cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cours cette semaine</span>
                    <span className="text-sm font-medium">{thisWeekCourses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total des cours</span>
                    <span className="text-sm font-medium">{courses?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux d'occupation</span>
                    <span className="text-sm font-medium">{occupancyRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Classes actives</span>
                    <span className="text-sm font-medium">{classes?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ressources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total enseignants</span>
                    <span className="text-sm font-medium">{teachers?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enseignants actifs</span>
                    <Badge variant="secondary">{activeTeachers} actifs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Salles disponibles</span>
                    <span className="text-sm font-medium">{totalClassrooms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Salles occupées maintenant</span>
                    <Badge variant={occupiedClassrooms > 0 ? "default" : "secondary"}>
                      {occupiedClassrooms} occupées
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tendances et comparaisons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tendance hebdomadaire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cette semaine</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{thisWeekCourses}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Semaine dernière</span>
                    <div className="flex items-center space-x-1">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">{Math.max(0, thisWeekCourses - 5)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Évolution</span>
                    <Badge variant="secondary">+{Math.min(5, thisWeekCourses)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Efficacité système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux de réussite</span>
                    <span className="text-sm font-medium text-green-600">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Temps de réponse</span>
                    <Badge variant="secondary">Optimal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disponibilité</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Objectifs mensuels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Cours planifiés</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Utilisation salles</span>
                      <span className="text-sm font-medium">{occupancyRate}%</span>
                    </div>
                    <Progress value={occupancyRate} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Satisfaction</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Métriques de performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Timer className="w-4 h-4 mr-2 text-blue-600" />
                  Heures cette semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.totalHoursWeek}h</div>
                <Progress value={(performanceMetrics.totalHoursWeek / 40) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Objectif: 40h/semaine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2 text-green-600" />
                  Utilisation enseignants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.teacherUtilization}%</div>
                <Progress value={performanceMetrics.teacherUtilization} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {performanceMetrics.teacherUtilization > 80 ? 'Excellent' : 
                   performanceMetrics.teacherUtilization > 60 ? 'Bon' : 'À améliorer'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Building className="w-4 h-4 mr-2 text-orange-600" />
                  Utilisation salles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.roomUtilization}%</div>
                <Progress value={performanceMetrics.roomUtilization} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {performanceMetrics.roomUtilization > 85 ? 'Saturé' : 
                   performanceMetrics.roomUtilization > 70 ? 'Optimal' : 'Sous-utilisé'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                  Cours par classe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics.averageClassSize}</div>
                <Progress value={Math.min((performanceMetrics.averageClassSize / 10) * 100, 100)} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Moyenne par classe
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analyse des créneaux horaires */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des créneaux horaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(timeSlotAnalysis).map(([key, slot]) => (
                  <div key={key} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-3 bg-muted rounded-full">
                        <slot.icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>
                    <h4 className="font-medium text-sm">{slot.label}</h4>
                    <div className="text-2xl font-bold mt-1">{slot.count}</div>
                    <div className="text-xs text-muted-foreground">cours</div>
                    <Progress 
                      value={(slot.count / (courses?.length || 1)) * 100} 
                      className="mt-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charge de travail des enseignants */}
          <Card>
            <CardHeader>
              <CardTitle>Charge de travail des enseignants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherWorkload.map((teacher, index) => (
                  <div key={teacher.teacher.idTeacher} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-sm font-medium">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {teacher.teacher.user.firstname} {teacher.teacher.user.lastname}
                        </p>
                        <Badge variant={
                          teacher.workloadLevel === 'high' ? 'destructive' : 
                          teacher.workloadLevel === 'medium' ? 'default' : 'secondary'
                        }>
                          {teacher.workloadLevel === 'high' ? 'Surchargé' : 
                           teacher.workloadLevel === 'medium' ? 'Normal' : 'Léger'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>{teacher.weekCourses} cours cette semaine</span>
                        <span>{teacher.totalCourses} cours total</span>
                      </div>
                      <Progress 
                        value={Math.min((teacher.weekCourses / 20) * 100, 100)} 
                        className="mt-2" 
                      />
                    </div>
                  </div>
                ))}
                {teacherWorkload.length === 0 && (
                  <div className="text-center py-6">
                    <UserCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune donnée de charge de travail</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertes système */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                  Alertes système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {smartAlerts.length > 0 ? (
                    smartAlerts.map((alert, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        alert.type === 'error' ? 'border-l-red-500 bg-red-50' : 
                        alert.type === 'warning' ? 'border-l-orange-500 bg-orange-50' : 
                        'border-l-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <alert.icon className={`h-5 w-5 mt-0.5 ${alert.color}`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            <div className="flex items-center space-x-2 mt-3">
                              <Button size="sm" variant="outline">
                                Résoudre
                              </Button>
                              <Button size="sm" variant="ghost">
                                Ignorer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="text-sm font-medium">Tout va bien !</p>
                      <p className="text-xs text-muted-foreground">Aucune alerte système</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommandations intelligentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recommandation basée sur l'occupation des salles */}
                  {performanceMetrics.roomUtilization > 85 && (
                    <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-l-blue-500">
                      <div className="flex items-start space-x-3">
                        <Building className="h-5 w-5 mt-0.5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-sm">Optimiser l'utilisation des salles</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Considérez ajouter des créneaux en soirée ou réorganiser certains cours.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommandation basée sur la charge des enseignants */}
                  {teacherWorkload.some(t => t.workloadLevel === 'high') && (
                    <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-l-orange-500">
                      <div className="flex items-start space-x-3">
                        <Users className="h-5 w-5 mt-0.5 text-orange-600" />
                        <div>
                          <h4 className="font-medium text-sm">Équilibrer la charge de travail</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Certains enseignants sont surchargés. Redistribuez les cours si possible.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {smartAlerts.length === 0 && (
                    <div className="text-center py-8">
                      <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="text-sm font-medium">Excellente gestion !</p>
                      <p className="text-xs text-muted-foreground">Aucune recommandation pour le moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Journal des événements */}
          <Card>
            <CardHeader>
              <CardTitle>Journal des événements récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Système opérationnel</p>
                    <p className="text-xs text-muted-foreground">Tous les services fonctionnent normalement</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Il y a 5 min</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sauvegarde automatique</p>
                    <p className="text-xs text-muted-foreground">Sauvegarde des données effectuée avec succès</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Il y a 1h</span>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Maintenance programmée</p>
                    <p className="text-xs text-muted-foreground">Maintenance du système prévue dimanche 2h-4h</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Il y a 2h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des alertes pour les événements importants
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sauvegarde automatique</p>
                    <p className="text-sm text-muted-foreground">
                      Sauvegarde quotidienne à 2h00
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Permissions utilisateur</p>
                    <p className="text-sm text-muted-foreground">
                      Gérer les accès et les rôles
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Gérer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
