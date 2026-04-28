import { useState, useEffect } from 'react';
import UserForm from '../components/users/UserForm';
import UserTable from '../components/users/UserTable';
import Loader from '../components/Loader';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(undefined);
  
  useEffect(() => {
    const fetchUsers = () => {
      setTimeout(() => {
        setUsers([]);
        setIsLoading(false);
      }, 1000);
    };
    fetchUsers();
  }, []);
  
  const handleAddUser = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };
  
  const handleUserSubmit = (user) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      setUsers([...users, user]);
    }
    setShowForm(false);
    setEditingUser(undefined);
  };
  
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };
  
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };
  
  const handleResetPassword = (user) => {
    alert(`Password reset for user: ${user.name} (${user.email})`);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage system users and their access roles</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {showForm && (
          <div className="xl:col-span-1">
            <UserForm 
              onSuccess={handleUserSubmit} 
              editUser={editingUser} 
            />
          </div>
        )}
        
        <div className={showForm ? 'xl:col-span-3' : 'xl:col-span-4'}>
          <div className="card overflow-hidden">
            <UserTable 
              users={users}
              onDelete={handleDeleteUser}
              onEdit={handleEditUser}
              onResetPassword={handleResetPassword}
              onAddUser={handleAddUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;