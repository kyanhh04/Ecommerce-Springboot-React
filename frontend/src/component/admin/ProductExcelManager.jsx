import React, { useState } from 'react';
import ApiService from '../../service/ApiService';
import '../../style/productExcelManager.css';

const ProductExcelManager = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.name.endsWith('.xlsx')) {
                setFile(selectedFile);
                setMessage('');
            } else {
                setMessage('Chỉ chấp nhận file Excel (.xlsx)');
                setMessageType('error');
                setFile(null);
            }
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            setLoading(true);
            const response = await ApiService.downloadProductTemplate();
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setMessage('Đã tải template thành công!');
            setMessageType('success');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Lỗi khi tải template');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportProducts = async () => {
        try {
            setLoading(true);
            const response = await ApiService.exportProductsToExcel();
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `products_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setMessage('Đã xuất danh sách sản phẩm thành công!');
            setMessageType('success');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Lỗi khi xuất sản phẩm');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleImportProducts = async () => {
        if (!file) {
            setMessage('Vui lòng chọn file Excel');
            setMessageType('error');
            return;
        }

        try {
            setLoading(true);
            const response = await ApiService.importProductsFromExcel(file);
            
            setMessage(response.message || 'Nhập sản phẩm thành công!');
            setMessageType('success');
            setFile(null);
            document.getElementById('fileInput').value = '';
        } catch (error) {
            setMessage(error.response?.data?.message || 'Lỗi khi nhập sản phẩm');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="excel-manager-container">
            <h2>Quản lý Sản phẩm Excel</h2>
            
            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <div className="excel-actions">
                <div className="action-section">
                    <h3>1. Tải Template</h3>
                    <p>Tải file Excel mẫu để điền thông tin sản phẩm</p>
                    <button 
                        onClick={handleDownloadTemplate}
                        disabled={loading}
                        className="btn-download"
                    >
                        {loading ? 'Đang tải...' : '📥 Tải Template'}
                    </button>
                </div>

                <div className="action-section">
                    <h3>2. Nhập Sản phẩm</h3>
                    <p>Nhập danh sách sản phẩm từ file Excel</p>
                    <div className="import-controls">
                        <input
                            id="fileInput"
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        {file && <span className="file-name">📄 {file.name}</span>}
                    </div>
                    <button 
                        onClick={handleImportProducts}
                        disabled={loading || !file}
                        className="btn-import"
                    >
                        {loading ? 'Đang nhập...' : '📥 Nhập Excel'}
                    </button>
                </div>

                <div className="action-section">
                    <h3>3. Xuất Sản phẩm</h3>
                    <p>Xuất tất cả sản phẩm hiện có ra file Excel</p>
                    <button 
                        onClick={handleExportProducts}
                        disabled={loading}
                        className="btn-export"
                    >
                        {loading ? 'Đang xuất...' : '📤 Xuất Excel'}
                    </button>
                </div>
            </div>

            <div className="instructions">
                <h3>Hướng dẫn nhập sản phẩm</h3>
                <ul>
                    <li>File Excel phải có định dạng .xlsx</li>
                    <li>Cột ID để trống cho sản phẩm mới, điền ID để cập nhật</li>
                    <li>Tên danh mục phải khớp với danh mục trong hệ thống</li>
                    <li>Giá phải là số dương</li>
                    <li>Các dòng trống sẽ bị bỏ qua</li>
                </ul>
            </div>
        </div>
    );
};

export default ProductExcelManager;
