import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, createUser, updateUser, deleteUser } from '../store/adminSlice';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import EmptyState from '../../../components/ui/EmptyState';
import AdminLayout from './AdminLayout';

const ITEMS_PER_PAGE = 10;

const NavIcon = ({ name, className }) => {
  const icons = {
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
  </div>
);

const UserManagement = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { users, usersLoading } = useSelector((state) => state.admin);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'patient',
  });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await dispatch(updateUser({ id: editingUser.id, data: formData })).unwrap();
        toast.success('User updated successfully!');
      } else {
        await dispatch(createUser(formData)).unwrap();
        toast.success('User created successfully!');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', first_name: '', last_name: '', phone: '', role: 'patient' });
      dispatch(fetchAllUsers());
    } catch (error) {
      toast.error(error?.message || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.role || 'patient',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteUser(deleteId)).unwrap();
      toast.success('User deleted successfully!');
      dispatch(fetchAllUsers());
    } catch (error) {
      toast.error(error?.message || 'Failed to delete user');
    }
    setDeleteId(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'bg-red-100 text-red-800',
      doctor: 'bg-green-100 text-green-800',
      receptionist: 'bg-blue-100 text-blue-800',
      patient: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${variants[role] || 'bg-gray-100 text-gray-800'}`}>{role}</span>;
  };

  return (
    <AdminLayout title="User Management" subtitle="Manage all registered users">
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <NavIcon name="plus" className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users by name, email or username..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="patient">Patient</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {usersLoading ? (
            <LoadingSpinner />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon="users"
              title={searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'No users found' : 'No users yet'}
              description={searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Start by adding your first user'}
              actionLabel={!searchTerm && roleFilter === 'all' && statusFilter === 'all' ? 'Add User' : undefined}
              onAction={() => setShowModal(true)}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedUsers.map((user) => (
                <div key={user.id} className="p-4 sm:px-6 sm:py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold text-sm sm:text-base">
                        {(user.first_name || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <NavIcon name="edit" className="w-5 h-5" />
                      </button>
                      <button onClick={() => setDeleteId(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <NavIcon name="trash" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-1 text-gray-900 truncate block">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-1 text-gray-900">{user.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 rounded-lg border text-sm font-medium ${currentPage === page ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingUser && '(leave blank to keep current)'}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" required={!editingUser} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">{editingUser ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </AdminLayout>
  );
};

export default UserManagement;
