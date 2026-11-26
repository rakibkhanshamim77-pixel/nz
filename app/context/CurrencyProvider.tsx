"use client";

import { createContext, useContext, useMemo } from "react";
import {
  formatPrice,
  DEFAULT_CURRENCY_SETTINGS,
  type CurrencySettings,
} from "@/db/settings";

interface CurrencyContextValue {
  currency: CurrencySettings;
  fmt: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY_SETTINGS,
  fmt: (amount) => formatPrice(amount, DEFAULT_CURRENCY_SETTINGS),
});

export function CurrencyProvider({
  currency,
  children,
}: {
  currency: CurrencySettings;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      currency,
      fmt: (amount: number) => formatPrice(amount, currency),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency.code, currency.symbol, currency.symbolPosition, currency.decimalPlaces],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
