package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.FileDTO;
import be.vinci.ipl.cae.demo.models.entities.File;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.repositories.FileRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FileService {

  private final SubjectRepository subjectRepository;
  private final FileRepository fileRepository;

  public List<File> getAllFiles() {
    return fileRepository.findAll();
  }

  public FileDTO addFileToSubject(Long subjectId, FileDTO fileDTO) {
    Subject subject = subjectRepository.findById(subjectId)
      .orElseThrow(() -> new IllegalArgumentException("Subject not found with id " + subjectId));

    File file = new File();
    file.setName(fileDTO.getName());
    file.setUrl(fileDTO.getUrl());
    file.setSubject(subject);
    file.setVisible(true);

    File savedFile = fileRepository.save(file);

    // Convertir l'entité sauvegardée en DTO
    FileDTO savedFileDTO = new FileDTO();
    savedFileDTO.setName(savedFile.getName());
    savedFileDTO.setUrl(savedFile.getUrl());

    return savedFileDTO;
  }

  public List<File> getFileBySubject(Long subjectId) {
    return fileRepository.findBySubjectIdSubject(subjectId);
  }

  public File toogleVisibility(Long fileId) {
    File file = fileRepository.findById(fileId)
      .orElseThrow(() -> new IllegalArgumentException("File not found with id " + fileId));

    file.setVisible(!file.isVisible());
    return fileRepository.save(file); // On retourne le fichier mis à jour
  }

}

