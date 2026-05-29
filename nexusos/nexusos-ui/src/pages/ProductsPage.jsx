import React, { useState } from 'react';
import { colorFor, fmtMoney } from '../utils/helpers';
import { useApi, useMutation } from '../hooks/useApi';
import { useApiConfig } from '../context/ApiConfigContext';
import {
  apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct,
} from '../services/apiService';
import {
  Button, StatusBadge, Tag, Modal, FormRow, FormRow2,
  SearchBar, EmptyState, LoadingSpinner, ErrorBanner,
} from '../components/UI';
import styles from './TablePage.module.css';

export default function ProductsPage({ showToast }) {
  const { apiUrl } = useApiConfig();
  const { data: products = [], loading, error, refetch, setData } = useApi(apiGetProducts, [apiUrl]);

  const { mutate: createProduct, loading: creating } = useMutation(apiCreateProduct);
  const { mutate: updateProduct, loading: updating } = useMutation(apiUpdateProduct);
  const { mutate: deleteProduct, loading: deleting } = useMutation(apiDeleteProduct);

  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = products?.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm({ name: '', category: '', price: '', stock: '', status: 'active' }); setModal('add'); };
  const openEdit = (p) => { setForm({ ...p }); setModal('edit'); };

  const save = async () => {
    if (!form.name) return;
    const payload = { ...form, price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0 };
    try {
      if (modal === 'edit') {
        const updated = await updateProduct(form.id, payload);
        setData(d => d.map(p => p.id === form.id ? updated : p));
        showToast('Product updated');
      } else {
        const created = await createProduct(payload);
        setData(d => [...d, created]);
        showToast('Product added');
      }
      setModal(null);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const del = async (id) => {
    try {
      await deleteProduct(id);
      setData(d => d.filter(p => p.id !== id));
      showToast('Product removed');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const isBusy = creating || updating || deleting;

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={refetch} />}
      <SearchBar
        value={search} onChange={setSearch}
        placeholder="Search products..."
        hint={filtered?.length + ' of ' + products?.length + ' products'}
        actions={<Button variant="primary" onClick={openAdd}><i className="ti ti-plus" /> Add Product</Button>}
      />
      {loading ? <LoadingSpinner message="Loading products..." /> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length ? filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.cellFlex}>
                      <div className={styles.avatar} style={{ background: colorFor(p.id) + '22', color: colorFor(p.id) }}>
                        <i className="ti ti-package" style={{ fontSize: 16 }} />
                      </div>
                      <div className={styles.cellMain}>{p.name}</div>
                    </div>
                  </td>
                  <td><Tag>{p.category}</Tag></td>
                  <td><span className={styles.amount}>{fmtMoney(p.price)}</span></td>
                  <td className={styles.muted}>{(p.stock || 0).toLocaleString()}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="icon"   onClick={() => openEdit(p)}><i className="ti ti-edit" /></Button>
                      <Button variant="danger" onClick={() => del(p.id)}><i className="ti ti-trash" /></Button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={6}><EmptyState icon="ti-package-off" message="No products found" /></td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)}
          actions={<>
            <Button variant="cancel" onClick={() => setModal(null)} disabled={isBusy}>Cancel</Button>
            <Button variant="save"   onClick={save} disabled={isBusy}>{isBusy ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}</Button>
          </>}>
          <FormRow label="Product Name"><input value={form.name || ''} onChange={e => setF('name', e.target.value)} placeholder="Premium Plan" /></FormRow>
          <FormRow label="Category"><input value={form.category || ''} onChange={e => setF('category', e.target.value)} placeholder="Software" /></FormRow>
          <FormRow2>
            <div><label style={{display:'block',fontSize:12,color:'var(--text2)',marginBottom:6,fontWeight:500,textTransform:'uppercase',letterSpacing:'.6px'}}>Price ($)</label>
              <input type="number" value={form.price || ''} onChange={e => setF('price', e.target.value)} placeholder="29.99" step="0.01" /></div>
            <div><label style={{display:'block',fontSize:12,color:'var(--text2)',marginBottom:6,fontWeight:500,textTransform:'uppercase',letterSpacing:'.6px'}}>Stock</label>
              <input type="number" value={form.stock || ''} onChange={e => setF('stock', e.target.value)} placeholder="100" /></div>
          </FormRow2>
          <FormRow label="Status">
            <select value={form.status || 'active'} onChange={e => setF('status', e.target.value)}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </FormRow>
        </Modal>
      )}
    </>
  );
}
