package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.FileDto;
import be.vinci.ipl.cae.demo.models.entities.File;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.repositories.FileRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service managing file-related operations.
 */
@Service
@RequiredArgsConstructor
public class FileService {

  private final SubjectRepository subjectRepository;
  private final FileRepository fileRepository;

  @Value("${file.upload.dir:uploads}")
  private String uploadDir;

  /**
   * Retrieves all files.
   *
   * @return A list of all files.
   */
  public List<File> getAllFiles() {
    return fileRepository.findAll();
  }

  /**
   * Adds a new file to a specific subject (from URL).
   *
   * @param subjectId The ID of the subject.
   * @param fileDto   The DTO representing the file to add.
   * @return The saved file as a DTO.
   * @throws IllegalArgumentException If the subject is not found.
   */
  public FileDto addFileToSubject(Long subjectId, FileDto fileDto) {
    Subject subject = subjectRepository.findById(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Subject not found with id " + subjectId));

    File file = new File();
    file.setName(fileDto.getName());
    file.setUrl(fileDto.getUrl());
    file.setSubject(subject);
    file.setVisible(true);

    File savedFile = fileRepository.save(file);

    FileDto savedFileDto = new FileDto();
    savedFileDto.setName(savedFile.getName());
    savedFileDto.setUrl(savedFile.getUrl());

    return savedFileDto;
  }

  /**
   * Uploads a physical file and adds it to a specific subject.
   *
   * @param subjectId The ID of the subject.
   * @param file      The multipart file to upload.
   * @param filename  The custom filename (optional).
   * @return The saved file as a DTO.
   * @throws IllegalArgumentException If the subject is not found.
   * @throws IOException              If file upload fails.
   */
  public FileDto uploadFileToSubject(
      Long subjectId,
      MultipartFile file,
      String filename
  ) throws IOException {

    // Validation du fichier
    if (file.isEmpty()) {
      throw new IllegalArgumentException("File is empty");
    }

    // Validation du type de fichier
    String contentType = file.getContentType();
    if (!isValidFileType(contentType)) {
      throw new IllegalArgumentException("File type not allowed: " + contentType);
    }

    // Génération d'un nom de fichier unique
    String originalFilename = file.getOriginalFilename();
    String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

    // Création du dossier de destination
    Path uploadPath = Paths.get(uploadDir);
    if (!Files.exists(uploadPath)) {
      Files.createDirectories(uploadPath);
    }

    // Sauvegarde du fichier
    Path filePath = uploadPath.resolve(uniqueFilename);
    Files.copy(file.getInputStream(), filePath);

    Subject subject = subjectRepository.findById(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Subject not found with id " + subjectId));

    // Sauvegarde en base de données
    File fileEntity = new File();
    fileEntity.setName(filename != null ? filename : originalFilename);
    fileEntity.setUrl("/uploads/" + uniqueFilename); // URL relative pour accès web
    fileEntity.setSubject(subject);
    fileEntity.setVisible(true);

    File savedFile = fileRepository.save(fileEntity);

    FileDto savedFileDto = new FileDto();
    savedFileDto.setName(savedFile.getName());
    savedFileDto.setUrl(savedFile.getUrl());

    return savedFileDto;
  }

  /**
   * Validates if the file type is allowed.
   *
   * @param contentType The MIME type of the file.
   * @return true if the file type is allowed, false otherwise.
   */
  private boolean isValidFileType(String contentType) {
    return contentType != null && (
      contentType.equals("application/pdf")
        || contentType.equals("application/msword")
        || contentType.equals(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        || contentType.equals("application/vnd.ms-powerpoint")
        || contentType.equals(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation")
        || contentType.equals("application/vnd.ms-excel")
        || contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        || contentType.equals("image/jpeg")
        || contentType.equals("image/png")
        || contentType.equals("image/gif")
        || contentType.equals("text/plain")
      );
  }

  /**
   * Retrieves all files associated with a specific subject.
   *
   * @param subjectId The ID of the subject.
   * @return A list of files related to the subject.
   */
  public List<File> getFileBySubject(Long subjectId) {
    return fileRepository.findBySubjectIdSubject(subjectId);
  }

  /**
   * Toggles the visibility of a file.
   *
   * @param fileId The ID of the file.
   * @return The updated file with toggled visibility.
   * @throws IllegalArgumentException If the file is not found.
   */
  public File toogleVisibility(Long fileId) {
    File file = fileRepository.findById(fileId)
        .orElseThrow(() -> new IllegalArgumentException("File not found with id " + fileId));

    file.setVisible(!file.isVisible());
    return fileRepository.save(file);
  }
}


