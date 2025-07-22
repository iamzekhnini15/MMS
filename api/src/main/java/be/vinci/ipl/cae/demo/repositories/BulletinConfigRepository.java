package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.BulletinConfig;
import be.vinci.ipl.cae.demo.models.entities.ClassEntity;
import be.vinci.ipl.cae.demo.models.entities.BulletinPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for BulletinConfig entities.
 */
@Repository
public interface BulletinConfigRepository extends JpaRepository<BulletinConfig, Long> {

  /**
   * Find config by class and period.
   *
   * @param classEntity the class
   * @param period the bulletin period
   * @return the config if found
   */
  Optional<BulletinConfig> findByClassEntityAndBulletinPeriod(ClassEntity classEntity, BulletinPeriod period);

  /**
   * Find all configs for a class.
   *
   * @param classEntity the class
   * @return list of configs
   */
  List<BulletinConfig> findByClassEntity(ClassEntity classEntity);

  /**
   * Find published configs for a period.
   *
   * @param period the bulletin period
   * @return list of published configs
   */
  List<BulletinConfig> findByBulletinPeriodAndIsPublishedTrue(BulletinPeriod period);
}
