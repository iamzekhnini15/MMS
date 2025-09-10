package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.FileDto;
import be.vinci.ipl.cae.demo.models.entities.File;
import be.vinci.ipl.cae.demo.models.entities.Subject;
import be.vinci.ipl.cae.demo.repositories.FileRepository;
import be.vinci.ipl.cae.demo.repositories.SubjectRepository;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Service managing file-related operations.
 */
@Service
@RequiredArgsConstructor
public class FileService {

  private final SubjectRepository subjectRepository;
  private final FileRepository fileRepository;

  // SSE emitters to notify clients of file changes
  private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

  @Value("${azure.blob.service-endpoint}")
  private String blobServiceEndpoint;

  @Value("${azure.blob.sas-token}")
  private String sasToken;

  @Value("${azure.blob.container-name}")
  private String containerName;

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

    if (file.isEmpty()) {
      throw new IllegalArgumentException("File is empty");
    }

    String contentType = file.getContentType();
    if (!isValidFileType(contentType)) {
      throw new IllegalArgumentException("File type not allowed: " + contentType);
    }

    String blobUrl = uploadFileToBlob(file);

    Subject subject = subjectRepository.findById(subjectId)
        .orElseThrow(() -> new IllegalArgumentException("Subject not found with id " + subjectId));

    File fileEntity = new File();
    fileEntity.setName(filename != null ? filename : file.getOriginalFilename());
    fileEntity.setUrl(blobUrl);
    fileEntity.setSubject(subject);
    fileEntity.setVisible(true);

    File savedFile = fileRepository.save(fileEntity);

    FileDto savedFileDto = new FileDto();
    savedFileDto.setName(savedFile.getName());
    savedFileDto.setUrl(savedFile.getUrl());

    return savedFileDto;
  }

  /**
   * Register an SseEmitter to receive file events.
   *
   * @return The registered SseEmitter.
   */
  public SseEmitter registerEmitter() {
    SseEmitter emitter = new SseEmitter(0L); // no timeout
    emitters.add(emitter);
    emitter.onCompletion(() -> emitters.remove(emitter));
    emitter.onTimeout(() -> emitters.remove(emitter));
    return emitter;
  }

  private String uploadFileToBlob(MultipartFile file) {
    String fileUuid = UUID.randomUUID().toString();
    Map<String, String> metadata = new HashMap<>();
    metadata.put("originalFileName", file.getOriginalFilename());

    BlobClientBuilder blobClientBuilder = new BlobClientBuilder()
        .endpoint(blobServiceEndpoint)
        .sasToken(sasToken)
        .containerName(containerName)
        .blobName(fileUuid);

    var blobClient = blobClientBuilder.buildClient();

    try {
      blobClient.upload(file.getInputStream(), file.getSize(), true);
      blobClient.setMetadata(metadata);
      blobClient.setHttpHeaders(new BlobHttpHeaders().setContentType(file.getContentType()));
    } catch (IOException e) {
      throw new RuntimeException("Failed to upload to Azure Blob Storage", e);
    }

    return blobClient.getBlobUrl();
  }

  /**
   * Validates if the file type is allowed.
   *
   * @param contentType The MIME type of the file.
   * @return true if the file type is allowed, false otherwise.
   */
  private boolean isValidFileType(String contentType) {
    return contentType != null && (
      "application/pdf".equals(contentType)
        || "application/msword".equals(contentType)
        || "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        .equals(contentType)
        || "application/vnd.ms-powerpoint".equals(contentType)
        || "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        .equals(contentType)
        || "application/vnd.ms-excel".equals(contentType)
        || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        .equals(contentType)
        || "image/jpeg".equals(contentType)
        || "image/png".equals(contentType)
        || "image/gif".equals(contentType)
        || "text/plain".equals(contentType)
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
  public File toggleVisibility(Long fileId) {
    File file = fileRepository.findById(fileId)
        .orElseThrow(() -> new IllegalArgumentException("File not found with id " + fileId));

    file.setVisible(!file.isVisible());
    File saved = fileRepository.save(file);
    // notify SSE subscribers
    notifyFileUpdated(saved);
    return saved;
  }

  private void notifyFileUpdated(File file) {
    for (SseEmitter emitter : emitters) {
      try {
        SseEmitter.SseEventBuilder event = SseEmitter.event()
            .name("file-updated")
            .data(file);
        emitter.send(event);
      } catch (IOException e) {
        emitters.remove(emitter);
      }
    }
  }

  private void notifyFileDeleted(Long fileId) {
    for (SseEmitter emitter : emitters) {
      try {
        SseEmitter.SseEventBuilder event = SseEmitter.event()
            .name("file-deleted")
            .data(fileId);
        emitter.send(event);
      } catch (IOException e) {
        emitters.remove(emitter);
      }
    }
  }

  /**
   * Deletes a file from both Azure Blob Storage and database.
   *
   * @param fileId The ID of the file to delete.
   * @throws IllegalArgumentException If the file is not found.
   * @throws RuntimeException If blob deletion fails.
   */
  public void deleteFile(Long fileId) {
    File file = fileRepository.findById(fileId)
        .orElseThrow(() -> new IllegalArgumentException("File not found with id " + fileId));
    // Attempt to delete blob from Azure first. If this fails, do not delete DB record.
    String url = file.getUrl();
    try {
      URI uri = new URI(url);
      String path = uri.getPath(); // e.g. /container/blobName
      String blobName;
      int idx = path.indexOf(containerName);
      if (idx >= 0) {
        blobName = path.substring(idx + containerName.length());
        if (blobName.startsWith("/")) {
          blobName = blobName.substring(1);
        }
      } else {
        String[] parts = path.split("/");
        blobName = parts[parts.length - 1];
      }
      if (blobName.contains("?")) {
        blobName = blobName.split("\\?")[0];
      }

      BlobClientBuilder blobClientBuilder = new BlobClientBuilder()
          .endpoint(blobServiceEndpoint)
          .sasToken(sasToken)
          .containerName(containerName)
          .blobName(blobName);
      var blobClient = blobClientBuilder.buildClient();
      // delete the blob - if this throws, we stop and do not delete DB record
      blobClient.delete();
    } catch (Exception e) {
      // important: fail fast so we don't leave orphan DB entries if blob remains
      throw new RuntimeException("Failed to delete blob for file id " + fileId + ": "
        + e.getMessage(), e);
    }

    // Blob deleted successfully -> remove DB record and notify subscribers
    fileRepository.delete(file);
    notifyFileDeleted(fileId);
  }
}