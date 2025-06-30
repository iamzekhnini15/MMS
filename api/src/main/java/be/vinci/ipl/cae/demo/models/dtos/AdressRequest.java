package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) for address information in the system. This class is used to represent
 * the data needed to create or update an address.
 */
@Data
@NoArgsConstructor
public class AdressRequest {

  private String street;
  private String number;
  private String box;
  private String postalCode;
  private String commune;
  private String country;

}