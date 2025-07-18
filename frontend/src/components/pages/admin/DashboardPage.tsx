import React, { useContext, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue dans votre espace de gestion scolaire
          </p>
        </motion.div>
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ 
              scale: 1.01, 
              transition: { duration: 0.2 } 
            }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <motion.div 
                  className={`${stat.bgColor} p-2 rounded-lg`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className={`${stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-600'}`}>
                    {stat.change}
                  </span>
                  <span>cette semaine</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Onglets principaux */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
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
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {smartAlerts.map((alert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.005 }}
                >
                  <Card className={`border-l-4 ${alert.type === 'error' ? 'border-l-red-500' : alert.type === 'warning' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <motion.div 
                          className={`${alert.bgColor} p-2 rounded-lg`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <alert.icon className={`h-4 w-4 ${alert.color}`} />
                        </motion.div>
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activités récentes */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Activités récentes</span>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div 
                        key={activity.id} 
                        className="flex items-start space-x-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ x: 2 }}
                      >
                        <div className="mt-1">
                          <motion.div 
                            className="p-2 bg-muted rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <activity.icon className={`h-4 w-4 ${activity.color}`} />
                          </motion.div>
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
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Événements à venir */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Événements à venir</span>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button variant="ghost" size="sm">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event, index) => (
                        <motion.div 
                          key={event.id} 
                          className="flex items-center space-x-3"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ x: -2 }}
                        >
                          <div className="flex-shrink-0">
                            <motion.div 
                              className="text-center"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="text-sm font-medium">
                                {new Date(event.date).getDate()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                              </div>
                            </motion.div>
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
                      </motion.div>
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
            </motion.div>
          </div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ 
                        scale: 1.02, 
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={action.action}
                  >
                    <motion.div 
                      className={`${action.bgColor} p-2 rounded-lg`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.005 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques des cours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <span className="text-sm">Cours cette semaine</span>
                      <motion.span 
                        className="text-sm font-medium"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        {thisWeekCourses}
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <span className="text-sm">Total des cours</span>
                      <motion.span 
                        className="text-sm font-medium"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        {courses?.length || 0}
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <span className="text-sm">Taux d'occupation</span>
                      <motion.span 
                        className="text-sm font-medium"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        {occupancyRate}%
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <span className="text-sm">Classes actives</span>
                      <motion.span 
                        className="text-sm font-medium"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      >
                        {classes?.length || 0}
                      </motion.span>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Ressources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <span className="text-sm">Total enseignants</span>
                      <motion.span 
                        className="text-sm font-medium"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        {teachers?.length || 0}
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <span className="text-sm">Enseignants actifs</span>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      >
                        <Badge variant="secondary">{activeTeachers} actifs</Badge>
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <span className="text-sm">Salles disponibles</span>
                      <motion.span 
                        className="text-sm font-medium"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                      >
                        {totalClassrooms}
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <span className="text-sm">Salles occupées maintenant</span>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                      >
                        <Badge variant={occupiedClassrooms > 0 ? "default" : "secondary"}>
                          {occupiedClassrooms} occupées
                        </Badge>
                      </motion.div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Tendances et comparaisons */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tendance hebdomadaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <span className="text-sm">Cette semaine</span>
                      <motion.div 
                        className="flex items-center space-x-1"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                      >
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">{thisWeekCourses}</span>
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <span className="text-sm">Semaine dernière</span>
                      <motion.div 
                        className="flex items-center space-x-1"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                      >
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium">{Math.max(0, thisWeekCourses - 5)}</span>
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                    >
                      <span className="text-sm text-green-600">Évolution</span>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                      >
                        <Badge variant="secondary">+{Math.min(5, thisWeekCourses)}%</Badge>
                      </motion.div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.03, y: -2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Efficacité système</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <span className="text-sm">Taux de réussite</span>
                      <motion.span 
                        className="text-sm font-medium text-green-600"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                      >
                        98.5%
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                    >
                      <span className="text-sm">Temps de réponse</span>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                      >
                        <Badge variant="secondary">Optimal</Badge>
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      <span className="text-sm">Disponibilité</span>
                      <motion.span 
                        className="text-sm font-medium"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.3 }}
                      >
                        99.9%
                      </motion.span>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.03, y: -2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Objectifs mensuels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Cours planifiés</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                        style={{ transformOrigin: 'left' }}
                      >
                        <Progress value={85} />
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Utilisation salles</span>
                        <span className="text-sm font-medium">{occupancyRate}%</span>
                      </div>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 1.3 }}
                        style={{ transformOrigin: 'left' }}
                      >
                        <Progress value={occupancyRate} />
                      </motion.div>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Satisfaction</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 1.4 }}
                        style={{ transformOrigin: 'left' }}
                      >
                        <Progress value={92} />
                      </motion.div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Métriques de performance */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Timer className="w-4 h-4 mr-2 text-blue-600" />
                    </motion.div>
                    Heures cette semaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="text-2xl font-bold"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {performanceMetrics.totalHoursWeek}h
                  </motion.div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    style={{ transformOrigin: 'left' }}
                  >
                    <Progress value={(performanceMetrics.totalHoursWeek / 40) * 100} className="mt-2" />
                  </motion.div>
                  <motion.p 
                    className="text-xs text-muted-foreground mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    Objectif: 40h/semaine
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.03, y: -3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Target className="w-4 h-4 mr-2 text-green-600" />
                    </motion.div>
                    Utilisation enseignants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="text-2xl font-bold"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {performanceMetrics.teacherUtilization}%
                  </motion.div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    style={{ transformOrigin: 'left' }}
                  >
                    <Progress value={performanceMetrics.teacherUtilization} className="mt-2" />
                  </motion.div>
                  <motion.p 
                    className="text-xs text-muted-foreground mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    {performanceMetrics.teacherUtilization > 80 ? 'Excellent' : 
                     performanceMetrics.teacherUtilization > 60 ? 'Bon' : 'À améliorer'}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.03, y: -3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Building className="w-4 h-4 mr-2 text-orange-600" />
                    </motion.div>
                    Utilisation salles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="text-2xl font-bold"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {performanceMetrics.roomUtilization}%
                  </motion.div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    style={{ transformOrigin: 'left' }}
                  >
                    <Progress value={performanceMetrics.roomUtilization} className="mt-2" />
                  </motion.div>
                  <motion.p 
                    className="text-xs text-muted-foreground mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    {performanceMetrics.roomUtilization > 85 ? 'Saturé' : 
                     performanceMetrics.roomUtilization > 70 ? 'Optimal' : 'Sous-utilisé'}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.03, y: -3 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                    </motion.div>
                    Cours par classe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="text-2xl font-bold"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    {performanceMetrics.averageClassSize}
                  </motion.div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    style={{ transformOrigin: 'left' }}
                  >
                    <Progress value={Math.min((performanceMetrics.averageClassSize / 10) * 100, 100)} className="mt-2" />
                  </motion.div>
                  <motion.p 
                    className="text-xs text-muted-foreground mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    Moyenne par classe
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Analyse des créneaux horaires */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            whileHover={{ scale: 1.005 }}
          >
            <Card>
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <CardTitle>Répartition des créneaux horaires</CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(timeSlotAnalysis).map(([key, slot], index) => (
                    <motion.div 
                      key={key} 
                      className="text-center"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <motion.div 
                        className="flex items-center justify-center mb-2"
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-3 bg-muted rounded-full">
                          <slot.icon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      </motion.div>
                      <motion.h4 
                        className="font-medium text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                      >
                        {slot.label}
                      </motion.h4>
                      <motion.div 
                        className="text-2xl font-bold mt-1"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                      >
                        {slot.count}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                      >
                        cours
                      </motion.div>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 1.5 + index * 0.1 }}
                        style={{ transformOrigin: 'left' }}
                      >
                        <Progress 
                          value={(slot.count / (courses?.length || 1)) * 100} 
                          className="mt-2" 
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charge de travail des enseignants */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card>
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  <CardTitle>Charge de travail des enseignants</CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacherWorkload.map((teacher, index) => (
                    <motion.div 
                      key={teacher.teacher.idTeacher} 
                      className="flex items-center space-x-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                      whileHover={{ x: 2, transition: { duration: 0.2 } }}
                    >
                      <motion.div 
                        className="flex-shrink-0 w-8 text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                      >
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.div 
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                        >
                          <p className="text-sm font-medium">
                            {teacher.teacher.user.firstname} {teacher.teacher.user.lastname}
                          </p>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <Badge variant={
                              teacher.workloadLevel === 'high' ? 'destructive' : 
                              teacher.workloadLevel === 'medium' ? 'default' : 'secondary'
                            }>
                              {teacher.workloadLevel === 'high' ? 'Surchargé' : 
                               teacher.workloadLevel === 'medium' ? 'Normal' : 'Léger'}
                            </Badge>
                          </motion.div>
                        </motion.div>
                        <motion.div 
                          className="flex items-center justify-between text-xs text-muted-foreground mt-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                        >
                          <span>{teacher.weekCourses} cours cette semaine</span>
                          <span>{teacher.totalCourses} cours total</span>
                        </motion.div>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 1.6 + index * 0.1 }}
                          style={{ transformOrigin: 'left' }}
                        >
                          <Progress 
                            value={Math.min((teacher.weekCourses / 20) * 100, 100)} 
                            className="mt-2" 
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                  {teacherWorkload.length === 0 && (
                    <motion.div 
                      className="text-center py-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                      >
                        <UserCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      </motion.div>
                      <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.6 }}
                      >
                        Aucune donnée de charge de travail
                      </motion.p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Alertes système */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.005 }}
            >
              <Card>
                <CardHeader>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <CardTitle className="flex items-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                      </motion.div>
                      Alertes système
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {smartAlerts.length > 0 ? (
                      smartAlerts.map((alert, index) => (
                        <motion.div 
                          key={index} 
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.type === 'error' ? 'border-l-red-500 bg-red-50' : 
                            alert.type === 'warning' ? 'border-l-orange-500 bg-orange-50' : 
                            'border-l-blue-500 bg-blue-50'
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                          whileHover={{ x: 2, scale: 1.005 }}
                        >
                          <div className="flex items-start space-x-3">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <alert.icon className={`h-5 w-5 mt-0.5 ${alert.color}`} />
                            </motion.div>
                            <div className="flex-1">
                              <motion.h4 
                                className="font-medium text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                              >
                                {alert.title}
                              </motion.h4>
                              <motion.p 
                                className="text-sm text-muted-foreground mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                              >
                                {alert.message}
                              </motion.p>
                              <motion.div 
                                className="flex items-center space-x-2 mt-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button size="sm" variant="outline">
                                    Résoudre
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button size="sm" variant="ghost">
                                    Ignorer
                                  </Button>
                                </motion.div>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div 
                        className="text-center py-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                          whileHover={{ scale: 1.1, rotate: 360 }}
                        >
                          <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        </motion.div>
                        <motion.p 
                          className="text-sm font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          Tout va bien !
                        </motion.p>
                        <motion.p 
                          className="text-xs text-muted-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 1.0 }}
                        >
                          Aucune alerte système
                        </motion.p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
                    <motion.div 
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                      >
                        <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      </motion.div>
                      <motion.p 
                        className="text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                      >
                        Excellente gestion !
                      </motion.p>
                      <motion.p 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                      >
                        Aucune recommandation pour le moment
                      </motion.p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommandations intelligentes */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card>
                <CardHeader>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <CardTitle className="flex items-center">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Zap className="w-5 h-5 mr-2 text-blue-600" />
                      </motion.div>
                      Recommandations
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Recommandation basée sur l'occupation des salles */}
                    {performanceMetrics.roomUtilization > 85 && (
                      <motion.div 
                        className="p-4 rounded-lg bg-blue-50 border-l-4 border-l-blue-500"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        whileHover={{ x: -5, scale: 1.02 }}
                      >
                        <div className="flex items-start space-x-3">
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Building className="h-5 w-5 mt-0.5 text-blue-600" />
                          </motion.div>
                          <div>
                            <motion.h4 
                              className="font-medium text-sm"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.7 }}
                            >
                              Optimiser l'utilisation des salles
                            </motion.h4>
                            <motion.p 
                              className="text-sm text-muted-foreground mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.8 }}
                            >
                              Considérez ajouter des créneaux en soirée ou réorganiser certains cours.
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Recommandation basée sur la charge des enseignants */}
                    {teacherWorkload.some(t => t.workloadLevel === 'high') && (
                      <motion.div 
                        className="p-4 rounded-lg bg-orange-50 border-l-4 border-l-orange-500"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        whileHover={{ x: -5, scale: 1.02 }}
                      >
                        <div className="flex items-start space-x-3">
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: -15 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Users className="h-5 w-5 mt-0.5 text-orange-600" />
                          </motion.div>
                          <div>
                            <motion.h4 
                              className="font-medium text-sm"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.8 }}
                            >
                              Équilibrer la charge de travail
                            </motion.h4>
                            <motion.p 
                              className="text-sm text-muted-foreground mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.9 }}
                            >
                              Certains enseignants sont surchargés. Redistribuez les cours si possible.
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Journal des événements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card>
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <CardTitle>Journal des événements récents</CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <motion.div 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-green-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.p 
                        className="text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                      >
                        Système opérationnel
                      </motion.p>
                      <motion.p 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                      >
                        Tous les services fonctionnent normalement
                      </motion.p>
                    </div>
                    <motion.span 
                      className="text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      Il y a 5 min
                    </motion.span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Activity className="h-5 w-5 text-blue-600" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.p 
                        className="text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                      >
                        Sauvegarde automatique
                      </motion.p>
                      <motion.p 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                      >
                        Sauvegarde des données effectuée avec succès
                      </motion.p>
                    </div>
                    <motion.span 
                      className="text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      Il y a 1h
                    </motion.span>
                  </motion.div>

                  <motion.div 
                    className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -15 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.p 
                        className="text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.1 }}
                      >
                        Maintenance programmée
                      </motion.p>
                      <motion.p 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                      >
                        Maintenance du système prévue dimanche 2h-4h
                      </motion.p>
                    </div>
                    <motion.span 
                      className="text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                    >
                      Il y a 2h
                    </motion.span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card>
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <CardTitle>Paramètres système</CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <motion.p 
                        className="font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        Notifications
                      </motion.p>
                      <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        Recevoir des alertes pour les événements importants
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <motion.p 
                        className="font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        Sauvegarde automatique
                      </motion.p>
                      <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        Sauvegarde quotidienne à 2h00
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <motion.p 
                        className="font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        Permissions utilisateur
                      </motion.p>
                      <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        Gérer les accès et les rôles
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" size="sm">
                        Gérer
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
      </motion.div>
    </div>
  );
};

export default Dashboard;
