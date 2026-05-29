import React, { useState } from 'react';
import { colorFor, initials, fmtDate } from '../utils/helpers';
import { useApi, useMutation } from '../hooks/useApi';
import { useApiConfig } from '../context/ApiConfigContext';
import {
  apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser,
} from '../services/apiService';
import {
  Button, StatusBadge, Tag, Modal, FormRow,
  SearchBar, EmptyState, LoadingSpinner, ErrorBanner,
} from '../components/UI';
import styles from './TablePage.module.css';

export default function UsersPage({ showToast }) {
  const { apiUrl } = useApiConfig();
  const { data: users = [], loading, error, refetch, setData } = useApi(apiGetUsers, [apiUrl]);

  const { mutate: createUser, loading: creating } = useMutation(apiCreateUser);
  const { mutate: updateUser, loading: updating } = useMutation(apiUpdateUser);
  const { mutate: deleteUser, loading: deleting } = useMutation(apiDeleteUser);

  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState({});
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = users?.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm({ name: '', email: '', role: 'member', status: 'active' }); setModal('add'); };
  const openEdit = (u) => { setForm({ ...u }); setModal('edit'); };

  const save = async () => {
    if (!form.name || !form.email) return;
    try {
      if (modal === 'edit') {
        const updated = await updateUser(form.id, form);
        setData(d => d.map(u => u.id === form.id ? updated : u));
        showToast('User updated');
      } else {
        const created = await createUser(form);
        setData(d => [...d, created]);
        showToast('User added');
      }
      setModal(null);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const del = async (id) => {
    const u = users.find(u => u.id === id);
    if (u?.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
      showToast('Cannot delete the last admin'); return;
    }
    try {
      await deleteUser(id);
      setData(d => d.filter(u => u.id !== id));
      showToast('User removed');
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
        placeholder="Search users..."
        hint={filtered?.length + ' of ' + users?.length + ' users'}
        actions={<Button variant="primary" onClick={openAdd}><i className="ti ti-plus" /> Add User</Button>}
      />
      {loading ? <LoadingSpinner message="Loading users..." /> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length ? filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.cellFlex}>
                      <div className={styles.avatar} style={{ background: colorFor(u.id) + '22', color: colorFor(u.id) }}>{initials(u.name || '?')}</div>
                      <div><div className={styles.cellMain}>{u.name}</div><div className={styles.cellSub}>{u.email}</div></div>
                    </div>
                  </td>
                  <td><Tag>{u.role}</Tag></td>
                  <td><StatusBadge status={u.status} /></td>
                  <td className={styles.muted}>{u.joinedAt ? fmtDate(u.joinedAt) : '-'}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button variant="icon"   onClick={() => openEdit(u)}><i className="ti ti-edit" /></Button>
                      <Button variant="danger" onClick={() => del(u.id)}><i className="ti ti-trash" /></Button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={5}><EmptyState icon="ti-users-off" message="No users found" /></td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal === 'add' ? 'Add User' : 'Edit User'} onClose={() => setModal(null)}
          actions={<>
            <Button variant="cancel" onClick={() => setModal(null)} disabled={isBusy}>Cancel</Button>
            <Button variant="save"   onClick={save} disabled={isBusy}>{isBusy ? 'Saving...' : modal === 'add' ? 'Add User' : 'Save Changes'}</Button>
          </>}>
          <FormRow label="Full Name"><input value={form.name || ''} onChange={e => setF('name', e.target.value)} placeholder="John Doe" /></FormRow>
          <FormRow label="Email"><input type="email" value={form.email || ''} onChange={e => setF('email', e.target.value)} placeholder="john@company.com" /></FormRow>
          <FormRow label="Role">
            <select value={form.role || 'member'} onChange={e => setF('role', e.target.value)}>
              <option value="member">Member</option><option value="admin">Admin</option>
            </select>
          </FormRow>
          <FormRow label="Status">
            <select value={form.status || 'active'} onChange={e => setF('status', e.target.value)}>
              <option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option>
            </select>
          </FormRow>
        </Modal>
      )}
    </>
  );
}
