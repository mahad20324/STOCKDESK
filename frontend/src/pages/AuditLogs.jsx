import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const ACTION_META = {
  CREATE: { label: 'Create', bg: 'bg-[rgba(74,168,132,0.12)]', text: 'text-[var(--success)]' },
  UPDATE: { label: 'Update', bg: 'bg-[rgba(30,167,189,0.12)]', text: 'text-[var(--accent)]' },
  DELETE: { label: 'Delete', bg: 'bg-[rgba(218,106,90,0.12)]', text: 'text-[var(--danger)]' },
  LOGIN:  { label: 'Login',  bg: 'bg-[rgba(142,124,195,0.12)]', text: 'text-[var(--text-secondary)]' },
  LOGOUT: { label: 'Logout', bg: 'bg-[var(--surface-secondary)]', text: 'text-[var(--text-muted)]' },
};

function ActionChip({ action }) {
  const meta = ACTION_META[action] || { label: action, bg: 'bg-[var(--surface-secondary)]', text: 'text-[var(--text-muted)]' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 animate-pulse rounded-md bg-[var(--surface-secondary)]" />
        </td>
      ))}
    </tr>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
  });

  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
  const entityTypes = ['PRODUCT', 'SALE', 'USER', 'SETTING', 'STOCK_RECONCILIATION', 'PURCHASE', 'EXPENSE'];

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.offset]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/audit/users');
      setUsers(response.data);
    } catch {/* silent */}
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/audit/stats');
      setStats(response.data);
    } catch {/* silent */}
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', pagination.limit);
      params.append('offset', pagination.offset);
      const response = await api.get(`/audit/logs?${params}`);
      setLogs(response.data.data);
      setPagination((prev) => ({ ...prev, total: response.data.total }));
    } catch {/* silent */} finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handleReset = () => {
    setFilters({ userId: '', action: '', entityType: '', startDate: '', endDate: '' });
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const formatDate = (d) =>
    new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  const totalLogs = pagination.total;
  const from = totalLogs === 0 ? 0 : pagination.offset + 1;
  const to = Math.min(pagination.offset + pagination.limit, totalLogs);

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      {stats.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => {
            const meta = ACTION_META[stat.action] || {};
            return (
              <div key={stat.action} className="app-panel rounded-[1.2rem] border p-4">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${meta.text || 'text-[var(--text-muted)]'}`}>
                  {stat.action}
                </p>
                <p className="mt-1.5 text-[1.8rem] font-bold leading-none tracking-tight text-[var(--text-primary)]">
                  {Number(stat.count).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter panel */}
      <section className="app-panel rounded-[1.4rem] border p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">Filters</h3>
            {hasActiveFilters && (
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">Active</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[13px] font-medium text-[var(--text-muted)] transition hover:text-[var(--danger)]"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="app-btn-secondary flex items-center gap-1.5 rounded-[0.95rem] border px-3 py-1.5 text-[13px] font-medium"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M3 6h18M7 12h10M11 18h2" />
              </svg>
              {filtersOpen ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted)]">User</label>
              <select name="userId" value={filters.userId} onChange={handleFilterChange}
                className="app-input w-full rounded-[1rem] border px-3 py-2 text-sm">
                <option value="">All users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted)]">Action</label>
              <select name="action" value={filters.action} onChange={handleFilterChange}
                className="app-input w-full rounded-[1rem] border px-3 py-2 text-sm">
                <option value="">All actions</option>
                {actions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted)]">Entity type</label>
              <select name="entityType" value={filters.entityType} onChange={handleFilterChange}
                className="app-input w-full rounded-[1rem] border px-3 py-2 text-sm">
                <option value="">All types</option>
                {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted)]">From</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange}
                className="app-input w-full rounded-[1rem] border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-muted)]">To</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange}
                className="app-input w-full rounded-[1rem] border px-3 py-2 text-sm" />
            </div>
          </div>
        )}
      </section>

      {/* Logs table */}
      <section className="app-panel overflow-hidden rounded-[1.4rem] border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-secondary)]">
                {['Timestamp', 'User', 'Action', 'Entity', 'ID', 'IP'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] ${i === 0 ? 'text-left' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-[var(--text-primary)]">No audit logs found</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Logs appear after logins, product edits, and sales.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-[var(--surface-secondary)]">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--text-muted)]">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[var(--text-primary)]">{log.user?.name}</span>
                      {log.user?.username && (
                        <span className="ml-1 text-xs text-[var(--text-muted)]">@{log.user.username}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ActionChip action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{log.entityType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{log.entityId || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{log.ipAddress || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-3">
          <p className="text-xs text-[var(--text-muted)]">
            {totalLogs === 0 ? 'No entries' : `Showing ${from}–${to} of ${totalLogs.toLocaleString()}`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={pagination.offset === 0}
              className="app-btn-secondary rounded-[0.9rem] border px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={pagination.offset + pagination.limit >= totalLogs}
              className="app-btn-secondary rounded-[0.9rem] border px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
  });

  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
  const entityTypes = ['PRODUCT', 'SALE', 'USER', 'SETTING', 'STOCK_RECONCILIATION', 'PURCHASE', 'EXPENSE'];

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.offset]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/audit/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/audit/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      params.append('limit', pagination.limit);
      params.append('offset', pagination.offset);

      const response = await api.get(`/audit/logs?${params}`);
      setLogs(response.data.data);
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleReset = () => {
    setFilters({
      userId: '',
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      'CREATE': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'UPDATE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'DELETE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'LOGIN': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'LOGOUT': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => (
                  <div key={stat.action} className="app-panel p-4 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{stat.count}</div>
                    <div className="text-sm text-text-secondary mt-1">{stat.action}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="app-panel p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Filters</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">User</label>
                    <select
                      name="userId"
                      value={filters.userId}
                      onChange={handleFilterChange}
                      className="app-input w-full px-3 py-2 rounded border"
                    >
                      <option value="">All Users</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Action</label>
                    <select
                      name="action"
                      value={filters.action}
                      onChange={handleFilterChange}
                      className="app-input w-full px-3 py-2 rounded border"
                    >
                      <option value="">All Actions</option>
                      {actions.map(action => (
                        <option key={action} value={action}>{action}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Entity Type</label>
                    <select
                      name="entityType"
                      value={filters.entityType}
                      onChange={handleFilterChange}
                      className="app-input w-full px-3 py-2 rounded border"
                    >
                      <option value="">All Types</option>
                      {entityTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="app-input w-full px-3 py-2 rounded border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="app-input w-full px-3 py-2 rounded border"
                    />
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                  Reset Filters
                </button>
              </div>

              {/* Logs Table */}
              <div className="app-panel rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-800 border-b border-border-default">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Timestamp</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">User</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Action</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Entity</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">Entity ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default">
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-text-muted">
                            Loading...
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-text-muted">
                            No audit logs found
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 text-sm text-text-secondary">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-sm text-text-primary">
                              {log.user?.name} <span className="text-text-muted">({log.user?.username})</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-text-primary">{log.entityType}</td>
                            <td className="px-6 py-4 text-sm text-text-secondary">{log.entityId || '-'}</td>
                            <td className="px-6 py-4 text-sm text-text-muted font-mono text-xs">
                              {log.ipAddress || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-border-default">
                  <div className="text-sm text-text-secondary">
                    Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} logs
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                      disabled={pagination.offset === 0}
                      className="px-4 py-2 border border-border-default rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                      disabled={pagination.offset + pagination.limit >= pagination.total}
                      className="px-4 py-2 border border-border-default rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
    </div>
  );
}
