package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.services.DashboardService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

  private final DashboardService dashboardService;

  @GetMapping("/kpis")
  public ResponseEntity<Map<String, Long>> getKpis() {
    return ResponseEntity.ok(dashboardService.getKpis());
  }
}
