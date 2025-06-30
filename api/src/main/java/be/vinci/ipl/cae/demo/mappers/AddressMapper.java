package be.vinci.ipl.cae.demo.mappers;

import be.vinci.ipl.cae.demo.models.dtos.AddressDto;
import be.vinci.ipl.cae.demo.models.entities.Address;

/**
 * Utility class for mapping {@link AddressDto} objects to {@link Address} entities.
 * This class cannot be instantiated.
 */
public final class AddressMapper {

  // Private constructor to prevent instantiation
  private AddressMapper() {}

  /**
   * Maps an {@link AddressDto} to an {@link Address} entity.
   *
   * @param addressDto the {@link AddressDto} to map
   * @return the mapped {@link Address} entity
   */
  public static Address mapToAddress(AddressDto addressDto) {
    Address address = new Address();
    address.setStreet(addressDto.getStreet());
    address.setNumber(addressDto.getNumber());
    address.setBox(addressDto.getBox());
    address.setPostalCode(addressDto.getPostalCode());
    address.setCommune(addressDto.getCommune());
    address.setCountry(addressDto.getCountry());
    return address;
  }
}
