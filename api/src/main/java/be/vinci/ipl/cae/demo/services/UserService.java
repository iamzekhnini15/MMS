package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AdressRequest;
import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.RegisterRequest;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User service.
 */
@Service
public class UserService {


  private static final String JWT_SECRET = "ilovemypizza!";
  private static final long LIFETIME_JWT = 24 * 60 * 60 * 1000; // 24 hours
  private static final Algorithm ALGORITHM = Algorithm.HMAC256(JWT_SECRET);

  private final BCryptPasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final AddressRepository addressRepository;

  /**
   * Constructor.
   *
   * @param passwordEncoder the password encoder
   * @param userRepository  the user repository
   */
  public UserService(BCryptPasswordEncoder passwordEncoder, UserRepository userRepository,
      AddressRepository addressRepository) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
    this.addressRepository = addressRepository;
  }

  /**
   * Create a JWT token.
   *
   * @param user the infos to be included in the claim
   * @return the JWT token
   */
  public AuthenticatedUser createJwtToken(User user) {
    String email = user.getEmail();
    String token = JWT.create()
        .withIssuer("auth0")
        .withClaim("email", email)
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis() + LIFETIME_JWT))
        .sign(ALGORITHM);

    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setToken(token);
    authenticatedUser.setUser(user);

    return authenticatedUser;
  }

  /**
   * Verify a JWT token.
   *
   * @param token the token to verify
   * @return the email if the token is valid, null otherwise
   */
  public String verifyJwtToken(String token) {
    try {
      return JWT.require(ALGORITHM).build().verify(token).getClaim("email").asString();
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Login a user.
   *
   * @param email    the email
   * @param password the password
   * @return the authenticated user if the login is successful, null otherwise
   */
  public AuthenticatedUser login(String email, String password) {
    User user = userRepository.findByEmail(email);

    if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
      return null;
    }

    return createJwtToken(user);
  }

  /**
   * Load a user by email and generate a JWT token if the user exists.
   *
   * @param email the email of the user to load
   * @return an authenticated user containing the email and JWT token if the user
   *         exists,
   */
  @Transactional
  public AuthenticatedUser loadUserByEmail(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      return null;
    } else {
      return createJwtToken(user);
    }
  }


  /**
   * Convert an AdressRequest object to an Adresse entity.
   *
   * @param adressRequest the AdressRequest object
   * @return the converted Adresse entity
   */
  public Address convertToAdresse(AdressRequest adressRequest) {
    if (adressRequest == null) {
      return null;
    }

    Address adresse = new Address();
    adresse.setStreet(adressRequest.getStreet());
    adresse.setNumber(adressRequest.getNumber());
    adresse.setBox(adressRequest.getBox());
    adresse.setPostalCode(adressRequest.getPostalCode());
    adresse.setCommune(adressRequest.getCommune());
    adresse.setCountry(adressRequest.getCountry());

    return adresse;
  }

  /**
   * Register a new user.
   *
   * @param registerRequest the register request
   * @return the authenticated user if the registration is successful, null
   *         otherwise
   */
  @Transactional
  public AuthenticatedUser register(RegisterRequest registerRequest) {

    Address adresse = convertToAdresse(registerRequest.getAddress());

    addressRepository.save(adresse);

    User user = new User();
    user.setFirstname(registerRequest.getFirstname());
    user.setLastname(registerRequest.getLastname());
    user.setEmail(registerRequest.getEmail());
    user.setPhone(registerRequest.getPhone());
    user.setCivility(registerRequest.getCivility());
    user.setRole(User.Role.valueOf(registerRequest.getRole()));
    user.setActive(registerRequest.isActive());
    user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
    user.setAddress(adresse);
    user.setRegistrationDate(new Date());


    userRepository.save(user);

    return createJwtToken(user);
  }

  /**
   * Read a user from its email.
   *
   * @param email the email
   * @return the user if it exists, null otherwise
   */
  public User readOneFromEmail(String email) {
    return userRepository.findByEmail(email);
  }

  /**
   * Create a new user.
   *
   * @param email the username
   * @param password the password
   */
  public User createOneUserForTeacher(String email, String password) {
    String hashedPassword = passwordEncoder.encode(password);

    User user = new User();
    user.setEmail(email);
    user.setActive(true);
    user.setPassword(hashedPassword);

    return user;
  }

  /**
   * Create a user with address for teacher.
   *
   * @param existingUser the user data to copy from
   * @param savedAddress the address to associate with the user
   * @return the created user with address
   */
  @Transactional
  public User createUserWithAddress(User existingUser, Address savedAddress) {
    User newUser = createOneUserForTeacher(existingUser.getEmail(), existingUser.getPassword());

    newUser.setAddress(savedAddress);
    newUser.setFirstname(existingUser.getFirstname());
    newUser.setLastname(existingUser.getLastname());
    newUser.setPhone(existingUser.getPhone());
    newUser.setCivility(existingUser.getCivility());
    newUser.setRole(existingUser.getRole());
    newUser.setRegistrationDate(existingUser.getRegistrationDate());

    return userRepository.save(newUser);
  }



}
