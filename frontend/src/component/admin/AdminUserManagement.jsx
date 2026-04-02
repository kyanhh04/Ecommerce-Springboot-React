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
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedDiscountIds, setSelectedDiscountIds] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [discountSearchTerm, setDiscountSearchTerm] = useState('');
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
    const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchDiscounts();
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
            setMessageType('error');
            setMessage('Không thể tải danh sách người dùng');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const fetchDiscounts = async () => {
        try {
            const response = await ApiService.getAllDiscounts();
            console.log('Discounts response:', response);
            if (response.status === 200) {
                setDiscounts(response.discountList || []);
                console.log('Discounts loaded:', response.discountList?.length || 0);
            } else {
                console.error('Failed to fetch discounts:', response.message);
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
            console.error('Error response:', error.response?.data);
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
        setUserToDelete(userId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await ApiService.deleteUser(userToDelete);
            if (response.status === 200) {
                setMessageType('success');
                setMessage('Xóa người dùng thành công');
                setTimeout(() => setMessage(''), 3000);
                fetchUsers();
                setShowDeleteConfirm(false);
                setUserToDelete(null);
            } else {
                setMessageType('error');
                setMessage(response.message || 'Không thể xóa người dùng');
                setTimeout(() => setMessage(''), 3000);
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setMessageType('error');
            setMessage(error.response?.data?.message || 'Lỗi khi xóa người dùng');
            setTimeout(() => setMessage(''), 3000);
            setShowDeleteConfirm(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
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
                fetchUsers();
                closeModal();
                setMessageType('success');
                setMessage('Cập nhật người dùng thành công');
                setTimeout(() => setMessage(''), 3000);
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

    const handleAssignDiscount = (userId) => {
        setSelectedUserId(userId);
        setSelectedDiscountIds([]);
        setDiscountSearchTerm('');
        setMessage('');
        setShowDiscountModal(true);
    };

    const handleDiscountToggle = (discountId) => {
        setSelectedDiscountIds(prev => {
            if (prev.includes(discountId)) {
                return prev.filter(id => id !== discountId);
            } else {
                return [...prev, discountId];
            }
        });
    };

    const handleDiscountSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedDiscountIds.length === 0) {
            setMessage('Vui lòng chọn ít nhất một mã giảm giá');
            return;
        }

        try {
            let successCount = 0;
            let errorMessages = [];

            for (const discountId of selectedDiscountIds) {
                try {
                    const response = await ApiService.assignDiscountToUser(selectedUserId, discountId);
                    if (response.status === 200) {
                        successCount++;
                    } else {
                        errorMessages.push(response.message);
                    }
                } catch (error) {
                    errorMessages.push(error.response?.data?.message || 'Lỗi khi cấp mã');
                }
            }

            if (successCount > 0) {
                setMessageType('success');
                setMessage(`Đã cấp thành công ${successCount} mã giảm giá`);
                setTimeout(() => {
                    setShowDiscountModal(false);
                    setMessage('');
                    setSelectedDiscountIds([]);
                }, 1500);
            } else {
                setMessageType('error');
                setMessage(errorMessages.join(', ') || 'Không thể cấp mã giảm giá');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error assigning discounts:', error);
            setMessageType('error');
            setMessage('Lỗi khi cấp mã giảm giá');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const closeDiscountModal = () => {
        setShowDiscountModal(false);
        setSelectedUserId(null);
        setSelectedDiscountIds([]);
        setDiscountSearchTerm('');
        setMessage('');
    };

    return (
        <div className="admin-user-management">
            {message && !showModal && !showDiscountModal && (
                <div className={messageType === 'success' ? 'success-message' : 'error-message'}>
                    {message}
                </div>
            )}
            
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
                    autoComplete="off"
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
                                    <div className="action-buttons">
                                        <button 
                                            className="btn-icon btn-edit" 
                                            onClick={() => handleEdit(user)}
                                            title="Sửa"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                        </button>
                                        <button 
                                            className="btn-icon btn-discount" 
                                            onClick={() => handleAssignDiscount(user.id)}
                                            title="Cấp mã giảm giá"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                                <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
                                                <polyline points="7.5 19.79 7.5 14.6 3 12"/>
                                                <polyline points="21 12 16.5 14.6 16.5 19.79"/>
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                                            </svg>
                                        </button>
                                    </div>
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
                        <form onSubmit={handleSubmit} autoComplete="off">
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
                                    autoComplete="off"
                                    data-form-type="other"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-submit">
                                    Cập nhật
                                </button>
                                <button type="button" className="btn-cancel" onClick={closeModal}>
                                    Hủy
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-delete-modal" 
                                    onClick={() => {
                                        closeModal();
                                        handleDelete(currentUser.id);
                                    }}
                                >
                                    Xóa tài khoản
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDiscountModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cấp mã giảm giá cho User #{selectedUserId}</h3>
                        {message && (
                            <div className="message">
                                {message}
                            </div>
                        )}
                        <form onSubmit={handleDiscountSubmit}>
                            <div className="form-group">
                                <label>Chọn mã giảm giá:</label>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm mã giảm giá..."
                                    value={discountSearchTerm}
                                    onChange={(e) => setDiscountSearchTerm(e.target.value)}
                                    className="discount-search-input"
                                    autoComplete="off"
                                />
                                <div className="discount-checkbox-list">
                                    {discounts.length === 0 ? (
                                        <p className="no-discounts">Chưa có mã giảm giá nào</p>
                                    ) : (
                                        discounts
                                            .filter(discount => 
                                                discount.code.toLowerCase().includes(discountSearchTerm.toLowerCase())
                                            )
                                            .map(discount => (
                                                <label key={discount.id} className="discount-checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDiscountIds.includes(discount.id)}
                                                        onChange={() => handleDiscountToggle(discount.id)}
                                                    />
                                                    <span className="discount-checkbox-label">
                                                        <strong>{discount.code}</strong>
                                                        <span className="discount-value">
                                                            ({discount.discountType === 'PERCENTAGE' 
                                                                ? `${discount.discountValue}%` 
                                                                : `${discount.discountValue.toLocaleString()}đ`})
                                                        </span>
                                                    </span>
                                                </label>
                                            ))
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-submit" disabled={selectedDiscountIds.length === 0}>
                                    Cấp mã ({selectedDiscountIds.length})
                                </button>
                                <button type="button" className="btn-cancel" onClick={closeDiscountModal}>
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <div className="confirm-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                        </div>
                        <h3>Xác nhận xóa người dùng</h3>
                        <p className="confirm-message">
                            Bạn có chắc chắn muốn xóa người dùng này không? 
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="modal-actions modal-actions-center">
                            <button type="button" className="btn-cancel" onClick={cancelDelete}>
                                Hủy
                            </button>
                            <button type="button" className="btn-delete-confirm" onClick={confirmDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
