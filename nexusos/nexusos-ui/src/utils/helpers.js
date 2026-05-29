const COLORS = ['#9f7afa','#4a7ff7','#3ecf8e','#c9a84c','#f76a6a','#e8c97a'];

export const colorFor = (str) => {
  let h = 0;
  for (const c of str) h = (h << 5) - h + c.charCodeAt(0) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
};

export const initials = (name) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })+ ' ' + new Date(ts).toLocaleTimeString();

export const fmtMoney = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const seedTenant = (tenant) => {
  const names = ['Alice Johnson','Bob Martinez','Carol Chen','David Kim','Eva Novak'];
  const products = [
    { id: uid(), name: 'Analytics Pro',    category: 'Software',       price: 49.99,  stock: 999, status: 'active' },
    { id: uid(), name: 'Storage Plus',     category: 'Infrastructure', price: 19.99,  stock: 999, status: 'active' },
    { id: uid(), name: 'Team Seats',       category: 'License',        price: 12.99,  stock: 500, status: 'active' },
    { id: uid(), name: 'API Access',       category: 'Developer',      price: 79.99,  stock: 999, status: 'active' },
    { id: uid(), name: 'Enterprise Suite', category: 'Software',       price: 299.99, stock: 50,  status: 'active' },
  ];
  const users = names.map((n, i) => ({
    id: uid(),
    name: n,
    email: n.toLowerCase().replace(' ', '.') + `@${tenant.company.toLowerCase().replace(/\s/g, '')}.com`,
    role: i === 0 ? 'admin' : 'member',
    status: ['active','active','active','pending','inactive'][i],
    joinedAt: Date.now() - i * 864e5 * 10,
  }));
  const statuses = ['pending','completed','shipped','completed','pending'];
  const orders = products.slice(0, 5).map((p, i) => ({
    id: 'ORD-' + String(1000 + i),
    productId: p.id,
    productName: p.name,
    userId: users[i % users.length].id,
    userName: users[i % users.length].name,
    amount: p.price * (i + 1),
    status: statuses[i],
    createdAt: Date.now() - i * 864e5 * 3,
    qty: i + 1,
  }));
  return { ...tenant, users, products, orders };
};
