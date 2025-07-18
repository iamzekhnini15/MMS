import React, { useState, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { UserContext } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Link as LinkIcon,
  Shield,
} from 'lucide-react';

interface FileUploadProps {
  subjectId: number;
  onFileAdded: () => void;
  onClose: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  subjectId,
  onFileAdded,
  onClose,
}) => {
  const { authenticatedUser } = useContext(UserContext);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFilename, setCustomFilename] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [urlFilename, setUrlFilename] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Vérifier si l'utilisateur est admin
  const isAdmin = authenticatedUser?.user?.role === 'ADMIN';

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setCustomFilename(file.name);
      setUploadStatus({ type: null, message: '' });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      const rejection = rejectedFiles[0];
      if (rejection.file.size > 10 * 1024 * 1024) {
        setUploadStatus({
          type: 'error',
          message: 'Le fichier est trop volumineux (max 10MB)',
        });
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Type de fichier non autorisé',
        });
      }
    },
  });

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (customFilename && customFilename !== selectedFile.name) {
        formData.append('filename', customFilename);
      }

      const response = await fetch(`/api/subject/${subjectId}/uploadFile`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du fichier');
      }

      setUploadStatus({
        type: 'success',
        message: 'Fichier téléchargé avec succès!',
      });
      onFileAdded();

      // Reset form
      setSelectedFile(null);
      setCustomFilename('');

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Erreur lors du téléchargement du fichier',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!fileUrl || !urlFilename) {
      setUploadStatus({
        type: 'error',
        message: 'Veuillez remplir tous les champs',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const response = await fetch(`/api/subject/${subjectId}/addFile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: urlFilename,
          url: fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du lien");
      }

      setUploadStatus({ type: 'success', message: 'Lien ajouté avec succès!' });
      onFileAdded();

      // Reset form
      setFileUrl('');
      setUrlFilename('');

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: "Erreur lors de l'ajout du lien",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Si l'utilisateur n'est pas admin, afficher un message d'erreur
  if (!isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="w-5 h-5" />
            Accès restreint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">
                Seuls les administrateurs peuvent ajouter des fichiers aux
                matières.
              </p>
            </div>
          </div>
          <Button onClick={onClose} className="mt-4 w-full">
            Fermer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Ajouter un fichier
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={uploadMethod}
          onValueChange={(value) => setUploadMethod(value as 'file' | 'url')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Télécharger un fichier</TabsTrigger>
            <TabsTrigger value="url">Ajouter un lien</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-lg font-medium">
                    Déposez le fichier ici...
                  </p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Glissez-déposez un fichier ici, ou cliquez pour
                      sélectionner
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Types autorisés: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX,
                      JPG, PNG, GIF, TXT
                    </p>
                    <p className="text-sm text-gray-500">
                      Taille maximum: 10MB
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {Math.round(selectedFile.size / 1024)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="space-y-2">
                  <Label htmlFor="filename">Nom du fichier (optionnel)</Label>
                  <Input
                    id="filename"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder="Nom personnalisé pour le fichier"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1"
                >
                  {isUploading ? 'Téléchargement...' : 'Télécharger le fichier'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Annuler
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL du fichier</Label>
                <Input
                  id="url"
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://exemple.com/fichier.pdf"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urlFilename">Nom du fichier</Label>
                <Input
                  id="urlFilename"
                  value={urlFilename}
                  onChange={(e) => setUrlFilename(e.target.value)}
                  placeholder="Nom à afficher pour ce fichier"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUrlSubmit}
                  disabled={!fileUrl || !urlFilename || isUploading}
                  className="flex-1"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {isUploading ? 'Ajout...' : 'Ajouter le lien'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Annuler
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {uploadStatus.message && (
          <div
            className={`mt-4 p-4 rounded border-l-4 ${
              uploadStatus.type === 'success'
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }`}
          >
            <div className="flex items-center">
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <p
                className={
                  uploadStatus.type === 'success'
                    ? 'text-green-800'
                    : 'text-red-800'
                }
              >
                {uploadStatus.message}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
