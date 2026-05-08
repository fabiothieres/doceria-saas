import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("SEU-PROJETO") &&
    !supabaseAnonKey.includes("SUA_CHAVE")
);

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const demoProducts = [
  {
    id: 1,
    name: "Copo da Felicidade",
    category: "Copos da felicidade",
    price: 18,
    prep_time: "24h",
    active: true,
    description:
      "Copo recheado com camadas de creme, bolo, brownie e complementos.",
    icon: "🥤",
    image_url: "",
    options: {
      fillings: ["Brigadeiro", "Ninho", "Morango"],
      masses: ["Brownie", "Chocolate"],
      shells: [],
      ingredients: ["Morango", "Oreo", "Granulado"],
    },
  },
  {
    id: 2,
    name: "Bolo Personalizado",
    category: "Bolos",
    price: 95,
    prep_time: "48h",
    active: true,
    description:
      "Bolo artesanal personalizado para aniversários e datas especiais.",
    icon: "🍰",
    image_url: "",
    options: {
      fillings: ["Ninho", "Brigadeiro", "Doce de leite"],
      masses: ["Chocolate", "Baunilha"],
      shells: [],
      ingredients: ["Morango", "Confete", "Leite em pó"],
    },
  },
];

const demoOrders = [
  {
    id: 1,
    code: "#DF-0001",
    client_name: "Maria Julia",
    client_phone: "84999999",
    contact_source: "WhatsApp",
    product_name: "1x Copo da Felicidade",
    quantity: 1,
    total: 18,
    payment_status: "Não pago",
    shipping_status: "Retirada",
    order_status: "Aguardando pagamento",
    due_date: "",
    notes: "Pedido de demonstração",
  },
];

const demoOptions = [
  { id: 1, type: "fillings", name: "Brigadeiro" },
  { id: 2, type: "fillings", name: "Ninho" },
  { id: 3, type: "fillings", name: "Nutella" },
  { id: 4, type: "fillings", name: "Doce de leite" },
  { id: 5, type: "fillings", name: "Oreo" },
  { id: 6, type: "fillings", name: "Kinder" },
  { id: 7, type: "fillings", name: "Morango" },

  { id: 8, type: "masses", name: "Chocolate" },
  { id: 9, type: "masses", name: "Baunilha" },
  { id: 10, type: "masses", name: "Red Velvet" },
  { id: 11, type: "masses", name: "Brownie" },
  { id: 12, type: "masses", name: "Cenoura" },

  { id: 13, type: "shells", name: "Chocolate ao leite" },
  { id: 14, type: "shells", name: "Chocolate branco" },
  { id: 15, type: "shells", name: "Meio amargo" },

  { id: 16, type: "ingredients", name: "Morango" },
  { id: 17, type: "ingredients", name: "Oreo" },
  { id: 18, type: "ingredients", name: "Granulado" },
  { id: 19, type: "ingredients", name: "Confete" },
  { id: 20, type: "ingredients", name: "Leite em pó" },
  { id: 21, type: "ingredients", name: "Nozes" },
  { id: 22, type: "ingredients", name: "Coco" },
];

const STORAGE_KEYS = {
  products: "doceria-products",
  orders: "doceria-orders",
  options: "doceria-options",
};

function loadLocal(key, fallback) {
  const stored = localStorage.getItem(key);

  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function saveLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

function sortById(data) {
  return [...data].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
}

function makeOrderCode(id) {
  return `#DF-${String(id).padStart(4, "0")}`;
}

function normalizeProduct(product) {
  return {
    ...product,
    price: Number(product.price || 0),
    icon: product.icon || "",
    image_url: product.image_url || "",
    options: product.options || {
      fillings: [],
      masses: [],
      shells: [],
      ingredients: [],
    },
  };
}

function normalizeOrder(order) {
  return {
    ...order,
    quantity: Number(order.quantity || 1),
    total: Number(order.total || 0),
    code: order.code || makeOrderCode(order.id || 1),
  };
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase não configurado.");
  }

  return supabase;
}

function handleSupabaseError(error) {
  if (error) {
    console.error(error);
    throw new Error(error.message || "Erro ao comunicar com o Supabase.");
  }
}

export async function getCurrentSession() {
  if (!hasSupabase) {
    return null;
  }

  const { data, error } = await requireSupabase().auth.getSession();

  handleSupabaseError(error);

  return data.session;
}

export function onAuthStateChange(callback) {
  if (!hasSupabase) {
    callback(null);
    return () => {};
  }

  const { data } = requireSupabase().auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );

  return () => {
    data.subscription.unsubscribe();
  };
}

export async function signInAdmin(email, password) {
  if (!hasSupabase) {
    throw new Error("Configure o Supabase no .env.local antes de usar login.");
  }

  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email,
    password,
  });

  handleSupabaseError(error);

  return data.session;
}

