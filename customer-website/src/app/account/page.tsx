"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { statusLabel } from "@/lib/services/orderService";
import { fetchUserOrders, type UserAddress } from "@/lib/services/authService";
import Link from "next/link";

interface BackendOrder {
  id: number;
  reference: string;
  customer_name: string;
  phone: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
  }>;
}

export default function AccountPage() {
  const {
    user,
    isLoggedIn,
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
  } = useAuth();

  const { addItem } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "favourites">("orders");

  // Auth State
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [authLoading, setAuthLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    address: "",
    ghana_post_gps: "",
    landmark: "",
    delivery_instructions: "",
    is_default: false,
  });

  // Timer countdown for OTP resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Load orders when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("elis_auth_token");
      if (token) {
        setOrdersLoading(true);
        fetchUserOrders(token)
          .then((data) => setOrders(data))
          .catch(() => showToast("Failed to fetch order history", "error"))
          .finally(() => setOrdersLoading(false));
      }
    }
  }, [isLoggedIn, showToast]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast("Please enter a valid phone number", "error");
      return;
    }
    setAuthLoading(true);
    try {
      const result = await requestOtp(phone);
      setStep("otp");
      setResendTimer(45);
      if (result.debug_code) {
        setDebugOtp(result.debug_code);
        showToast(`Verification code sent! (Debug Code: ${result.debug_code})`, "info");
      } else {
        showToast("Verification code sent to your phone via SMS", "success");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send verification code";
      showToast(msg, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      showToast("Please enter the verification code", "error");
      return;
    }
    setAuthLoading(true);
    try {
      await confirmOtp(phone, otpCode);
      showToast("Login successful! Welcome back.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid code. Please try again.";
      showToast(msg, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOpenProfileModal = () => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setShowProfileModal(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileInfo(profileName, profileEmail);
      setShowProfileModal(false);
      showToast("Profile updated successfully", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      showToast(msg, "error");
    }
  };

  const handleOpenAddressModal = (addr?: UserAddress) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        label: addr.label,
        address: addr.address,
        ghana_post_gps: addr.ghana_post_gps || "",
        landmark: addr.landmark || "",
        delivery_instructions: addr.delivery_instructions || "",
        is_default: addr.is_default,
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        label: "Home",
        address: "",
        ghana_post_gps: "",
        landmark: "",
        delivery_instructions: "",
        is_default: addresses.length === 0,
      });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.address.trim()) {
      showToast("Please enter street address", "error");
      return;
    }

    try {
      if (editingAddressId) {
        await editAddress(editingAddressId, addressForm);
        showToast("Address updated", "success");
      } else {
        await addAddress(addressForm);
        showToast("New address added", "success");
      }
      setShowAddressModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      showToast(msg, "error");
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await removeAddress(id);
        showToast("Address removed", "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete address";
        showToast(msg, "error");
      }
    }
  };

  const handleReorder = async (order: BackendOrder) => {
    let addedCount = 0;
    order.items.forEach((item) => {
      addItem({
        productId: "",
        name: item.name,
        image: "/logo.png",
        price: item.price / 100,
        quantity: item.quantity,
        size: item.size,
        addOns: [],
        instructions: "",
      });
      addedCount++;
    });
    showToast(`Added ${addedCount} item(s) to your cart!`, "success");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not Logged In View
  if (!isLoggedIn) {
    return (
      <main className="max-w-md mx-auto px-container-mobile md:px-container-desktop py-12 pb-32">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">lock</span>
          </div>
          <h1 className="font-heading text-headline-xl mb-2">Welcome to Eli&apos;s Food</h1>
          <p className="text-on-surface-variant">Sign in with your Ghana phone number via SMS code.</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="bg-surface rounded-3xl p-6 shadow-card space-y-5">
            <div>
              <label className="block text-label-sm font-label-bold text-on-surface-variant mb-2">
                Phone Number
              </label>
              <div className="flex items-center bg-surface-container-low rounded-2xl px-4 py-1 border border-outline-variant focus-within:border-primary transition-colors">
                <span className="text-on-surface font-bold pr-3 border-r border-outline-variant">+233</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none p-3 font-body-md text-on-surface"
                  placeholder="24 123 4567"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? "Sending Code..." : "Send Verification Code"}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="bg-surface rounded-3xl p-6 shadow-card space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-label-sm font-label-bold text-on-surface-variant">
                  Enter 6-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Change Phone
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">
                Sent via SMS to <span className="font-bold text-on-surface">{phone}</span>
              </p>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center text-2xl font-bold tracking-widest bg-surface-container-low rounded-2xl p-4 border border-outline-variant focus:border-primary focus:outline-none"
                placeholder="123456"
                required
                autoFocus
              />
            </div>

            {debugOtp && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <p className="text-xs text-amber-700 font-medium">Testing Mode OTP: <span className="font-bold tracking-wider">{debugOtp}</span></p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-primary text-white rounded-full font-label-bold text-label-bold shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? "Verifying..." : "Verify & Sign In"}
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={resendTimer > 0 || authLoading}
                onClick={handleSendOtp}
                className="text-xs text-on-surface-variant hover:text-primary disabled:opacity-50 font-bold transition-colors"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend SMS Code"}
              </button>
            </div>
          </form>
        )}
      </main>
    );
  }

  // Logged In Account Dashboard
  const displayName = user?.name || "Customer";
  const displayPhone = user?.phone || "";

  return (
    <main className="max-w-[1440px] mx-auto px-container-mobile md:px-container-desktop py-stack-md pb-32">
      <div className="flex flex-col md:flex-row gap-gutter items-start">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-surface rounded-3xl p-5 shadow-card">
          <div className="flex items-center gap-4 p-3 mb-4 bg-surface-container-low rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-3xl">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-heading text-headline-md text-[18px] truncate">{displayName}</p>
                <button
                  onClick={handleOpenProfileModal}
                  className="text-primary hover:text-primary/80"
                  title="Edit Profile"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <p className="text-on-surface-variant text-label-sm truncate">{displayPhone}</p>
              {user?.email && <p className="text-on-surface-variant text-xs truncate">{user.email}</p>}
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: "orders", icon: "receipt_long", label: `Orders (${orders.length})` },
              { id: "addresses", icon: "location_on", label: `Saved Addresses (${addresses.length})` },
              { id: "favourites", icon: "favorite", label: `Favourites (${favourites.length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-label-bold text-label-bold transition-colors ${
                  activeTab === t.id
                    ? "bg-primary text-white"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined">{t.icon}</span>
                {t.label}
              </button>
            ))}

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-label-bold text-label-bold text-error hover:bg-error-container transition-colors mt-4"
            >
              <span className="material-symbols-outlined">logout</span>
              Log Out
            </button>
          </nav>
        </aside>

        {/* Main Tab Content */}
        <div className="flex-1 w-full">
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="font-heading text-headline-md mb-4">Order History</h2>

              {ordersLoading ? (
                <div className="p-8 text-center text-on-surface-variant">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="bg-surface rounded-3xl p-8 shadow-card text-center space-y-4">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">shopping_basket</span>
                  <p className="text-on-surface-variant font-medium">You haven&apos;t placed any orders yet.</p>
                  <Link
                    href="/menu"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-full font-label-bold hover:bg-primary/90 transition-all"
                  >
                    Explore Menu
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.reference} className="bg-surface rounded-3xl p-6 shadow-card">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-label-bold text-label-bold text-lg text-on-surface">{order.reference}</p>
                        <p className="text-on-surface-variant text-xs">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <span className="px-3.5 py-1.5 bg-primary/10 text-primary rounded-full font-label-bold text-xs uppercase tracking-wide">
                        {statusLabel(order.status as Parameters<typeof statusLabel>[0])}
                      </span>
                    </div>

                    <div className="border-t border-b border-outline-variant/40 py-3 my-3 space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-on-surface">
                            {item.quantity}x {item.name} {item.size && `(${item.size})`}
                          </span>
                          <span className="font-medium">{formatPrice(item.price / 100)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-on-surface-variant block">Total</span>
                        <span className="font-heading text-headline-md text-secondary">{formatPrice(order.total / 100)}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReorder(order)}
                          className="px-4 py-2 bg-surface-container-high text-on-surface rounded-full font-label-bold text-label-sm hover:bg-surface-container transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">autorenew</span>
                          Reorder
                        </button>
                        <Link
                          href={`/track?ref=${order.reference}`}
                          className="px-4 py-2 border border-primary text-primary rounded-full font-label-bold text-label-sm hover:bg-primary/5 transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">near_me</span>
                          Track
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-headline-md">Saved Addresses</h2>
                <button
                  onClick={() => handleOpenAddressModal()}
                  className="px-4 py-2 bg-primary text-white rounded-full font-label-bold text-label-sm flex items-center gap-1 hover:bg-primary/90 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Address
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-surface rounded-3xl p-5 shadow-card relative border border-outline-variant/30">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-label-bold text-label-bold text-on-surface">{addr.label}</span>
                        {addr.is_default && (
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenAddressModal(addr)}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-full"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-error hover:bg-error-container/20 rounded-full"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-on-surface text-body-md mb-2">{addr.address}</p>

                    {addr.ghana_post_gps && (
                      <p className="text-xs text-on-surface-variant">GPS: <span className="font-mono">{addr.ghana_post_gps}</span></p>
                    )}
                    {addr.landmark && (
                      <p className="text-xs text-on-surface-variant">Landmark: {addr.landmark}</p>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => handleOpenAddressModal()}
                  className="bg-surface rounded-3xl p-6 shadow-card border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-primary min-h-[140px] hover:bg-primary/5 transition-all group"
                >
                  <span className="material-symbols-outlined text-4xl mb-2 group-hover:scale-110 transition-transform">add_circle</span>
                  <span className="font-label-bold text-label-bold">Add New Address</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "favourites" && (
            <div>
              <h2 className="font-heading text-headline-md mb-4">Favourites</h2>

              {favourites.length === 0 ? (
                <div className="bg-surface rounded-3xl p-8 shadow-card text-center space-y-4">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">favorite_border</span>
                  <p className="text-on-surface-variant font-medium">You haven&apos;t saved any favourites yet.</p>
                  <Link
                    href="/menu"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-full font-label-bold hover:bg-primary/90 transition-all"
                  >
                    Browse Menu & Save Favourites
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {favourites.map((fav) => {
                    const prod = fav.product;
                    if (!prod) return null;
                    return (
                      <div key={fav.id} className="bg-surface rounded-2xl p-4 shadow-card flex flex-col justify-between hover:shadow-md transition-shadow relative">
                        <button
                          onClick={() => toggleFav(prod.id)}
                          className="absolute top-3 right-3 text-primary p-1 bg-surface/80 backdrop-blur-sm rounded-full shadow-sm"
                          title="Remove from favourites"
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                          </span>
                        </button>
                        <div className="mb-4">
                          <Link href={`/product?slug=${prod.slug}`} className="font-label-bold text-label-bold text-on-surface block hover:text-primary">
                            {prod.name}
                          </Link>
                          <p className="text-secondary font-bold mt-1">{formatPrice(prod.price)}</p>
                        </div>
                        <button
                          onClick={() => {
                            addItem({
                              productId: String(prod.id),
                              name: prod.name,
                              image: prod.image || "/logo.png",
                              price: prod.price,
                              quantity: 1,
                              addOns: [],
                              instructions: "",
                            });
                            showToast(`Added ${prod.name} to cart!`, "success");
                          }}
                          className="w-full py-2 bg-primary/10 text-primary rounded-xl font-label-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                          Add to Cart
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-headline-md">Edit Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-5 py-2.5 rounded-full border border-outline-variant font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-headline-md">
                {editingAddressId ? "Edit Address" : "Add Saved Address"}
              </h3>
              <button onClick={() => setShowAddressModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Address Label</label>
                <div className="flex gap-2">
                  {["Home", "Work", "Other"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        addressForm.label === lbl
                          ? "bg-primary text-white border-primary"
                          : "border-outline-variant text-on-surface-variant"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Street / Residential Address</label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none text-sm"
                  placeholder="e.g. Community 18, Lashibi, near Shell filling station"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">GhanaPost GPS (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.ghana_post_gps}
                    onChange={(e) => setAddressForm({ ...addressForm, ghana_post_gps: e.target.value })}
                    className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none text-sm"
                    placeholder="GT-123-4567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none text-sm"
                    placeholder="Near Shell station"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  value={addressForm.delivery_instructions}
                  onChange={(e) => setAddressForm({ ...addressForm, delivery_instructions: e.target.value })}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none text-sm"
                  placeholder="Call when outside, blue gate"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="is_default" className="text-xs text-on-surface font-medium cursor-pointer">
                  Set as default delivery address
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-5 py-2.5 rounded-full border border-outline-variant font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
