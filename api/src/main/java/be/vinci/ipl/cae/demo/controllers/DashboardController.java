package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.services.DashboardService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur REST pour la gestion des indicateurs de performance (KPIs) du tableau de bord.
 * Fournit un endpoint pour récupérer les KPIs globaux.
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

  private final DashboardService dashboardService;

  /**
   * Récupère les KPIs globaux.
   *
   * @return une réponse HTTP contenant une map des KPIs.
   */
  @GetMapping("/kpis")
  public ResponseEntity<Map<String, Long>> getKpis() {
    return ResponseEntity.ok(dashboardService.getKpis());
  }
}

