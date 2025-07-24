package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.InvalidInputException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.RegisterRequest;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * AuthController to handle user authentication.
 */
@RestController
@RequestMapping("/auths")
public class AuthController {

  private final UserService userService;

  /**
   * Checks if the credentials are invalid.
   *
   * @param credentials the user credentials to validate.
   * @return true if the credentials are invalid, false otherwise.
   */
  private boolean isInvalidCredentials(Credentials credentials) {
    return credentials == null
      || credentials.getEmail() == null
      || credentials.getEmail().isBlank()
      || credentials.getPassword() == null
      || credentials.getPassword().isBlank();
  }

  /**
   * Constructor for AuthController.
   *
   * @param userService the injected UserService.
   */
  public AuthController(UserService userService) {
    this.userService = userService;
  }

  /**
   * Validates register request credentials.
   *
   * @param registerRequest the register request to validate
   * @return true if credentials are invalid, false otherwise
   */
  private boolean isInvalidRegisterCredentials(RegisterRequest registerRequest) {
    return registerRequest.getEmail() == null || registerRequest.getPassword() == null
      || registerRequest.getPasswordConfirmation() == null
      || !registerRequest.getPasswordConfirmation().equals(registerRequest.getPassword())
      || registerRequest.getLastname() == null || registerRequest.getFirstname() == null
      || registerRequest.getPhone() == null || registerRequest.getAddress() == null
      || registerRequest.getAddress().getStreet() == null
      || registerRequest.getAddress().getNumber() == null
      || registerRequest.getAddress().getPostalCode() == null
      || registerRequest.getAddress().getCommune() == null
      || registerRequest.getAddress().getCountry() == null
      || !isNumeric(registerRequest.getPhone())
      || !isNumeric(registerRequest.getAddress().getPostalCode())
      || !isNumeric(registerRequest.getAddress().getNumber());
  }

  /**
   * Check if a string contains only numeric characters.
   *
   * @param str the string to check
   * @return true if the string is numeric, false otherwise
   */
  private boolean isNumeric(String str) {
    if (str == null || str.isEmpty()) {
      return false;
    }
    return str.matches("[+]?\\d+");
  }


  /**
   * Register a new account.
   *
   * @param registerRequest the account credentials from the request body.
   * @return the authenticated user.
   */
  @PostMapping("/register")
  public AuthenticatedUser register(@RequestBody RegisterRequest registerRequest) {
    System.out.println(registerRequest);
    if (registerRequest == null || isInvalidRegisterCredentials(registerRequest)) {
      throw new InvalidInputException("Register informations are not comlete");
    }

    if (userService.readOneFromEmail(registerRequest.getEmail()) != null) {
      throw new InvalidInputException("L'email est déjà utilisé");
    }

    return userService.register(registerRequest);
  }


  /**
   * Login a user.
   *
   * @param credentials the user credentials from the request body.
   * @return the authenticated user.
   */
  @PostMapping("/login")
  public ResponseEntity<Object> login(@RequestBody Credentials credentials) {

    if (isInvalidCredentials(credentials)) {
      throw new InvalidInputException("Les informations fournies sont invalides");
    }

    AuthenticatedUser user = userService.login(credentials.getEmail(), credentials.getPassword());

    if (user == null) {
      throw new ResourceNotFoundException("Email ou mot de passe incorrect");
    }


    return ResponseEntity.ok(user);
  }

  /**
   * Get the authenticated user based on the provided JWT token.
   *
   * @return the authenticated user.
   * @throws ResponseStatusException if the token is invalid or the user is not found.
   */
  @GetMapping("/me")
  public AuthenticatedUser getAuthenticatedUser() {
    Object userObj = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if ("anonymousUser".equals(userObj)) {
      throw new ResourceNotFoundException("Utilisateur non authentifié");
    }

    User user = (User) userObj;
    AuthenticatedUser authenticatedUser = userService.loadUserByEmail(user.getEmail());
    if (authenticatedUser == null) {
      throw new ResourceNotFoundException("Utilisateur non trouvé");
    }

    return userService.loadUserByEmail(user.getEmail());
  }

}
