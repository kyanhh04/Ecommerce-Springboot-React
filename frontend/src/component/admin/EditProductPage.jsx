import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../../style/addProduct.css'
import ApiService from "../../service/ApiService";


const EditProductPage = () => {
    const {productId} = useParams();
    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const navigate = useNavigate();

    useEffect(()=>{
        ApiService.getAllCategory().then((res) => setCategories(res.categoryList));

        if (productId) {
            ApiService.getProductById(productId).then((response)=>{
                const p = response.product;
                setName(p.name);
                setDescription(p.description);
                setPrice(p.price);
                const extractedCategoryId = p?.category?.id || p?.categoryId || '';
                setCategoryId(extractedCategoryId);
                setImageUrl(p.imageUrl);
            })
        }
    }, [productId]);

    const handleImageChange = (e) =>{
        setImage(e.target.files[0]);
        setImageUrl(URL.createObjectURL(e.target.files[0]));
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            if(image){
                formData.append('image', image);
            }
            formData.append('productId', productId);
            if (categoryId) {
                formData.append('categoryId', categoryId);
            }
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);

            const response = await ApiService.updateProduct(formData);
            if (response.status === 200) {
                navigate('/admin/products', { 
                    state: { message: response.message || 'Cập nhật sản phẩm thành công' } 
                });
            }

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'unable to update product')
        }
    }

    return(
        <form onSubmit={handleSubmit} className="product-form">
            <button type="button" className="back-btn" onClick={() => navigate('/admin/products')}>← Quay lại</button>
            <h2>Chỉnh Sửa Sản Phẩm</h2>
            {message && <div className="message">{message}</div>}
            <input type="file" onChange={handleImageChange}/>
            {imageUrl && <img src={imageUrl} alt={name} />}
            <select value={categoryId} onChange={(e)=> setCategoryId(e.target.value)}>
                <option value="">Chọn danh mục</option>
                {categories.map((cat)=>(
                    <option value={cat.id} key={cat.id}>{cat.name}</option>
                ))}
            </select>

            <input type="text" 
                placeholder="Tên sản phẩm"
                value={name}
                onChange={(e)=> setName(e.target.value)} />

                <textarea 
                placeholder="Mô tả"
                value={description}
                onChange={(e)=> setDescription(e.target.value)}/>

                <input type="number" 
                placeholder="Giá"
                value={price}
                onChange={(e)=> setPrice(e.target.value)} />

                <button type="submit">Cập Nhật</button>
        </form>
    );
}

export default EditProductPage;