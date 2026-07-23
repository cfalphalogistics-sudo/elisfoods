const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserAddress {
  id: number;
  user_id: number;
  label: string;
  address: string;
  ghana_post_gps: string | null;
  landmark: string | null;
  delivery_instructions: string | null;
  is_default: boolean;
}

export interface UserFavourite {
  id: number;
  user_id: number;
  product_id: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image: string;
  };
}

export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  addresses?: UserAddress[];
  favourites?: UserFavourite[];
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string; debug_code?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to send verification code.");
  }
  return data;
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<{ success: boolean; token: string; user: UserProfile }> {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Invalid verification code.");
  }
  return data;
}

export async function fetchUserProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to load user profile");
  const data = await res.json();
  return data.user;
}

export async function updateProfile(
  token: string,
  payload: { name: string; email?: string }
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update profile");
  return data.user;
}

export async function logoutUser(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Ignore network errors on logout
  }
}

export async function fetchUserAddresses(token: string): Promise<UserAddress[]> {
  const res = await fetch(`${API_BASE}/api/user/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.addresses || [];
}

export async function saveUserAddress(
  token: string,
  payload: Omit<UserAddress, "id" | "user_id">,
  id?: number
): Promise<UserAddress[]> {
  const url = id ? `${API_BASE}/api/user/addresses/${id}` : `${API_BASE}/api/user/addresses`;
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save address.");
  return data.addresses || [];
}

export async function deleteUserAddress(token: string, id: number): Promise<UserAddress[]> {
  const res = await fetch(`${API_BASE}/api/user/addresses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete address.");
  return data.addresses || [];
}

export async function fetchUserFavourites(token: string): Promise<UserFavourite[]> {
  const res = await fetch(`${API_BASE}/api/user/favourites`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.favourites || [];
}

export async function toggleFavourite(
  token: string,
  productId: string | number
): Promise<{ is_favourite: boolean; favourites: UserFavourite[] }> {
  const res = await fetch(`${API_BASE}/api/user/favourites/${productId}/toggle`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to toggle favourite.");
  return data;
}

export async function fetchUserOrders(token: string) {
  const res = await fetch(`${API_BASE}/api/user/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.orders || [];
}
