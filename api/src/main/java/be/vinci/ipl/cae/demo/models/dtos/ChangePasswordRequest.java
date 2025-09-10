package be.vinci.ipl.cae.demo.models.dtos;

/**
 * DTO for change password requests.
 */
public class ChangePasswordRequest {
  private String oldPassword;
  private String newPassword;
  private String newPasswordConfirmation;

  public String getOldPassword() {
    return oldPassword;
  }

  public void setOldPassword(String oldPassword) {
    this.oldPassword = oldPassword;
  }

  public String getNewPassword() {
    return newPassword;
  }

  public void setNewPassword(String newPassword) {
    this.newPassword = newPassword;
  }

  public String getNewPasswordConfirmation() {
    return newPasswordConfirmation;
  }

  public void setNewPasswordConfirmation(String newPasswordConfirmation) {
    this.newPasswordConfirmation = newPasswordConfirmation;
  }
}
