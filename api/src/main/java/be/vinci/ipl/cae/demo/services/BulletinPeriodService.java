package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.BulletinPeriodDto;
import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import be.vinci.ipl.cae.demo.repositories.BulletinPeriodRepository;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


/**
 * Service handling operations related to bulletin periods.
 */
@Service
@RequiredArgsConstructor
public class BulletinPeriodService {

  private final BulletinPeriodRepository bulletinPeriodRepository;

  /**
   * Helper method to set period properties from DTO.
   */
  private void setPeriodProperties(BulletinPeriod period, BulletinPeriodDto dto) {
    period.setBulletinPeriodName(dto.getName());
    period.setBulletinStartDate(dto.getStartDate());
    period.setBulletinEndDate(dto.getEndDate());
    period.setBulletinAcademicYear(dto.getAcademicYear());
    period.setIsBulletinActive(dto.getIsActive() == null || dto.getIsActive());
    period.setDescription(dto.getDescription());
  }

  /**
   * Get all bulletin periods (active and inactive).
   *
   * @return list of all periods
   */
  public List<BulletinPeriod> getAllPeriods() {
    return bulletinPeriodRepository.findAll();
  }

  /**
   * Get all active bulletin periods.
   *
   * @return list of active periods
   */
  public List<BulletinPeriod> getAllActivePeriods() {
    return bulletinPeriodRepository.findByIsBulletinActiveTrue();
  }

  /**
   * Get periods by academic year.
   *
   * @param academicYear the academic year
   * @return list of periods for the year
   */
  public List<BulletinPeriod> getPeriodsByAcademicYear(String academicYear) {
    return bulletinPeriodRepository.findByBulletinAcademicYearAndIsBulletinActiveTrue(academicYear);
  }

  /**
   * Get the current active period.
   *
   * @return current period if found
   */
  public Optional<BulletinPeriod> getCurrentPeriod() {
    return bulletinPeriodRepository.findCurrentPeriod(new Date());
  }

  /**
   * Create a new bulletin period.
   *
   * @param dto the period data
   * @return the created period
   */
  public BulletinPeriod createPeriod(BulletinPeriodDto dto) {
    BulletinPeriod period = new BulletinPeriod();
    setPeriodProperties(period, dto);
    
    return bulletinPeriodRepository.save(period);
  }

  /**
   * Update a bulletin period.
   *
   * @param id the period ID
   * @param dto the updated period data
   * @return the updated period
   */
  public Optional<BulletinPeriod> updatePeriod(Long id, BulletinPeriodDto dto) {
    Optional<BulletinPeriod> optionalPeriod = bulletinPeriodRepository.findById(id);
    
    if (optionalPeriod.isPresent()) {
      BulletinPeriod period = optionalPeriod.get();
      setPeriodProperties(period, dto);
      
      return Optional.of(bulletinPeriodRepository.save(period));
    }
    
    return Optional.empty();
  }

  /**
   * Delete a bulletin period.
   *
   * @param id the period ID
   */
  public void deletePeriod(Long id) {
    bulletinPeriodRepository.deleteById(id);
  }

  /**
   * Get a period by ID.
   *
   * @param id the period ID
   * @return the period if found
   */
  public Optional<BulletinPeriod> getPeriodById(Long id) {
    return bulletinPeriodRepository.findById(id);
  }
}
