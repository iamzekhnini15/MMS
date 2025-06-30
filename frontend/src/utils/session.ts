import { AuthenticatedUser, MaybeAuthenticatedUser } from '../types';

const storeAuthenticatedUser = (
  authenticatedUser: AuthenticatedUser,
  rememberMe: boolean,
) => {
  if (rememberMe) {
    localStorage.setItem(
      'authenticatedUser',
      JSON.stringify(authenticatedUser),
    );
  } else {
    sessionStorage.setItem(
      'authenticatedUser',
      JSON.stringify(authenticatedUser),
    );
  }
};

const getAuthenticatedUser = (): MaybeAuthenticatedUser => {
  const authenticatedUser =
    localStorage.getItem('authenticatedUser') ||
    sessionStorage.getItem('authenticatedUser');

  if (!authenticatedUser) return undefined;

  const parsedUser = JSON.parse(authenticatedUser);

  return parsedUser;
};

const clearAuthenticatedUser = () => {
  localStorage.removeItem('authenticatedUser');
  sessionStorage.removeItem('authenticatedUser');
};

export { storeAuthenticatedUser, getAuthenticatedUser, clearAuthenticatedUser };
