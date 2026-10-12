import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  PACKAGE_TYPES,
  PRODUCTS,
  RESTAURANTS,
  RIDE_OPTIONS,
  SEED_PLACES,
  serviceMeta,
  type Place,
  type Service,
} from "../data/demo";
import { computeBill, type Bill } from "../lib/pricing";

/* ------------------------------------------------------------------ types */

export type CartLine = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  qty: number;
};
export type DeliveryService = "food" | "grocery";

export type OrderLine = { name: string; qty: number; price: number };
export type Order = {
  id: string;
  service: Service;
  title: string;
  subtitle: string;
  lines: OrderLine[];
  bill: Bill;
  payment: string;
  destination: string;
  /** 0 Confirmed · 1 Picked up · 2 On the way · 3 Delivered/Completed */
  status: number;
  createdAt: number;
  completedAt?: number;
  rating?: number;
  /** Seeded history from the design; never advanced by the simulator. */
  seeded?: boolean;
};

export type Txn = {
  id: string;
  icon: string;
  label: string;
  when: number;
  amount: number;
};
export type Notice = { id: string; text: string; when: number; read: boolean };

export type PersistedState = {
  version: 1;
  authenticated: boolean;
  profile: { name: string; phone: string; language: string };
  service: Service;
  places: Place[];
  defaultPlaceId: string;
  carts: Record<DeliveryService, { storeId: string | null; lines: CartLine[] }>;
  ride: { optionId: string; pickupId: string; dropId: string | null };
  courier: { packageId: string; pickupId: string; dropId: string | null };
  promos: Partial<Record<Service, string>>;
  usedPromos: string[];
  orders: Order[];
  wallet: { balance: number; autoTopUp: boolean; txns: Txn[] };
  notifications: Notice[];
  favorites: string[];
};

const STORAGE_KEY = "roadrider.user-app.v1";

/* ---------------------------------------------------------- seeded state */

