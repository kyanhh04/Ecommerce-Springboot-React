import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './service/Guard';
import Navbar from './component/common/Navbar';
import Footer from './component/common/footer';
import ScrollToTop from "./component/common/ScrollToTop";
import { CartProvider } from './component/context/CartContext';

import Home from './component/pages/Home';
import ProductDetailsPage from './component/pages/ProductDetailsPage';
import CategoryListPage from './component/pages/CategoryListPage';
import CategoryProductsPage from './component/pages/CategoryProductsPage';
import CartPage from './component/pages/CartPage';
import RegisterPage from './component/pages/RegisterPage';
import LoginPage from './component/pages/LoginPage';
import ProfilePage from './component/pages/ProfilePage';
import AddressPage from './component/pages/AddressPage';

import AdminPage from './component/admin/AdminPage';
import AdminCategoryPage from './component/admin/AdminCategoryPage';
import AddCategory from './component/admin/AddCategory';
import EditCategory from './component/admin/EditCategory';
import AdminProductPage from './component/admin/AdminProductPage';
import AddProductPage from './component/admin/AddProductPage';
import EditProductPage from './component/admin/EditProductPage';
import AdminOrdersPage from './component/admin/AdminOrderPage';
import AdminOrderDetailsPage from './component/admin/AdminOrderDetailsPage';
import AdminDiscountPage from './component/admin/AdminDiscountPage';
import AddDiscountPage from './component/admin/AddDiscountPage';
import EditDiscountPage from './component/admin/EditDiscountPage';
import PaymentPageWrapper from './component/pages/PaymentPageWrapper';
import SecurePaymentPage from './component/payment/SecurePaymentPage';
import PaymentDemo from './component/payment/PaymentDemo';
import OrderSuccessPage from './component/pages/OrderSuccessPage';


import About from './component/pages/About';
import Privacy from './component/pages/Privacy';
import Terms from './component/pages/Terms';
import FAQs from './component/pages/FAQS';


function App() {
  return (
  <CartProvider>
    <BrowserRouter>
      <ScrollToTop />

        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/product/:productId' element={<ProductDetailsPage />} />
              <Route path='/categories' element={<CategoryListPage />} />
              <Route path='/category/:categoryId' element={<CategoryProductsPage />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/payment-demo" element={<PaymentDemo />} />

              <Route path='/profile' element={<ProtectedRoute element={<ProfilePage />} />} />
              <Route path='/add-address' element={<ProtectedRoute element={<AddressPage />} />} />
              <Route path='/edit-address' element={<ProtectedRoute element={<AddressPage />} />} />
              <Route path='/payment' element={<ProtectedRoute element={<SecurePaymentPage/>} />} />
              <Route path='/order-success' element={<ProtectedRoute element={<OrderSuccessPage />} />} />


              <Route path='/admin' element={<AdminRoute element={<AdminPage />} />} />
              <Route path='/admin/categories' element={<AdminRoute element={<AdminCategoryPage />} />} />
              <Route path='/admin/add-category' element={<AdminRoute element={<AddCategory />} />} />
              <Route path='/admin/edit-category/:categoryId' element={<AdminRoute element={<EditCategory />} />} />
              <Route path='/admin/products' element={<AdminRoute element={<AdminProductPage />} />} />
              <Route path='/admin/add-product' element={<AdminRoute element={<AddProductPage />} />} />
              <Route path='/admin/edit-product/:productId' element={<AdminRoute element={<EditProductPage />} />} />
              <Route path='/admin/orders' element={<AdminRoute element={<AdminOrdersPage />} />} />
              <Route path='/admin/order-details/:itemId' element={<AdminRoute element={<AdminOrderDetailsPage />} />} />
              <Route path='/admin/discounts' element={<AdminRoute element={<AdminDiscountPage/>} />} />
              <Route path='/admin/add-discount' element={<AdminRoute element={<AddDiscountPage/>} />} />
              <Route path='/admin/edit-discount/:discountId' element={<AdminRoute element={<EditDiscountPage/>} />} />
            </Routes>
          </div>
          <Footer />
        </div>

    </BrowserRouter>
      </CartProvider>
  );
}

export default App;