export async function signOutAdmin() {
  if (!hasSupabase) {
    return;
  }

  const { error } = await requireSupabase().auth.signOut();

  handleSupabaseError(error);
}

export async function listProducts() {
  if (!hasSupabase) {
    return sortById(loadLocal(STORAGE_KEYS.products, demoProducts)).map(
      normalizeProduct
    );
  }

  const { data, error } = await requireSupabase()
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  handleSupabaseError(error);

  return (data || []).map(normalizeProduct);
}

export async function saveProduct(product) {
  if (!hasSupabase) {
    const products = loadLocal(STORAGE_KEYS.products, demoProducts);
    const normalized = normalizeProduct(product);

    if (normalized.id) {
      return saveLocal(
        STORAGE_KEYS.products,
        products.map((item) =>
          item.id === normalized.id ? normalized : item
        )
      );
    }

    const nextId =
      Math.max(0, ...products.map((item) => Number(item.id || 0))) + 1;

    return saveLocal(STORAGE_KEYS.products, [
      ...products,
      {
        ...normalized,
        id: nextId,
      },
    ]);
  }

  const payload = normalizeProduct(product);

  if (payload.id) {
    const { error } = await requireSupabase()
      .from("products")
      .update(payload)
      .eq("id", payload.id);

    handleSupabaseError(error);
  } else {
    const { id, created_at, updated_at, ...insertPayload } = payload;

    const { error } = await requireSupabase()
      .from("products")
      .insert(insertPayload);

    handleSupabaseError(error);
  }

  return listProducts();
}

export async function deleteProduct(id) {
  if (!hasSupabase) {
    const products = loadLocal(STORAGE_KEYS.products, demoProducts);

    return saveLocal(
      STORAGE_KEYS.products,
      products.filter((product) => product.id !== id)
    );
  }

  const { error } = await requireSupabase()
    .from("products")
    .delete()
    .eq("id", id);

  handleSupabaseError(error);

  return listProducts();
}

export async function listOrders() {
  if (!hasSupabase) {
    return sortById(loadLocal(STORAGE_KEYS.orders, demoOrders)).map(
      normalizeOrder
    );
  }

  const { data, error } = await requireSupabase()
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  handleSupabaseError(error);

  return (data || []).map(normalizeOrder);
}

export async function saveOrder(order) {
  if (!hasSupabase) {
    const orders = loadLocal(STORAGE_KEYS.orders, demoOrders);
    const normalized = normalizeOrder(order);

    if (normalized.id) {
      return saveLocal(
        STORAGE_KEYS.orders,
        orders.map((item) => (item.id === normalized.id ? normalized : item))
      );
    }

    const nextId =
      Math.max(0, ...orders.map((item) => Number(item.id || 0))) + 1;

    return saveLocal(STORAGE_KEYS.orders, [
      {
        ...normalized,
        id: nextId,
        code: makeOrderCode(nextId),
      },
      ...orders,
    ]);
  }

  const payload = {
    ...order,
    quantity: Number(order.quantity || 1),
    total: Number(order.total || 0),
  };

  const { id, code, created_at, updated_at, ...insertPayload } = payload;

  const { error } = await requireSupabase()
    .from("orders")
    .insert(insertPayload);

  handleSupabaseError(error);

  return listOrders();
}

export async function updateOrderStatus(id, patch) {
  if (!hasSupabase) {
    const orders = loadLocal(STORAGE_KEYS.orders, demoOrders);

    return saveLocal(
      STORAGE_KEYS.orders,
      orders.map((order) => (order.id === id ? { ...order, ...patch } : order))
    );
  }

  const { error } = await requireSupabase()
    .from("orders")
    .update(patch)
    .eq("id", id);

  handleSupabaseError(error);

  return listOrders();
}

export async function listOptions() {
  if (!hasSupabase) {
    return sortById(loadLocal(STORAGE_KEYS.options, demoOptions));
  }

  const { data, error } = await requireSupabase()
    .from("options")
    .select("*")
    .order("id", { ascending: true });

  handleSupabaseError(error);

  return data || [];
}

export async function saveOption(option) {
  if (!hasSupabase) {
    const options = loadLocal(STORAGE_KEYS.options, demoOptions);
    const nextId =
      Math.max(0, ...options.map((item) => Number(item.id || 0))) + 1;

    return saveLocal(STORAGE_KEYS.options, [
      ...options,
      {
        ...option,
        id: nextId,
      },
    ]);
  }

  const { error } = await requireSupabase().from("options").insert(option);

  handleSupabaseError(error);

  return listOptions();
}

export async function deleteOrder(id) {
  if (!hasSupabase) {
    const orders = loadLocal(STORAGE_KEYS.orders, demoOrders);

    return saveLocal(
      STORAGE_KEYS.orders,
      orders.filter((order) => order.id !== id)
    );
  }

  const { error } = await requireSupabase()
    .from("orders")
    .delete()
    .eq("id", id);

  handleSupabaseError(error);

  return listOrders();
}