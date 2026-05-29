import React, { useState } from 'react';
import { colorFor, initials, fmtDate, fmtMoney } from '../utils/helpers';
import { useApi, useMutation } from '../hooks/useApi';
import { useApiConfig } from '../context/ApiConfigContext';
import {
  apiGetOrders, apiGetUsers, apiGetProducts,
  apiCreateOrder, apiUpdateOrder, apiDeleteOrder,
} from '../services/apiService';
import {
  Button, StatusBadge, Modal, FormRow,
  SearchBar, EmptyState, LoadingSpinner, ErrorBanner,
} from '../components/UI';
import styles from './TablePage.module.css';

export default function OrdersPage({ showToast }) {
  const { apiUrl } = useApiConfig();
  const { data: orders   = [], loading: loadingOrders,   error: orderErr,   refetch: refetchOrders,   setData: setOrders }   = useApi(apiGetOrders,   [apiUrl]);
  const { data: users    = [], loading: loadingUsers }                                                                         = useApi(apiGetUsers,    [apiUrl]);
  const { data: products = [], loading: loadingProducts }                                                                      = useApi(apiGetProducts, [apiUrl]);

  const { mutate: createOrder, loading: creating } = useMutation(apiCreateOrder);
  const { mutate: updateOrder, loading: updating } = useMutation(apiUpdateOrder);
  const { mutate: deleteOrder, loading: deleting } = useMutation(apiDeleteOrder);

  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loading = loadingOrders || loadingUsers || loadingProducts;

  const filtered = orders?.filter(o =>
    o.productName?.toLowerCase().includes(search.toLowerCase()) ||
    o.userName?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => {
    setForm({ productId: products[0]?.id || '', userId: users[0]?.id || '', qty: 1, status: 'pending' });
    setModal('add');
  };
  const openEdit = (o) => { setForm({ ...o }); setModal('edit'); };

  const save = async () => {
    try {
      if (modal === 'edit') {
        const updated = await updateOrder(form.id, { status: form.status });
        setOrders(d => d.map(o => o.id === form.id ? { ...o, ...updated } : o));
        showToast('Order updated');
      } else {
        const created = await createOrder({ productId: form.productId, userId: form.userId, amount: parseInt(form.qty) || 1, status: form.status });
        setOrders(d => [...d, created]);
        showToast('Order created');
      }
      setModal(null);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const del = async (id) => {
    try {
      await deleteOrder(id);
      setOrders(d => d.filter(o => o.id !== id));
      showToast('Order removed');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const isBusy = creating || updating || deleting;

  return (
    <>
      {orderErr && <ErrorBanner message={orderErr} onRetry={refetchOrders} />}
      <SearchBar
        value={search} onChange={setSearch}
        placeholder="Search orders..."
        hint={filtered?.length + ' of ' + orders?.length + ' orders'}
        actions={<Button variant="primary" onClick={openAdd}><i className="ti ti-plus" /> New Order</Button>}
      />
      {loading ? <LoadingSpinner message="Loading orders..." /> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Order ID</th><th>Product</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length ? filtered.map(o => (
                <tr key={o.id}>
                  <td className={styles.mono}>{o.id}</td>
                  <td><div className={styles.cellMain}>{o.productName}</div></td>
                  <td>
                    <div className={styles.cellFlex}>
                      <div className={styles.avatar} style={{ background: colorFor(o.userId || o.id) + '22', color: colorFor(o.userId || o.id) }}>{initials(o.userName || '?')}</div>
                      <div className={styles.cellMain}>{o.userName}</div>
                    </div>
                  </td>
                  <td><span className={styles.amount}>{fmtMoney(o.amount || 0)}</span></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className={styles.muted}>{o.createdAt ? fmtDate(o.createdAt) : '-'}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="icon"   onClick={() => openEdit(o)}><i className="ti ti-edit" /></Button>
                      <Button variant="danger" onClick={() => del(o.id)}><i className="ti ti-trash" /></Button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7}><EmptyState icon="ti-clipboard-x" message="No orders found" /></td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal === 'add' ? 'New Order' : 'Edit Order'} onClose={() => setModal(null)}
          actions={<>
            <Button variant="cancel" onClick={() => setModal(null)} disabled={isBusy}>Cancel</Button>
            <Button variant="save"   onClick={save} disabled={isBusy}>{isBusy ? 'Saving...' : modal === 'add' ? 'Create Order' : 'Save Changes'}</Button>
          </>}>
          {modal === 'add' ? (
            <>
              <FormRow label="Product">
                <select value={form.productId} onChange={e => setF('productId', e.target.value)}>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} — {fmtMoney(p.price)}</option>)}
                </select>
              </FormRow>
              <FormRow label="Customer">
                <select value={form.userId} onChange={e => setF('userId', e.target.value)}>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </FormRow>
              <FormRow label="Quantity"><input type="number" value={form.qty} onChange={e => setF('qty', e.target.value)} min="1" /></FormRow>
            </>
          ) : (
            <FormRow label="Order ID"><input value={form.id} disabled /></FormRow>
          )}
          <FormRow label="Status">
            <select value={form.status} onChange={e => setF('status', e.target.value)}>
              <option value="pending">Pending</option><option value="completed">Completed</option><option value="shipped">Shipped</option>
            </select>
          </FormRow>
        </Modal>
      )}
    </>
  );
}