function at(daysAgo: number, h: number, m: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function seedState(): PersistedState {
  const now = Date.now();
  return {
    version: 1,
    authenticated: false,
    profile: { name: "Arjun Khanna", phone: "", language: "English" },
    service: "food",
    places: SEED_PLACES,
    defaultPlaceId: "home",
    carts: {
      food: { storeId: null, lines: [] },
      grocery: { storeId: null, lines: [] },
    },
    ride: { optionId: "auto", pickupId: "home", dropId: null },
    courier: { packageId: "small", pickupId: "home", dropId: null },
    promos: {},
    usedPromos: [],
    orders: [
      {
        id: "RR10421",
        service: "food",
        title: "Royal Biryani House",
        subtitle: "1 item · Lucknowi Chicken Biryani",
        lines: [{ name: "Lucknowi Chicken Biryani", qty: 1, price: 289 }],
        bill: computeBill("food", 289, null),
        payment: "RoadRider Wallet",
        destination: "Home · 15, Shahnajaf Road, Hazratganj",
        status: 2,
        createdAt: now - 12 * 60_000,
        seeded: true,
      },
      {
        id: "RR10418",
        service: "courier",
        title: "Package to Gomti Nagar",
        subtitle: "Small box · up to 2 kg",
        lines: [{ name: "Small box · up to 2 kg", qty: 1, price: 139 }],
        bill: computeBill("courier", 139, null),
        payment: "RoadRider Wallet",
        destination: "Hazratganj → Gomti Nagar",
        status: 0,
        createdAt: now - 25 * 60_000,
        seeded: true,
      },
      {
        id: "RR10377",
        service: "rides",
        title: "Ride to Aminabad",
        subtitle: "Auto · Hazratganj → Aminabad",
        lines: [{ name: "Auto ride", qty: 1, price: 124 }],
        bill: computeBill("rides", 124, null),
        payment: "RoadRider Wallet",
        destination: "Aminabad, Lucknow",
        status: 3,
        createdAt: at(4, 17, 50),
        completedAt: at(4, 18, 12),
        seeded: true,
      },
      {
        id: "RR10342",
        service: "grocery",
        title: "Fresh grocery basket",
        subtitle: "Tomatoes, organic broccoli",
        lines: [{ name: "Fresh produce basket", qty: 1, price: 328 }],
        bill: computeBill("grocery", 328, null),
        payment: "Visa ending in 4821",
        destination: "Home · 15, Shahnajaf Road, Hazratganj",
        status: 3,
        createdAt: at(6, 10, 5),
        completedAt: at(6, 10, 22),
        seeded: true,
      },
    ],
    wallet: {
      balance: 320,
      autoTopUp: false,
      txns: [
        {
          id: "t3",
          icon: "food",
          label: "Royal Biryani House",
          when: at(0, 13, 24) > now ? now - 15 * 60_000 : at(0, 13, 24),
          amount: -289,
        },
        {
          id: "t2",
          icon: "car",
          label: "Ride to Gomti Nagar",
          when: at(1, 18, 42),
          amount: -96,
        },
        {
          id: "t1",
          icon: "wallet",
          label: "Money added",
          when: at(5, 10, 10),
          amount: 500,
        },
      ],
    },
    notifications: [
      {
        id: "n3",
        text: "Your food order is being prepared",
        when: now - 10 * 60_000,
        read: false,
      },
      {
        id: "n2",
        text: "Wallet cashback of ₹25 received",
        when: now - 3 * 3_600_000,
        read: false,
      },
      {
        id: "n1",
        text: "Courier partner reached the pickup",
        when: now - 20 * 60_000,
        read: true,
      },
    ],
    favorites: ["royal-biryani-house", "dd-idli-vada", "gr-tomatoes"],
  };
}

/* ---------------------------------------------------------------- context */

type Toast = { id: number; text: string } | null;

export type PendingAction =
  | {
      type: "wishlist";
      itemId: string;
      itemTitle?: string;
    }
  | {
      type: "cart";
      service: DeliveryService;
      line: Omit<CartLine, "qty">;
      storeId: string;
    };

type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

type Ctx = {
  state: PersistedState;
  toast: Toast;
  showToast: (text: string) => void;
  // guest action preservation across login
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction | null) => void;
  clearPendingAction: () => void;
  // auth & profile
  signIn: (phone: string) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<PersistedState["profile"]>) => void;
  // service & places
  setService: (s: Service) => void;
  placeById: (id: string | null | undefined) => Place | undefined;
  setDefaultPlace: (id: string) => void;
  addPlace: (p: Omit<Place, "id">) => Place;
  removePlace: (id: string) => void;
  // carts
  addToCart: (
    service: DeliveryService,
    line: Omit<CartLine, "qty">,
    storeId: string
  ) => void;
  changeQty: (service: DeliveryService, id: string, delta: number) => void;
  cartCount: (service: Service) => number;
  itemTotal: (service: Service) => number;
  // ride & courier
  setRide: (patch: Partial<PersistedState["ride"]>) => void;
  setCourier: (patch: Partial<PersistedState["courier"]>) => void;
  // promo
  applyPromo: (service: Service, code: string | null) => void;
  // orders
  placeOrder: (
    service: Service,
    method: "wallet" | "upi" | "card",
    destination: string
  ) => PlaceOrderResult;
  setOrderStatus: (id: string, status: number) => void;
  rateOrder: (id: string, rating: number) => void;
  // wallet
  addMoney: (amount: number) => void;
  setAutoTopUp: (on: boolean) => void;
  // misc
  toggleFavorite: (id: string) => void;
  markAllRead: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export const STATUS_LABELS = [
  "Confirmed",
  "Picked up",
  "On the way",
  "Delivered",
];

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(seedState);
  const [toast, setToast] = useState<Toast>(null);
  const [pendingActionState, setPendingActionState] = useState<PendingAction | null>(null);
  const pendingActionRef = useRef<PendingAction | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isLoaded = useRef(false);

  // Restore state from AsyncStorage on initial load
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        try {
          const parsed = JSON.parse(raw) as PersistedState;
          if (parsed && parsed.version === 1) {
            setState({
              ...parsed,
              favorites:
                parsed.favorites && parsed.favorites.length > 0
                  ? parsed.favorites
                  : ["royal-biryani-house", "dd-idli-vada", "gr-tomatoes"],
            });
          }
        } catch {
          // Keep seed state if parsing fails
        }
      })
      .finally(() => {
        isLoaded.current = true;
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist state changes to AsyncStorage
  useEffect(() => {
    if (!isLoaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Storage unavailable or quota exceeded
    });
  }, [state]);

  const showToast = useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const notify = (s: PersistedState, text: string): PersistedState => ({
    ...s,
    notifications: [
      {
        id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        text,
        when: Date.now(),
        read: false,
      },
      ...s.notifications,
    ],
  });

  const value = useMemo<Ctx>(() => {
    const placeById = (id: string | null | undefined) =>
      state.places.find((p) => p.id === id);

    const itemTotal = (service: Service) => {
      if (service === "food" || service === "grocery")
        return state.carts[service].lines.reduce(
          (sum, l) => sum + l.price * l.qty,
          0
        );
      if (service === "rides")
        return (
          RIDE_OPTIONS.find((r) => r.id === state.ride.optionId)?.fare ?? 0
        );
      return (
        PACKAGE_TYPES.find((p) => p.id === state.courier.packageId)?.price ?? 0
      );
    };

    return {
      state,
      toast,
      showToast,
      pendingAction: pendingActionState,
      setPendingAction: (action) => {
        pendingActionRef.current = action;
        setPendingActionState(action);
      },
      clearPendingAction: () => {
        pendingActionRef.current = null;
        setPendingActionState(null);
      },
      signIn: (phone) => {
        const actionToExecute = pendingActionRef.current;
        setState((s) => {
          let next = {
            ...s,
            authenticated: true,
            profile: { ...s.profile, phone },
          };
          if (actionToExecute) {
            if (actionToExecute.type === "wishlist") {
              if (!next.favorites.includes(actionToExecute.itemId)) {
                next = {
                  ...next,
                  favorites: [...next.favorites, actionToExecute.itemId],
                };
              }
            } else if (actionToExecute.type === "cart") {
              const cart = next.carts[actionToExecute.service];
              const lines =
                cart.storeId && cart.storeId !== actionToExecute.storeId
                  ? []
                  : cart.lines;
              const existing = lines.find((l) => l.id === actionToExecute.line.id);
              const nextLines = existing
                ? lines.map((l) =>
                    l.id === actionToExecute.line.id ? { ...l, qty: l.qty + 1 } : l
                  )
                : [...lines, { ...actionToExecute.line, qty: 1 }];
              next = {
                ...next,
                carts: {
                  ...next.carts,
                  [actionToExecute.service]: {
                    storeId: actionToExecute.storeId,
                    lines: nextLines,
                  },
                },
              };
            }
          }
          return next;
        });

        if (actionToExecute) {
          if (actionToExecute.type === "wishlist") {
            showToast(
              actionToExecute.itemTitle
                ? `Added ${actionToExecute.itemTitle} to favorites!`
                : "Added to favorites!"
            );
          } else if (actionToExecute.type === "cart") {
            showToast(`Added ${actionToExecute.line.name} to cart!`);
          }
          pendingActionRef.current = null;
          setPendingActionState(null);
        }
      },
      signOut: () => setState((s) => ({ ...s, authenticated: false })),
      updateProfile: (patch) =>
        setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
      setService: (service) => setState((s) => ({ ...s, service })),
      placeById,
      setDefaultPlace: (id) => setState((s) => ({ ...s, defaultPlaceId: id })),
      addPlace: (p) => {
        const place: Place = { ...p, id: `place-${Date.now()}` };
        setState((s) => ({ ...s, places: [...s.places, place] }));
        return place;
      },
      removePlace: (id) =>
        setState((s) => {
          const places = s.places.filter((p) => p.id !== id);
          const fallback = places[0]?.id ?? "";
          const swap = (v: string | null) => (v === id ? null : v);
          return {
            ...s,
            places,
            defaultPlaceId: s.defaultPlaceId === id ? fallback : s.defaultPlaceId,
            ride: {
              ...s.ride,
              pickupId: s.ride.pickupId === id ? fallback : s.ride.pickupId,
              dropId: swap(s.ride.dropId),
            },
            courier: {
              ...s.courier,
              pickupId:
                s.courier.pickupId === id ? fallback : s.courier.pickupId,
              dropId: swap(s.courier.dropId),
            },
          };
        }),
      addToCart: (service, line, storeId) =>
        setState((s) => {
          const cart = s.carts[service];
          const lines =
            cart.storeId && cart.storeId !== storeId ? [] : cart.lines;
          const existing = lines.find((l) => l.id === line.id);
          const nextLines = existing
            ? lines.map((l) =>
                l.id === line.id ? { ...l, qty: l.qty + 1 } : l
              )
            : [...lines, { ...line, qty: 1 }];
          return {
            ...s,
            carts: { ...s.carts, [service]: { storeId, lines: nextLines } },
          };
        }),
      changeQty: (service, id, delta) =>
        setState((s) => {
          const cart = s.carts[service];
          const lines = cart.lines
            .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
            .filter((l) => l.qty > 0);
          return {
            ...s,
            carts: {
              ...s.carts,
              [service]: {
                storeId: lines.length ? cart.storeId : null,
                lines,
              },
            },
          };
        }),
      cartCount: (service) => {
        if (service === "food" || service === "grocery")
          return state.carts[service].lines.reduce((n, l) => n + l.qty, 0);
        if (service === "rides") return state.ride.dropId ? 1 : 0;
        return state.courier.dropId ? 1 : 0;
      },
      itemTotal,
      setRide: (patch) =>
        setState((s) => ({ ...s, ride: { ...s.ride, ...patch } })),
      setCourier: (patch) =>
        setState((s) => ({ ...s, courier: { ...s.courier, ...patch } })),
      applyPromo: (service, code) =>
        setState((s) => {
          const promos = { ...s.promos };
          if (code) promos[service] = code;
          else delete promos[service];
          return { ...s, promos };
        }),
      placeOrder: (service, method, destination) => {
        const total = itemTotal(service);
        const bill = computeBill(service, total, state.promos[service] ?? null);
        if (total <= 0) return { ok: false, error: "Your cart is empty." };
        if (method !== "wallet") {
          return {
            ok: false,
            error:
              "Online payments aren't connected in this build. Please pay with RoadRider Wallet.",
          };
        }
        if (state.wallet.balance < bill.toPay) {
          return {
            ok: false,
            error: `Insufficient wallet balance. Add ₹${
              bill.toPay - state.wallet.balance
            } or more to continue.`,
          };
        }
        let title = "";
        let subtitle = "";
        let lines: OrderLine[] = [];
        if (service === "food" || service === "grocery") {
          const cart = state.carts[service];
          lines = cart.lines.map((l) => ({
            name: l.name,
            qty: l.qty,
            price: l.price,
          }));
          const count = cart.lines.reduce((n, l) => n + l.qty, 0);
          title =
            service === "food"
              ? RESTAURANTS.find((r) => r.id === cart.storeId)?.name ??
                "Food order"
              : "Fresh grocery basket";
          subtitle = `${count} item${count > 1 ? "s" : ""} · ${cart.lines
            .map((l) => l.name)
            .join(", ")}`;
        } else if (service === "rides") {
          const opt = RIDE_OPTIONS.find((r) => r.id === state.ride.optionId)!;
          const from = placeById(state.ride.pickupId);
          const to = placeById(state.ride.dropId);
          title = `Ride to ${to?.area.split(",")[0] ?? "destination"}`;
          subtitle = `${opt.name} · ${from?.area.split(",")[0] ?? "Pickup"} → ${
            to?.area.split(",")[0] ?? ""
          }`;
          lines = [{ name: `${opt.name} ride`, qty: 1, price: opt.fare }];
        } else {
          const pkg = PACKAGE_TYPES.find(
            (p) => p.id === state.courier.packageId
          )!;
          const to = placeById(state.courier.dropId);
          title = `Package to ${to?.area.split(",")[0] ?? "destination"}`;
          subtitle = `${pkg.name} · ${pkg.weight.toLowerCase()}`;
          lines = [
            {
              name: `${pkg.name} · ${pkg.weight.toLowerCase()}`,
              qty: 1,
              price: pkg.price,
            },
          ];
        }
        const order: Order = {
          id: `RR${Math.floor(10500 + Math.random() * 89000)}`,
          service,
          title,
          subtitle,
          lines,
          bill,
          payment: "RoadRider Wallet",
          destination,
          status: 0,
          createdAt: Date.now(),
        };
        setState((s) => {
          let next: PersistedState = {
            ...s,
            orders: [order, ...s.orders],
            wallet: {
              ...s.wallet,
              balance: s.wallet.balance - bill.toPay,
              txns: [
                {
                  id: `t${Date.now()}`,
                  icon: serviceMeta[service].icon,
                  label: title,
                  when: Date.now(),
                  amount: -bill.toPay,
                },
                ...s.wallet.txns,
              ],
            },
            usedPromos: bill.promo ? [...s.usedPromos, bill.promo] : s.usedPromos,
            promos: { ...s.promos, [service]: undefined },
          };
          if (service === "food" || service === "grocery")
            next = {
              ...next,
              carts: { ...next.carts, [service]: { storeId: null, lines: [] } },
            };
          if (service === "rides")
            next = { ...next, ride: { ...next.ride, dropId: null } };
          if (service === "courier")
            next = { ...next, courier: { ...next.courier, dropId: null } };
          return notify(next, `${title}: booking confirmed`);
        });
        return { ok: true, order };
      },
      setOrderStatus: (id, status) =>
        setState((s) => ({
          ...s,
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  completedAt: status >= 3 ? Date.now() : o.completedAt,
                }
              : o
          ),
        })),
      rateOrder: (id, rating) =>
        setState((s) => ({
          ...s,
          orders: s.orders.map((o) => (o.id === id ? { ...o, rating } : o)),
        })),
      addMoney: (amount) =>
        setState((s) =>
          notify(
            {
              ...s,
              wallet: {
                ...s.wallet,
                balance: s.wallet.balance + amount,
                txns: [
                  {
                    id: `t${Date.now()}`,
                    icon: "wallet",
                    label: "Money added (demo)",
                    when: Date.now(),
                    amount,
                  },
                  ...s.wallet.txns,
                ],
              },
            },
            `₹${amount} demo credit added to your wallet`
          )
        ),
      setAutoTopUp: (on) =>
        setState((s) => ({
          ...s,
          wallet: { ...s.wallet, autoTopUp: on },
        })),
      toggleFavorite: (id) =>
        setState((s) => ({
          ...s,
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      markAllRead: () =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    };
  }, [state, toast, showToast]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppStateProvider");
  return ctx;
}

export { PRODUCTS };
