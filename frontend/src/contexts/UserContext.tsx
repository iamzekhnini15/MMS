import { createContext, useState, ReactNode, useEffect } from 'react';
import {
  MaybeAuthenticatedUser,
  UserContextType,
  User,
  AuthenticatedUser,
} from '../types';

import {
  clearAuthenticatedUser,
  getAuthenticatedUser,
  storeAuthenticatedUser,
} from '../utils/session';
import { useNavigate } from 'react-router-dom';

const defaultUserContext: UserContextType = {
  authenticatedUser: undefined,
  registerUser: async () => {},
  loginUser: async () => {},
  clearUser: () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContext);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticatedUserFromStorage = getAuthenticatedUser();

    if (authenticatedUserFromStorage) {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/auths/me', {
            method: 'GET',
            headers: {
              Authorization: `${authenticatedUserFromStorage.token}`,
            },
          });

          if (!response.ok) {
            clearAuthenticatedUser();
            navigate('/login');
          }

          const refreshedUser: AuthenticatedUser = await response.json();

          setAuthenticatedUser(refreshedUser);
        } catch (err) {
          clearAuthenticatedUser();
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const registerUser = async (newUser: User) => {
    console.log(newUser);
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch('/api/auths/register', options);

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );
    } catch (err) {
      console.error('registerUser::error: ', err);
      throw err;
    }
  };

  const loginUser = async (user: User, rememberMe: boolean) => {
    console.log('login');
    console.log('User: ' + user.email);
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch('/api/auths/login', options);

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`,
        );

      const authenticatedUser: AuthenticatedUser = await response.json();
      console.log('authenticatedUser: ', authenticatedUser);

      setAuthenticatedUser(authenticatedUser);
      storeAuthenticatedUser(authenticatedUser, rememberMe);
    } catch (err) {
      console.error('loginUser::error: ', err);
      throw err;
    }
  };

  const clearUser = () => {
    clearAuthenticatedUser();
    setAuthenticatedUser(undefined);
  };

  const myContext: UserContextType = {
    authenticatedUser,
    registerUser,
    loginUser,
    clearUser,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={myContext}>{children}</UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
