import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Building, 
  GraduationCap,
  Shield,
  BarChart3,
  FileText,
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';

const HomePage = () => {
  const { authenticatedUser } = useContext(UserContext);
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Gestion des Cours',
      description: 'Organisez vos cours, matières et plannings en toute simplicité',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Users,
      title: 'Enseignants & Étudiants',
      description: 'Gérez les profils, compétences et disponibilités',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Building,
      title: 'Salles de Classe',
      description: 'Optimisez l\'utilisation de vos espaces d\'apprentissage',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: FileText,
      title: 'Documents & Ressources',
      description: 'Centralisez tous vos documents pédagogiques',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Calendar,
      title: 'Planning Intelligent',
      description: 'Emplois du temps automatisés et optimisés',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: BarChart3,
      title: 'Analyses & Statistiques',
      description: 'Tableaux de bord pour un suivi précis',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const stats = [
    { label: 'Cours gérés', value: '500+', icon: BookOpen },
    { label: 'Enseignants actifs', value: '50+', icon: Users },
    { label: 'Salles optimisées', value: '25+', icon: Building },
    { label: 'Étudiants', value: '1000+', icon: GraduationCap }
  ];

  const benefits = [
    'Interface moderne et intuitive',
    'Sécurité des données garantie',
    'Accès en temps réel',
    'Notifications automatiques',
    'Rapports détaillés',
    'Support technique inclus'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Zap className="w-4 h-4 mr-1" />
                Système de Gestion Scolaire Moderne
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Gestion des
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Matières Scolaires
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Une plateforme complète pour gérer efficacement vos cours, enseignants, 
              étudiants et ressources pédagogiques. Simplifiez votre administration scolaire.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {authenticatedUser ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/dashboard')}
                      className="text-lg px-8 py-3"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Accéder au Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                  {authenticatedUser.user.role === 'ADMIN' && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => navigate('/manage-courses')}
                        className="text-lg px-8 py-3"
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        Administration
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/login')}
                      className="text-lg px-8 py-3"
                    >
                      Se connecter
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="text-lg px-8 py-3"
                    >
                      Créer un compte
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              En chiffres
            </h2>
            <p className="text-gray-600">Notre impact sur l'éducation</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </motion.div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités Complètes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce dont vous avez besoin pour gérer votre établissement
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  transition: { duration: 0.2 } 
                }}
              >
                <Card className="hover:shadow-lg transition-shadow border-0 shadow-md h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className={`${feature.bgColor} p-3 rounded-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </motion.div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4">
                <Star className="w-4 h-4 mr-1" />
                Avantages
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Pourquoi choisir notre plateforme ?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Conçue par des professionnels de l'éducation, notre solution répond 
                aux besoins réels des établissements scolaires modernes.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 text-center border-0 shadow-md">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">Sécurisé</h3>
                  <p className="text-sm text-gray-600">Protection des données garantie</p>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 text-center border-0 shadow-md">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">Rapide</h3>
                  <p className="text-sm text-gray-600">Interface ultra-responsive</p>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 text-center border-0 shadow-md">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">Collaboratif</h3>
                  <p className="text-sm text-gray-600">Travail d'équipe facilité</p>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 text-center border-0 shadow-md">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">Analytique</h3>
                  <p className="text-sm text-gray-600">Insights détaillés</p>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Prêt à transformer votre gestion scolaire ?
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Rejoignez les établissements qui font confiance à notre plateforme
          </motion.p>
          
          {!authenticatedUser && (
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/register')}
                  className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Se connecter
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
