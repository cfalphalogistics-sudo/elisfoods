"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  UserAddress,
  UserFavourite,
  sendOtp,
  verifyOtp,
  fetchUserProfile,
  updateProfile as apiUpdateProfile,
  logoutUser,
  saveUserAddress,
  deleteUserAddress,
  toggleFavourite as apiToggleFavourite,
} from "@/lib/services/authService";

const AUTH_TOKEN_KEY = "elis_auth_token";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  addresses: UserAddress[];
  favourites: UserFavourite[];
  requestOtp: (phone: string) => Promise<void>;
  confirmOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileInfo: (name: string, email?: string) => Promise<void>;
  addAddress: (payload: Omit<UserAddress, "id" | "user_id">) => Promise<void>;
  editAddress: (id: number, payload: Omit<UserAddress, "id" | "user_id">) => Promise<void>;
  removeAddress: (id: number) => Promise<void>;
  toggleFav: (productId: string | number) => Promise<boolean>;
  isFav: (productId: string | number) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [favourites, setFavourites] = useState<UserFavourite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (authToken: string) => {
    try {
      const userProfile = await fetchUserProfile(authToken);
      setUser(userProfile);
      setAddresses(userProfile.addresses || []);
      setFavourites(userProfile.favourites || []);
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        loadUser(storedToken);
      } else {
        setIsLoading(false);
      }
    }
  }, [loadUser]);

  const requestOtp = useCallback(async (phone: string) => {
    await sendOtp(phone);
  }, []);

  const confirmOtp = useCallback(async (phone: string, otp: string) => {
    const data = await verifyOtp(phone, otp);
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setAddresses(data.user.addresses || []);
    setFavourites(data.user.favourites || []);
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await logoutUser(token);
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAddresses([]);
    setFavourites([]);
  }, [token]);

  const updateProfileInfo = useCallback(
    async (name: string, email?: string) => {
      if (!token) return;
      const updatedUser = await apiUpdateProfile(token, { name, email });
      setUser(updatedUser);
    },
    [token]
  );

  const addAddress = useCallback(
    async (payload: Omit<UserAddress, "id" | "user_id">) => {
      if (!token) return;
      const updatedAddresses = await saveUserAddress(token, payload);
      setAddresses(updatedAddresses);
    },
    [token]
  );

  const editAddress = useCallback(
    async (id: number, payload: Omit<UserAddress, "id" | "user_id">) => {
      if (!token) return;
      const updatedAddresses = await saveUserAddress(token, payload, id);
      setAddresses(updatedAddresses);
    },
    [token]
  );

  const removeAddress = useCallback(
    async (id: number) => {
      if (!token) return;
      const updatedAddresses = await deleteUserAddress(token, id);
      setAddresses(updatedAddresses);
    },
    [token]
  );

  const toggleFav = useCallback(
    async (productId: string | number): Promise<boolean> => {
      if (!token) return false;
      const result = await apiToggleFavourite(token, productId);
      setFavourites(result.favourites);
      return result.is_favourite;
    },
    [token]
  );

  const isFav = useCallback(
    (productId: string | number) => {
      const pId = Number(productId);
      return favourites.some((f) => f.product_id === pId);
    },
    [favourites]
  );

  const refreshUser = useCallback(async () => {
    if (token) {
      await loadUser(token);
    }
  }, [token, loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        isLoading,
        addresses,
        favourites,
        requestOtp,
        confirmOtp,
        logout,
        updateProfileInfo,
        addAddress,
        editAddress,
        removeAddress,
        toggleFav,
        isFav,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
