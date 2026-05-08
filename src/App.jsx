import React, { useEffect, useMemo, useState } from "react";
import {
  deleteProduct,
  deleteOrder,
  hasSupabase,
  listOptions,
  listOrders,
  listProducts,
  saveOption,
  saveOrder,
  saveProduct,
  signInAdmin,
  signOutAdmin,
  getCurrentSession,
  onAuthStateChange,
  updateOrderStatus,
} from "./lib/db";
import { categories, optionTypes } from "./data/seed";

const money = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function normalizePaymentStatus(status) {
  if (status === "Pago") return "Pago 100%";
  if (status === "Sinal") return "Pago 50%";
  return status || "Não pago";
}

const blankProduct = {
  name: "",
  category: categories[0],
  price: "",
  prep_time: "24h",
  active: true,
  description: "",
  icon: "",
  image_url: "",
  options: { fillings: [], masses: [], shells: [], ingredients: [] },
};

const blankOrder = {
  client_name: "",
  client_phone: "",
  contact_source: "WhatsApp",
  product_name: "",
  quantity: 1,
  total: "",
  payment_status: "Não pago",
  shipping_status: "Pendente",
  order_status: "Aguardando pagamento",
  due_date: "",
  notes: "",
};

function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      return;
    }
  }, [key, value]);

  return [value, setValue];
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInAdmin(email, password);
    } catch (err) {
      setError(
        err.message || "Não foi possível entrar. Confira e-mail e senha.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="brand login-brand">
          <div className="logo">DF</div>
          <div>
            <strong>Doceria Floripa</strong>
            <span>Admin de encomendas</span>
          </div>
        </div>

        <div className="login-copy">
          <p className="eyebrow">Acesso restrito</p>
          <h1>Entre para acessar o sistema</h1>
          <p>
            Dashboard, produtos, pedidos, opções e loja ficam protegidos por
            e-mail e senha.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>E-mail</label>
            <input
              required
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <div className="password-field">
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ghost"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <button
            className="primary login-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </div>
  );
}

