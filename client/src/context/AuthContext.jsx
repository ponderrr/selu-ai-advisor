import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
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

  const checkAuthStatus = useCallback(async () => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const token = localStorage.getItem("authToken");
      if (!token) {
        dispatch({ type: authActions.SET_LOADING, payload: false });
        return;
      }

      const userData = await authService.getCurrentUser();
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: userData },
      });
    } catch (error) {
      console.log("Auth check failed:", error.message);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      dispatch({ type: authActions.SET_LOADING, payload: false });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const response = await authService.login(email, password);
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
  }, []);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });

      const response = await authService.register(userData);
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
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: authActions.LOGOUT });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: authActions.CLEAR_ERROR });
  }, []);

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