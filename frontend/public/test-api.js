// Configuration pour les tests de l'API
const API_BASE_URL = 'http://localhost:8080/api';

// Test des endpoints de fichiers
async function testFileEndpoints() {
  console.log('=== Test des endpoints de fichiers ===');
  
  try {
    // Test 1: Récupérer tous les fichiers
    console.log('1. Test GET /file/getAll');
    const response = await fetch(`${API_BASE_URL}/file/getAll`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      const files = await response.json();
      console.log('Fichiers récupérés:', files.length);
    } else {
      console.log('Erreur:', await response.text());
    }
    
    // Test 2: Récupérer les subjects d'un cours
    console.log('2. Test GET /subject/course/1');
    const subjectResponse = await fetch(`${API_BASE_URL}/subject/course/1`);
    console.log('Status:', subjectResponse.status);
    
    if (subjectResponse.ok) {
      const subjects = await subjectResponse.json();
      console.log('Matières récupérées:', subjects.length);
      
      if (subjects.length > 0) {
        const firstSubject = subjects[0];
        console.log('Première matière:', firstSubject.name, 'ID:', firstSubject.idSubject);
      }
    } else {
      console.log('Erreur:', await subjectResponse.text());
    }
    
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
}

// Test de l'upload de fichier (simulé avec un fichier texte)
async function testFileUpload(subjectId) {
  console.log('=== Test Upload de fichier ===');
  
  try {
    // Créer un fichier de test
    const testFile = new File(['Contenu de test'], 'test-document.txt', { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('filename', 'Document de test');
    
    console.log('Envoi du fichier vers subject ID:', subjectId);
    const response = await fetch(`${API_BASE_URL}/subject/${subjectId}/uploadFile`, {
      method: 'POST',
      body: formData
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Fichier uploadé avec succès:', result);
    } else {
      const error = await response.text();
      console.log('Erreur upload:', error);
    }
    
  } catch (error) {
    console.error('Erreur upload:', error);
  }
}

// Exécuter les tests
testFileEndpoints();

// Décommentez cette ligne pour tester l'upload (remplacez 1 par un ID de matière valide)
// testFileUpload(1);
