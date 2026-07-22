"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchStoreSettings } from "@/lib/services/storeService";
import { storeSettings as staticSettings } from "@/lib/data";

interface StoreSettingsValue {
  phone: string;
  whatsapp: string;
  email: string;
  social: { facebook: string; instagram: string; tiktok: string };
  hoursOpen: string;
  hoursClose: string;
  isOpen: boolean;
  paymentMethods: string[];
  pickupLocation: string;
}

// Baked into the prerendered HTML at build time (this site is statically
// exported), so the client's first hydration render must start here too —
// see CartContext.tsx for why reading live data any earlier causes a
// hydration mismatch. The real, admin-managed settings load right after.
const defaultValue: StoreSettingsValue = {
  phone: staticSettings.phone,
  whatsapp: staticSettings.whatsapp,
  email: staticSettings.email,
  social: staticSettings.social,
  hoursOpen: staticSettings.hours.open,
  hoursClose: staticSettings.hours.close,
  isOpen: staticSettings.isOpen,
  paymentMethods: staticSettings.paymentMethods,
  pickupLocation: staticSettings.pickupLocation,
};

const StoreSettingsContext = createContext<StoreSettingsValue>(defaultValue);

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettingsValue>(defaultValue);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const live = await fetchStoreSettings();
      if (cancelled) return;
      setSettings({
        phone: live.phone,
        whatsapp: live.whatsapp,
        email: live.email,
        social: live.social,
        hoursOpen: live.hours_open,
        hoursClose: live.hours_close,
        isOpen: live.is_open,
        paymentMethods: live.payment_methods,
        pickupLocation: live.pickup_location,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <StoreSettingsContext.Provider value={settings}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettings(): StoreSettingsValue {
  return useContext(StoreSettingsContext);
}
