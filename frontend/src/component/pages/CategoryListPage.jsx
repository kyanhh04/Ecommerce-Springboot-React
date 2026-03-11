import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/categoryListPage.css";

const CategoryListPage = () => {

    const [cateList, setCateList] = useState([]);
    const [cateError, setCateError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadCate();
    }, []);

    const loadCate = async () => {
        try {

            const response = await ApiService.getAllCategory();
            setCateList(response.categoryList || []);

        } catch (err) {

            setCateError(
                err.response?.data?.message ||
                err.message ||
                "Không tải được danh mục"
            );
        }
    };

    const goCategory = (id) => {
        navigate(`/category/${id}`);
    };

    const cateImages = {
        "Laptop":"https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        "Chuột máy tính":"https://images.unsplash.com/photo-1527814050087-3793815479db",
        "Bàn phím":"https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
        "Tai nghe":"https://images.unsplash.com/photo-1518444065439-e933c06ce9cd",
        "Ổ cứng/SSD":"https://images.unsplash.com/photo-1591799265444-d66432b91588"
    };

    return (

        <section className="cate-wrapper">

            <h2 className="cate-title">Danh Mục Sản Phẩm</h2>

            {cateError ? (

                <p className="cate-error">{cateError}</p>

            ) : (

                <>

                {/* 3 category trên */}

                <div className="cate-row-top">

                    {cateList.slice(0,3).map((item)=>(
                        <div
                            key={item.id}
                            className="cate-card"
                            onClick={()=>goCategory(item.id)}
                        >

                            <img
                                src={cateImages[item.name]}
                                alt={item.name}
                                className="cate-img"
                            />

                            <p className="cate-name">{item.name}</p>

                        </div>
                    ))}

                </div>


                {/* 2 category dưới */}

                <div className="cate-row-bottom">

                    {cateList.slice(3,5).map((item)=>(
                        <div
                            key={item.id}
                            className="cate-card"
                            onClick={()=>goCategory(item.id)}
                        >

                            <img
                                src={cateImages[item.name]}
                                alt={item.name}
                                className="cate-img"
                            />

                            <p className="cate-name">{item.name}</p>

                        </div>
                    ))}

                </div>

                </>

            )}

        </section>
    );
};

export default CategoryListPage;