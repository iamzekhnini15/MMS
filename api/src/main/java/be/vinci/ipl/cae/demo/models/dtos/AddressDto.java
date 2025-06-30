package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing an address.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {

  private String street;
  private String number;
  private String box;
  private String postalCode;
  private String commune;
  private String country;

}
