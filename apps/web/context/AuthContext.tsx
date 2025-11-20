"use client";

import { API } from "@/api";
import APIService from "@/api/apiService";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { resetLogout } from "@/store/apps/common";
import {
  setUser,
  setToken,
  setInitialized,
  setLoading,
  logout as reduxLogout,
} from "../store/apps/auth";
import { AuthValuesType, ErrCallbackType, LoginParams } from "./types";
import { getItem, removeItem, setItem } from "@/utility/localStorageControl";
import localStorageConfig from "@/configs/localStorage";
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  isInitialized: false,
  setIsInitialized: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
};

const AuthContext = createContext(defaultProvider);

type Props = {
  children: ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const isInitialized = useSelector(
    (state: RootState) => state.auth.isInitialized,
  );

  const isLogout = useSelector((state: RootState) => state.common.isLogout);
  const isOffline = useSelector((state: RootState) => state.common.isOffline);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch(setLoading(true));

        // Check for existing token in localStorage
        const storedToken = getItem(
          localStorageConfig.auth.storageTokenKeyName,
        );

        if (storedToken) {
          try {
            const response = await APIService.get(API.auth.me);
          } catch (error) {
            removeItem(localStorageConfig.auth.storageTokenKeyName);
            dispatch(reduxLogout());
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        dispatch(setLoading(false));
        dispatch(setInitialized(true));
      }
    };

    initAuth();
  }, [dispatch]);

  useEffect(() => {
    if (isLogout) {
      dispatch(resetLogout());
      handleLogout();
    }
  }, [isLogout, dispatch]);

  useEffect(() => {
    if (isOffline) {
      router.push("/offline");
    }
  }, [isOffline, router]);

  const handleLogout = () => {
    if (token) {
      APIService.post(API.auth.logout)
        .then(() => {
          removeItem(localStorageConfig.auth.storageTokenKeyName);
        })
        .catch((error) => {
          console.error("Logout API call failed:", error);
        });
    }
    dispatch(reduxLogout());
    router.push("/login");
  };

  const handleLogin = (
    params: LoginParams,
    errorCallback?: ErrCallbackType,
  ) => {
    dispatch(setLoading(true));
    return APIService.post(API.auth.login, params)
      .then((res) => {
        setItem(
          localStorageConfig.auth.storageTokenKeyName,
          res.data.data.tokenResponse.access_token,
        );
        dispatch(setToken(res.data.data.tokenResponse.access_token));
        dispatch(setUser(res.data.data.user));
        dispatch(setInitialized(true));
        dispatch(setLoading(false));
        return res.data.data.user;
      })
      .catch((err) => {
        dispatch(setLoading(false));
        if (errorCallback) errorCallback(err);
        throw err;
      });
  };

  const handleRegister = () => {};

  const setUserWrapper = (user: any) => dispatch(setUser(user));
  const setLoadingWrapper = (loading: boolean) => dispatch(setLoading(loading));
  const setIsInitializedWrapper = (initialized: boolean) =>
    dispatch(setInitialized(initialized));

  const values = {
    user,
    loading,
    setUser: setUserWrapper,
    setLoading: setLoadingWrapper,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    isInitialized,
    setIsInitialized: setIsInitializedWrapper,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