function UserBar({ user }) {
  const email = user?.email || "Usuário logado";

  async function handleLogout() {
    await signOutAdmin();
  }

  return (
    <div className="user-bar">
      <div>
        <small>Logado como</small>
        <strong>{email}</strong>
      </div>
      <button className="ghost" onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [toast, setToast] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const [productsData, ordersData, optionsData] = await Promise.all([
        listProducts(),
        listOrders(),
        listOptions(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setOptions(optionsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let unsubscribeAuth = null;
    let mounted = true;

    async function loadSession() {
      const currentSession = await getCurrentSession();

      if (mounted) {
        setSession(currentSession);
        setAuthLoading(false);
      }
    }

    unsubscribeAuth = onAuthStateChange((newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    });

    loadSession();

    return () => {
      mounted = false;
      unsubscribeAuth?.();
    };
  }, []);

  useEffect(() => {
    if (session) {
      refresh();
    } else {
      setProducts([]);
      setOrders([]);
      setOptions([]);
      setLoading(false);
    }
  }, [session]);

  async function withToast(message, action) {
    await action();
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  const stats = useMemo(() => {
    const paid = orders
      .filter((o) => normalizePaymentStatus(o.payment_status) === "Pago 100%")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    const deposits = orders
      .filter((o) => normalizePaymentStatus(o.payment_status) === "Pago 50%")
      .reduce((sum, o) => sum + Number(o.total || 0) * 0.5, 0);
    const pending = orders
      .filter((o) => normalizePaymentStatus(o.payment_status) === "Não pago")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    const projected = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    return { paid, deposits, pending, projected };
  }, [orders]);

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="card">Verificando acesso...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">DF</div>
          <div>
            <strong>Doceria Floripa</strong>
            <span>Admin de encomendas</span>
          </div>
        </div>

        <nav>
          <NavButton
            current={page}
            id="dashboard"
            label="Dashboard"
            icon="📊"
            setPage={setPage}
          />
          <NavButton
            current={page}
            id="orders"
            label="Pedidos"
            icon="🧾"
            setPage={setPage}
          />
          <NavButton
            current={page}
            id="products"
            label="Produtos"
            icon="🍰"
            setPage={setPage}
          />
          <NavButton
            current={page}
            id="options"
            label="Massas e recheios"
            icon="⚙️"
            setPage={setPage}
          />
          <NavButton
            current={page}
            id="store"
            label="Loja do cliente"
            icon="🛍️"
            setPage={setPage}
          />
        </nav>

        <div className="backend-card">
          <b>{hasSupabase ? "Supabase conectado" : "Modo demonstração"}</b>
          <p>
            {hasSupabase
              ? "Dados salvos no banco."
              : "Dados salvos no navegador. Configure o .env para usar banco real."}
          </p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Doceria Floripa</p>
            <h1>{titles[page]}</h1>
            <p>
              Produtos, pedidos, pagamentos, envios e faturamento em um painel
              simples.
            </p>
          </div>

          <div className="topbar-actions">
            <UserBar user={session.user} />
            <button
              className="primary"
              onClick={() => setPage(page === "store" ? "dashboard" : "store")}
            >
              {page === "store" ? "Voltar ao admin" : "Ver loja"}
            </button>
          </div>
        </header>

        {toast && <div className="toast">✅ {toast}</div>}
        {loading ? <div className="card">Carregando...</div> : null}

        {!loading && (
          <>
            <div
              className={
                page === "dashboard" ? "page-panel is-active" : "page-panel"
              }
            >
              <Dashboard products={products} orders={orders} stats={stats} />
            </div>

            <div
              className={
                page === "orders" ? "page-panel is-active" : "page-panel"
              }
            >
              <Orders
                orders={orders}
                products={products}
                setOrders={setOrders}
                withToast={withToast}
              />
            </div>

            <div
              className={
                page === "products" ? "page-panel is-active" : "page-panel"
              }
            >
              <Products
                products={products}
                setProducts={setProducts}
                options={options}
                withToast={withToast}
              />
            </div>

            <div
              className={
                page === "options" ? "page-panel is-active" : "page-panel"
              }
            >
              <Options
                options={options}
                setOptions={setOptions}
                withToast={withToast}
              />
            </div>

            <div
              className={
                page === "store" ? "page-panel is-active" : "page-panel"
              }
            >
              <Store
                products={products}
                withToast={withToast}
                setOrders={setOrders}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const titles = {
  dashboard: "Resumo da operação",
  orders: "Gestão de pedidos",
  products: "Cadastro de produtos",
  options: "Massas, recheios, cascas e ingredientes",
  store: "Loja do cliente",
};

function NavButton({ current, id, label, icon, setPage }) {
  return (
    <button
      type="button"
      className={current === id ? "active" : ""}
      onClick={() => setPage(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Dashboard({ products, orders, stats }) {
  const pendingPayments = orders.filter(
    (o) => normalizePaymentStatus(o.payment_status) !== "Pago 100%",
  ).length;
  const pendingShipping = orders.filter(
    (o) => o.shipping_status === "Pendente",
  ).length;
  const activeProducts = products.filter((p) => p.active).length;

  return (
    <div className="grid-gap">
      <div className="metrics">
        <Metric
          label="Faturamento projetado"
          value={money(stats.projected)}
          hint="Todos os pedidos"
          icon="💰"
        />
        <Metric
          label="Recebido"
          value={money(stats.paid + stats.deposits)}
          hint="Pagos 100% + pagos 50%"
          icon="✅"
        />
        <Metric
          label="A receber"
          value={money(stats.pending)}
          hint={`${pendingPayments} pendência(s)`}
          icon="⚠️"
        />
        <Metric
          label="Produtos ativos"
          value={activeProducts}
          hint={`${products.length} cadastrados`}
          icon="🍰"
        />
      </div>

      <div className="two-cols">
        <section className="card">
          <h2>Prioridades de hoje</h2>
          <div className="priority-grid">
            <div>
              <b>Produção</b>
              <strong>
                {orders.filter((o) => o.order_status === "Em produção").length}
              </strong>
              <span>pedidos em andamento</span>
            </div>
            <div>
              <b>Cobrar</b>
              <strong>{pendingPayments}</strong>
              <span>clientes sem pagamento total</span>
            </div>
            <div>
              <b>Envio</b>
              <strong>{pendingShipping}</strong>
              <span>entregas pendentes</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, hint, icon }) {
  return (
    <div className="metric">
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function Orders({ orders, products, setOrders, withToast }) {
  const [query, setQuery] = useLocalState("orders-query", "");
  const [payment, setPayment] = useLocalState("orders-payment-filter", "Todos");
  const [shipping, setShipping] = useLocalState(
    "orders-shipping-filter",
    "Todos",
  );
  const [source, setSource] = useLocalState("orders-source-filter", "Todos");
  const [draft, setDraft] = useLocalState("orders-draft", blankOrder);
  const [editingOrderId, setEditingOrderId] = useLocalState(
    "orders-editing-id",
    null,
  );

  const filtered = orders.filter((o) => {
    const q = query.toLowerCase();
    return (
      (!q ||
        `${o.code} ${o.client_name} ${o.product_name} ${o.client_phone}`
          .toLowerCase()
          .includes(q)) &&
      (payment === "Todos" ||
        normalizePaymentStatus(o.payment_status) === payment) &&
      (shipping === "Todos" || o.shipping_status === shipping) &&
      (source === "Todos" || o.contact_source === source)
    );
  });

  async function addOrder(e) {
    e.preventDefault();

    const payload = {
      ...draft,
      total: Number(draft.total),
      quantity: Number(draft.quantity),
    };

    await withToast(
      editingOrderId ? "Pedido atualizado" : "Pedido salvo",
      async () => {
        const updated = editingOrderId
          ? await updateOrderStatus(editingOrderId, payload)
          : await saveOrder(payload);

        setOrders(updated);
        setDraft(blankOrder);
        setEditingOrderId(null);
      },
    );
  }

  async function patch(id, field, value) {
    const updated = await updateOrderStatus(id, { [field]: value });
    setOrders(updated);
  }

  function editOrder(order) {
    setEditingOrderId(order.id);

    setDraft({
      client_name: order.client_name || "",
      client_phone: order.client_phone || "",
      contact_source: order.contact_source || "WhatsApp",
      product_name: order.product_name || "",
      quantity: order.quantity || 1,
      total: order.total || "",
      payment_status: normalizePaymentStatus(order.payment_status),
      shipping_status: order.shipping_status || "Pendente",
      order_status: order.order_status || "Aguardando pagamento",
      due_date: order.due_date || "",
      notes: order.notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeOrder(id) {
    if (!confirm("Excluir este pedido? Essa ação também apaga do Supabase.")) {
      return;
    }

    await withToast("Pedido excluído", async () => {
      const updated = await deleteOrder(id);
      setOrders(updated);
    });
  }

  return (
    <div className="grid-gap">
      <section className="card">
        <div className="section-head">
          <div>
            <h2>{editingOrderId ? "Editar pedido" : "Novo pedido"}</h2>
            <p>
              {editingOrderId
                ? "Atualize os dados completos do pedido selecionado."
                : "Registre pedidos vindos do Instagram ou WhatsApp."}
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={addOrder}>
          <div className="field">
            <label>Nome do cliente</label>
            <input
              required
              placeholder="Ex: Mariana Souza"
              value={draft.client_name}
              onChange={(e) =>
                setDraft({ ...draft, client_name: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Telefone / WhatsApp</label>
            <input
              placeholder="Ex: (48) 99999-9999"
              value={draft.client_phone}
              onChange={(e) =>
                setDraft({ ...draft, client_phone: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Origem do contato</label>
            <select
              value={draft.contact_source}
              onChange={(e) =>
                setDraft({ ...draft, contact_source: e.target.value })
              }
            >
              <option>WhatsApp</option>
              <option>Instagram</option>
            </select>
          </div>

          <div className="field">
            <label>Produto escolhido</label>
            <select
              value={draft.product_name}
              onChange={(e) =>
                setDraft({ ...draft, product_name: e.target.value })
              }
            >
              <option value="">Selecione um produto</option>
              {products.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Quantidade</label>
            <input
              type="number"
              min="1"
              placeholder="Ex: 2"
              value={draft.quantity}
              onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Valor total</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 85.00"
              value={draft.total}
              onChange={(e) => setDraft({ ...draft, total: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Situação do pagamento</label>
            <select
              value={draft.payment_status}
              onChange={(e) =>
                setDraft({ ...draft, payment_status: e.target.value })
              }
            >
              <option>Pago 100%</option>
              <option>Pago 50%</option>
              <option>Não pago</option>
            </select>
          </div>

          <div className="field">
            <label>Status de envio</label>
            <select
              value={draft.shipping_status}
              onChange={(e) =>
                setDraft({ ...draft, shipping_status: e.target.value })
              }
            >
              <option>Enviado</option>
              <option>Pendente</option>
              <option>Retirada</option>
            </select>
          </div>

          <div className="field">
            <label>Data / horário de entrega</label>
            <input
              placeholder="Ex: Sexta, 15h"
              value={draft.due_date}
              onChange={(e) => setDraft({ ...draft, due_date: e.target.value })}
            />
          </div>

          <div className="field span-2">
            <label>Observações do pedido</label>
            <input
              placeholder="Recheios, massas, ingredientes, detalhes da entrega..."
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>

          <button className="primary" type="submit">
            {editingOrderId ? "Salvar alterações" : "Salvar pedido"}
          </button>

          {editingOrderId && (
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setEditingOrderId(null);
                setDraft(blankOrder);
              }}
            >
              Cancelar edição
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <div className="filters">
          <input
            placeholder="Buscar pedido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="field">
            <label>Situação do pagamento</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option>Todos</option>
              <option>Pago 100%</option>
              <option>Pago 50%</option>
              <option>Não pago</option>
            </select>
          </div>

          <div className="field">
            <label>Status de envio</label>
            <select
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            >
              <option>Todos</option>
              <option>Enviado</option>
              <option>Pendente</option>
              <option>Retirada</option>
            </select>
          </div>

          <div className="field">
            <label>Origem do contato</label>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option>Todos</option>
              <option>Instagram</option>
              <option>WhatsApp</option>
            </select>
          </div>
        </div>

        <div className="table-list">
          {filtered.map((order) => (
            <article className="order-row" key={order.id}>
              <div>
                <b>{order.code}</b>
                <strong>{order.client_name}</strong>
                <span>
                  {order.client_phone} • {order.contact_source}
                </span>
              </div>

              <div>
                <strong>{order.product_name}</strong>
                <span>
                  Qtd {order.quantity} • {order.due_date}
                </span>
                <small>{order.notes}</small>
              </div>

              <div className="stack">
                <select
                  value={normalizePaymentStatus(order.payment_status)}
                  onChange={(e) =>
                    patch(order.id, "payment_status", e.target.value)
                  }
                >
                  <option>Pago 100%</option>
                  <option>Pago 50%</option>
                  <option>Não pago</option>
                </select>

                <select
                  value={order.shipping_status}
                  onChange={(e) =>
                    patch(order.id, "shipping_status", e.target.value)
                  }
                >
                  <option>Enviado</option>
                  <option>Pendente</option>
                  <option>Retirada</option>
                </select>
              </div>

              <div className="total">
                <strong>{money(order.total)}</strong>

                <select
                  value={order.order_status}
                  onChange={(e) =>
                    patch(order.id, "order_status", e.target.value)
                  }
                >
                  <option>Aguardando pagamento</option>
                  <option>Confirmado</option>
                  <option>Em produção</option>
                  <option>Finalizado</option>
                </select>

                <button
                  type="button"
                  className="edit-button"
                  onClick={() => editOrder(order)}
                >
                  Editar pedido
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => removeOrder(order.id)}
                >
                  Excluir pedido
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const productIcons = [
  "🥤",
  "🍰",
  "🍫",
  "🎁",
  "🧁",
  "🥚",
  "🍬",
  "🍓",
  "🍪",
  "🍮",
];

function ProductVisual({ product }) {
  if (product.image_url) {
    return (
      <img
        className="product-image"
        src={product.image_url}
        alt={product.name}
      />
    );
  }

  return (
    <div className="emoji">
      {product.icon || categoryEmoji(product.category)}
    </div>
  );
}

function readImageAsDataUrl(file, callback) {
  const reader = new FileReader();

  reader.onload = () => {
    callback(reader.result);
  };

  reader.readAsDataURL(file);
}

function Products({ products, setProducts, options, withToast }) {
  const [category, setCategory] = useLocalState(
    "products-category-filter",
    "Todos",
  );
  const [draft, setDraft] = useLocalState("products-draft", blankProduct);
  const [editingId, setEditingId] = useLocalState("products-editing-id", null);

  const filtered = products.filter(
    (p) => category === "Todos" || p.category === category,
  );

  function toggleOption(type, name) {
    const selected = draft.options[type] || [];
    const next = selected.includes(name)
      ? selected.filter((item) => item !== name)
      : [...selected, name];

    setDraft({
      ...draft,
      options: {
        ...draft.options,
        [type]: next,
      },
    });
  }

  function edit(product) {
    setEditingId(product.id);
    setDraft(product);
    scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e) {
    e.preventDefault();

    await withToast(
      editingId ? "Produto atualizado" : "Produto criado",
      async () => {
        const updated = await saveProduct({
          ...draft,
          id: editingId,
          price: Number(draft.price),
        });

        setProducts(updated);
        setDraft(blankProduct);
        setEditingId(null);
      },
    );
  }

  async function remove(id) {
    if (!confirm("Remover este produto?")) return;

    const updated = await deleteProduct(id);
    setProducts(updated);
  }

  return (
    <div className="grid-gap">
      <section className="card">
        <h2>{editingId ? "Editar produto" : "Adicionar produto"}</h2>

        <form className="form-grid" onSubmit={submit}>
          <input
            required
            placeholder="Nome"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />

          <select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <input
            required
            type="number"
            step="0.01"
            placeholder="Preço base"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          />

          <select
            value={draft.prep_time}
            onChange={(e) => setDraft({ ...draft, prep_time: e.target.value })}
          >
            <option>24h</option>
            <option>48h</option>
            <option>72h</option>
            <option>Sob consulta</option>
          </select>

          <textarea
            className="span-2"
            placeholder="Descrição"
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />

          <div className="span-2 product-media-box">
            <div>
              <b>Foto ou ícone do produto</b>
              <p>
                Escolha uma foto do produto ou selecione um ícone para aparecer
                no card.
              </p>
            </div>

            <div className="media-preview">
              {draft.image_url ? (
                <img src={draft.image_url} alt="Preview do produto" />
              ) : (
                <span>{draft.icon || categoryEmoji(draft.category)}</span>
              )}
            </div>

            <div className="icon-picker">
              {productIcons.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  className={
                    draft.icon === icon && !draft.image_url
                      ? "chip selected"
                      : "chip"
                  }
                  onClick={() => setDraft({ ...draft, icon, image_url: "" })}
                >
                  {icon}
                </button>
              ))}
            </div>

            <label className="file-button">
              Escolher foto
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  readImageAsDataUrl(file, (imageUrl) => {
                    setDraft({ ...draft, image_url: imageUrl });
                  });
                }}
              />
            </label>

            {draft.image_url && (
              <button
                type="button"
                className="ghost"
                onClick={() => setDraft({ ...draft, image_url: "" })}
              >
                Remover foto
              </button>
            )}
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            />
            Produto ativo na loja
          </label>

          <div className="option-picker span-2">
            {Object.entries(optionTypes).map(([type, label]) => (
              <div key={type}>
                <b>{label}</b>

                <div>
                  {options
                    .filter((o) => o.type === type)
                    .map((o) => (
                      <button
                        type="button"
                        className={
                          draft.options[type]?.includes(o.name)
                            ? "chip selected"
                            : "chip"
                        }
                        key={o.id}
                        onClick={() => toggleOption(type, o.name)}
                      >
                        {o.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <button className="primary" type="submit">
            {editingId ? "Salvar alterações" : "Criar produto"}
          </button>

          {editingId && (
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setEditingId(null);
                setDraft(blankProduct);
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>Produtos cadastrados</h2>
            <p>Visualize, edite ou exclua produtos do cardápio.</p>
          </div>

          <div className="filters">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Todos</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="product-grid">
          {filtered.map((p) => (
            <article className="product-card" key={p.id}>
              <ProductVisual product={p} />

              <div>
                <b>{p.name}</b>
                <span>{p.category}</span>
              </div>

              <strong>{money(p.price)}</strong>

              <small>
                {p.active ? "Ativo" : "Oculto"} • {p.prep_time}
              </small>

              <p>{p.description}</p>

              <div className="actions">
                <button onClick={() => edit(p)}>Editar</button>
                <button onClick={() => remove(p.id)}>Excluir</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Options({ options, setOptions, withToast }) {
  const [type, setType] = useState("fillings");
  const [name, setName] = useState("");

  async function submit(e) {
    e.preventDefault();
    await withToast("Opção adicionada", async () => {
      const updated = await saveOption({ type, name });
      setOptions(updated);
      setName("");
    });
  }

  return (
    <section className="card">
      <h2>Cadastro de opções de montagem</h2>
      <p>
        Recheios, massas, cascas e ingredientes podem ser usados em qualquer
        produto.
      </p>

      <form className="inline-form" onSubmit={submit}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {Object.entries(optionTypes).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <input
          required
          placeholder="Nova opção"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="primary">Adicionar</button>
      </form>

      <div className="option-columns">
        {Object.entries(optionTypes).map(([k, label]) => (
          <div key={k}>
            <h3>{label}</h3>
            {options
              .filter((o) => o.type === k)
              .map((o) => (
                <span className="pill" key={o.id}>
                  {o.name}
                </span>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Store({ products, withToast, setOrders }) {
  const active = products.filter((p) => p.active);
  const [cart, setCart] = useLocalState("store-cart", []);
  const [client, setClient] = useLocalState("store-client", {
    name: "",
    phone: "",
    source: "WhatsApp",
    delivery: "Retirada",
    notes: "",
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function add(p) {
    setCart((current) => {
      const exists = current.find((item) => item.id === p.id);

      if (exists) {
        return current.map((item) =>
          item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { ...p, quantity: 1 }];
    });
  }

  async function submit(e) {
    e.preventDefault();
    await withToast("Pedido enviado para o admin", async () => {
      const updated = await saveOrder({
        ...blankOrder,
        client_name: client.name,
        client_phone: client.phone,
        contact_source: client.source,
        product_name: cart.map((i) => `${i.quantity}x ${i.name}`).join(", "),
        quantity: cart.reduce((s, i) => s + i.quantity, 0),
        total,
        payment_status: "Não pago",
        shipping_status: client.delivery,
        notes: client.notes,
      });
      setOrders(updated);
      setCart([]);
      setClient({
        name: "",
        phone: "",
        source: "WhatsApp",
        delivery: "Retirada",
        notes: "",
      });
    });
  }

  return (
    <div className="two-cols wide-left">
      <section className="card">
        <h2>Cardápio online</h2>

        <div className="product-grid store-grid">
          {active.map((p) => (
            <article className="product-card" key={p.id}>
              <ProductVisual product={p} />
              <b>{p.name}</b>
              <span>{p.category}</span>
              <p>{p.description}</p>
              <strong>{money(p.price)}</strong>
              <button onClick={() => add(p)} className="primary">
                Adicionar
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Carrinho</h2>

        {cart.map((item) => (
          <div className="cart-line" key={item.id}>
            <span>
              {item.quantity}x {item.name}
            </span>
            <b>{money(item.price * item.quantity)}</b>
          </div>
        ))}

        <h3>Total: {money(total)}</h3>

        <form className="form-grid one" onSubmit={submit}>
          <input
            required
            placeholder="Nome"
            value={client.name}
            onChange={(e) => setClient({ ...client, name: e.target.value })}
          />

          <input
            required
            placeholder="WhatsApp"
            value={client.phone}
            onChange={(e) => setClient({ ...client, phone: e.target.value })}
          />

          <select
            value={client.source}
            onChange={(e) => setClient({ ...client, source: e.target.value })}
          >
            <option>WhatsApp</option>
            <option>Instagram</option>
          </select>

          <select
            value={client.delivery}
            onChange={(e) => setClient({ ...client, delivery: e.target.value })}
          >
            <option>Retirada</option>
            <option>Pendente</option>
          </select>

          <textarea
            placeholder="Observações"
            value={client.notes}
            onChange={(e) => setClient({ ...client, notes: e.target.value })}
          />

          <button disabled={!cart.length} className="primary">
            Finalizar pedido
          </button>
        </form>
      </section>
    </div>
  );
}

function categoryEmoji(category = "") {
  if (category.includes("Copo")) return "🥤";
  if (category.includes("Bolo")) return "🍰";
  if (category.includes("Brownie")) return "🍫";
  if (category.includes("Cesta")) return "🎁";
  if (category.includes("Docinho")) return "🧁";
  if (category.includes("Páscoa")) return "🥚";
  return "🍬";
}

export default App;