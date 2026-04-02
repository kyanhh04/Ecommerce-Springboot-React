import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/addProduct.css'
import ApiService from "../../service/ApiService";

const AddProductPage = () => {

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        ApiService.getAllCategory().then((res) => setCategories(res.categoryList));
    }, [])

    const compressImage = (file, maxSizeMB = 1) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Giảm kích thước nếu quá lớn
                    const maxDimension = 1200;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Nén với quality 0.8
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Nén ảnh thất bại'));
                        }
                    }, 'image/jpeg', 0.8);
                };
            };
            reader.onerror = reject;
        });
    };

    const handleImage = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước
            if (file.size > 10 * 1024 * 1024) {
                setMessage('Kích thước ảnh không được vượt quá 10MB');
                return;
            }
            
            // Kiểm tra định dạng
            if (!file.type.startsWith('image/')) {
                setMessage('Vui lòng chọn file ảnh');
                return;
            }
            
            try {
                // Nén ảnh nếu > 1MB
                const compressedImage = file.size > 1024 * 1024 
                    ? await compressImage(file) 
                    : file;
                
                setImage(compressedImage);
                
                // Tạo preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(compressedImage);
                
                console.log(`Kích thước gốc: ${(file.size / 1024).toFixed(2)}KB, Sau nén: ${(compressedImage.size / 1024).toFixed(2)}KB`);
            } catch (error) {
                setMessage('Lỗi xử lý ảnh: ' + error.message);
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!image) {
            setMessage('Vui lòng chọn ảnh sản phẩm');
            return;
        }
        if (!categoryId) {
            setMessage('Vui lòng chọn danh mục');
            return;
        }
        if (!name.trim()) {
            setMessage('Vui lòng nhập tên sản phẩm');
            return;
        }
        if (!price || price <= 0) {
            setMessage('Vui lòng nhập giá hợp lệ');
            return;
        }
        
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('categoryId', categoryId);
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);

            const response = await ApiService.addProduct(formData);
            if (response.status === 200) {
                navigate('/admin/products', { 
                    state: { message: response.message || 'Tạo sản phẩm thành công' } 
                });
            }

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Không thể tạo sản phẩm')
        } finally {
            setLoading(false);
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit} className="product-form">
                <button type="button" className="back-btn" onClick={() => navigate('/admin/products')}>← Quay lại</button>
                <h2>Thêm Sản Phẩm</h2>
                {message && <div className="message">{message}</div>}
                
                <div className="image-upload-section">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImage}
                        disabled={loading}
                    />
                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" style={{maxWidth: '200px', maxHeight: '200px'}} />
                        </div>
                    )}
                </div>
                
                <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={loading}
                    required
                >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat)=>(
                        <option value={cat.id} key={cat.id}>{cat.name}</option>
                    ))}
                </select>
                
                <input 
                    type="text" 
                    placeholder="Tên sản phẩm"
                    value={name}
                    onChange={(e)=> setName(e.target.value)}
                    disabled={loading}
                    required
                />

                <textarea 
                    placeholder="Mô tả"
                    value={description}
                    onChange={(e)=> setDescription(e.target.value)}
                    disabled={loading}
                />

                <input 
                    type="number" 
                    placeholder="Giá"
                    value={price}
                    onChange={(e)=> setPrice(e.target.value)}
                    disabled={loading}
                    required
                    min="0"
                    step="0.01"
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Đang tạo sản phẩm...' : 'Thêm Sản Phẩm'}
                </button>
            </form>
        </div>
    )

}
export default AddProductPage;