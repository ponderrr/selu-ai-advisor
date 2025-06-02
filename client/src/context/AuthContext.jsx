import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/api/auth";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authActions = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
};

function authReducer(state, action) {
  switch (action.type) {
    case authActions.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
        isLoading: false,
      };

    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: action.payload,
        isLoading: false,
      };

    case authActions.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
        isLoading: false,
      };

    case authActions.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const token = localStorage.getItem("authToken");
      if (!token) {
        dispatch({ type: authActions.SET_LOADING, payload: false });
        return;
      }

      // Verify token and get user data
      const userData = await authService.getCurrentUser();
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: userData },
      });
    } catch (error) {
      console.log("Auth check failed:", error.message);
      // Remove invalid tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      dispatch({ type: authActions.SET_LOADING, payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const response = await authService.login(email, password);

      // Get user info after successful login
      const userData = await authService.getCurrentUser();

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: userData },
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const response = await authService.register(userData);

      // Get user info after successful registration & auto-login
      const userInfo = await authService.getCurrentUser();

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: userInfo },
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: authActions.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
