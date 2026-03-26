import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import '../../style/adminUserManagement.css';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        id: null,
        name: '',
        email: '',
        phoneNumber: '',
        role: 'USER',
        password: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, filterRole]);

    const fetchUsers = async () => {
        try {
            const response = await ApiService.getAllUsers();
            if (response.status === 200) {
                setUsers(response.userList || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage('Không thể tải danh sách người dùng');
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phoneNumber?.includes(searchTerm)
            );
        }

        if (filterRole !== 'ALL') {
            filtered = filtered.filter(user => user.role === filterRole);
        }

        setFilteredUsers(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser({
            ...currentUser,
            [name]: value
        });
    };

    const handleEdit = (user) => {
        setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            password: ''
        });
        setMessage('');
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                const response = await ApiService.deleteUser(userId);
                if (response.status === 200) {
                    setMessage('Xóa người dùng thành công');
                    fetchUsers();
                } else {
                    setMessage(response.message || 'Không thể xóa người dùng');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                setMessage(error.response?.data?.message || 'Lỗi khi xóa người dùng');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!currentUser.name?.trim()) {
            setMessage('Tên không được để trống');
            return;
        }
        if (!currentUser.email?.trim()) {
            setMessage('Email không được để trống');
            return;
        }
        if (!currentUser.role?.trim()) {
            setMessage('Vai trò không được để trống');
            return;
        }

        try {
            const updateData = {
                name: currentUser.name.trim(),
                email: currentUser.email.trim(),
                phoneNumber: currentUser.phoneNumber?.trim() || '',
                role: currentUser.role.trim()
            };

            if (currentUser.password?.trim()) {
                if (currentUser.password.length < 6) {
                    setMessage('Mật khẩu phải có ít nhất 6 ký tự');
                    return;
                }
                updateData.password = currentUser.password.trim();
            }

            console.log('Sending update request with data:', updateData, 'userId:', currentUser.id);
            const response = await ApiService.adminUpdateUser(currentUser.id, updateData);
            console.log('Update response:', response);

            if (response && response.status === 200) {
                setMessage('Cập nhật người dùng thành công');
                setTimeout(() => {
                    fetchUsers();
                    closeModal();
                }, 500);
            } else {
                const errorMsg = response?.message || 'Không thể cập nhật người dùng';
                setMessage(errorMsg);
                console.error('Update failed:', errorMsg);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi cập nhật người dùng';
            setMessage(errorMsg);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentUser({
            id: null,
            name: '',
            email: '',
            phoneNumber: '',
            role: 'USER',
            password: ''
        });
        setEditMode(false);
    };

    return (
        <div className="admin-user-management">
            <div className="user-header">
                <h2>Quản lý Người dùng</h2>
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="filter-select"
                >
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </div>

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phoneNumber || 'N/A'}</td>
                                <td>
                                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(user)}>
                                        Sửa
                                    </button>
                                    {user.role !== 'ADMIN' && (
                                        <button className="btn-delete" onClick={() => handleDelete(user.id)}>
                                            Xóa
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Chỉnh sửa Người dùng</h3>
                        {message && (
                            <div className="message">
                                {message}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tên:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={currentUser.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={currentUser.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại:</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={currentUser.phoneNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Vai trò:</label>
                                <select
                                    name="role"
                                    value={currentUser.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Mật khẩu mới (để trống nếu không đổi):</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={currentUser.password}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-submit">
                                    Cập nhật
                                </button>
                                <button type="button" className="btn-cancel" onClick={closeModal}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
