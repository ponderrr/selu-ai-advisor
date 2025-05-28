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

      // Try to verify token with backend
      const userData = await authService.verifyToken(token);
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: userData },
      });
    } catch (error) {
      console.log(
        "Auth check failed (expected if backend not running):",
        error.message
      );
      // Remove invalid token
      localStorage.removeItem("authToken");
      dispatch({ type: authActions.SET_LOADING, payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const response = await authService.login(email, password);

      // Store token
      localStorage.setItem("authToken", response.token);

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: response.user },
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

      // Auto-login after registration
      localStorage.setItem("authToken", response.token);

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: response.user },
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

  const logout = () => {
    localStorage.removeItem("authToken");
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
