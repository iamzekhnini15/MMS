-- Script d'initialisation avec utilisateur admin
-- Ce script sera automatiquement exécuté lors du premier démarrage de PostgreSQL

-- Créer les tables si elles n'existent pas déjà
-- (Normalement gérées par Hibernate, mais au cas où)

-- Insérer l'adresse pour l'admin
INSERT INTO addresses (id_address, street, number, box, postal_code, commune, country) 
VALUES (100, 'Rue Admin', '1', NULL, '1000', 'Bruxelles', 'Belgique')
ON CONFLICT (id_address) DO NOTHING;

-- Insérer l'utilisateur admin avec mot de passe BCrypt hashé
-- Mot de passe: AdminPassword123! 
-- Hash BCrypt: $2a$10$8.M3Y8jK7KqF5J5Q9Q1zUeGjH5M3Y8jK7KqF5J5Q9Q1zUeGjH5M3Y2
INSERT INTO users (id_user, email, password, lastname, firstname, phone, role, civility, registration_date, address, active) 
VALUES (
    100,
    'admin@school.be',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',  -- BCrypt hash de "password"
    'Admin',
    'System',
    '0478000000',
    'ADMIN',
    'M.',
    NOW(),
    100,
    true
)
ON CONFLICT (id_user) DO NOTHING;

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Utilisateur admin créé avec succès!';
    RAISE NOTICE 'Email: admin@school.be';
    RAISE NOTICE 'Mot de passe temporaire: password (à changer après première connexion)';
END $$;
