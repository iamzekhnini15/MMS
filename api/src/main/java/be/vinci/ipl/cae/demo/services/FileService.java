package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.FileDto;
import be.vinci.ipl.cae.demo.models.entities.File;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.repositories.FileRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service managing file-related operations.
 */
@Service
@RequiredArgsConstructor
public class FileService {

  private final SubjectRepository subjectRepository;
  private final FileRepository fileRepository;

  /**
   * Retrieves all files.
   *
   * @return A list of all files.
   */
  public List<File> getAllFiles() {
    return fileRepository.findAll();
  }

  /**
   * Adds a new file to a specific subject.
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


