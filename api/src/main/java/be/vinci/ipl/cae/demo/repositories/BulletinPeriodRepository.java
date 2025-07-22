package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for BulletinPeriod entities.
 */
@Repository
public interface BulletinPeriodRepository extends JpaRepository<BulletinPeriod, Long> {

  /**
   * Find all active bulletin periods.
   *
   * @return list of active bulletin periods
   */
  List<BulletinPeriod> findByIsActiveTrue();

  /**
   * Find bulletin periods by academic year.
   *
   * @param academicYear the academic year
   * @return list of bulletin periods for the given academic year
   */
  List<BulletinPeriod> findByAcademicYearAndIsActiveTrue(String academicYear);

  /**
   * Find the current active period based on current date.
   *
   * @param currentDate the current date
   * @return the current active period if found
   */
  @Query("SELECT bp FROM BulletinPeriod bp WHERE bp.isActive = true AND bp.startDate <= :currentDate AND bp.endDate >= :currentDate")
  Optional<BulletinPeriod> findCurrentPeriod(@Param("currentDate") java.util.Date currentDate);
}
