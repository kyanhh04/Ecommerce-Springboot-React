import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import RegisterMethodPage from './component/pages/RegisterMethodPage';
import RegisterEmailPage from './component/pages/RegisterEmailPage';
import RegisterOTPPage from './component/pages/RegisterOTPPage';
import RegisterPasswordPage from './component/pages/RegisterPasswordPage';
import LoginPage from './component/pages/LoginPage';
import ForgotPasswordPage from './component/pages/ForgotPasswordPage';
import ForgotPasswordOTPPage from './component/pages/ForgotPasswordOTPPage';
import ResetPasswordPage from './component/pages/ResetPasswordPage';
import ProfilePage from './component/pages/ProfilePage';
import AddressPage from './component/pages/AddressPage';
import MyOrdersPage from './component/pages/MyOrder';
import MyDiscountsPage from './component/pages/MyDiscountsPage';

import AdminPage from './component/admin/AdminPage';
import AdminLayout from './component/admin/AdminLayout';
import AdminCategoryPage from './component/admin/AdminCategoryPage';
import AddCategory from './component/admin/AddCategory';
import EditCategory from './component/admin/EditCategory';
import AdminProductPage from './component/admin/AdminProductPage';
import AddProductPage from './component/admin/AddProductPage';
import EditProductPage from './component/admin/EditProductPage';
import ProductExcelManager from './component/admin/ProductExcelManager';
import AdminOrdersPage from './component/admin/AdminOrderPage';
import AdminOrderDetailsPage from './component/admin/AdminOrderDetailsPage';
import AdminDiscountPage from './component/admin/AdminDiscountPage';
import AddDiscountPage from './component/admin/AddDiscountPage';
import EditDiscountPage from './component/admin/EditDiscountPage';
import AdminReviewPage from './component/admin/AdminReviewPage';
import AdminSlideManagement from './component/admin/AdminSlideManagement';
import AdminUserManagement from './component/admin/AdminUserManagement';
import SecurePaymentPage from './component/payment/SecurePaymentPage';
import OrderDetailPage from './component/pages/OrderDetailPage';
import WishlistPage from './component/pages/WishlistPage';


import About from './component/pages/About';
import Privacy from './component/pages/Privacy';
import Terms from './component/pages/Terms';
import FAQs from './component/pages/FAQS';


function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="app-container">
      {!isAdmin && <Navbar />}
      <div className="main-content">
        <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/product/:productId' element={<ProductDetailsPage />} />
              <Route path='/category/:categoryId' element={<CategoryProductsPage />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/register' element={<RegisterMethodPage />} />
              <Route path='/register/email' element={<RegisterEmailPage />} />
              <Route path='/register/otp' element={<RegisterOTPPage />} />
              <Route path='/register/password' element={<RegisterPasswordPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/forgot-password' element={<ForgotPasswordPage />} />
              <Route path='/forgot-password/otp' element={<ForgotPasswordOTPPage />} />
              <Route path='/forgot-password/reset' element={<ResetPasswordPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/my-orders" element={<ProtectedRoute element={<MyOrdersPage />} />} />
              <Route path="/my-discounts" element={<ProtectedRoute element={<MyDiscountsPage />} />} />
              <Route path='/profile' element={<ProtectedRoute element={<ProfilePage />} />} />
              <Route path='/add-address' element={<ProtectedRoute element={<AddressPage />} />} />
              <Route path='/edit-address' element={<ProtectedRoute element={<AddressPage />} />} />
              <Route path='/payment' element={<ProtectedRoute element={<SecurePaymentPage/>} />} />
              <Route path='/order/:orderId' element={<ProtectedRoute element={<OrderDetailPage />} />} />
              <Route path='/wishlist' element={<ProtectedRoute element={<WishlistPage />} />} />


              <Route path='/admin' element={<AdminRoute element={<AdminLayout />} />}>
                <Route index element={<AdminPage />} />

                <Route path='categories' element={<AdminCategoryPage />} />
                <Route path='add-category' element={<AddCategory />} />
                <Route path='edit-category/:categoryId' element={<EditCategory />} />
                <Route path='products' element={<AdminProductPage />} />
                <Route path='add-product' element={<AddProductPage />} />
                <Route path='edit-product/:productId' element={<EditProductPage />} />
                <Route path='products-excel' element={<ProductExcelManager />} />
                <Route path='orders' element={<AdminOrdersPage />} />
                <Route path='order-details/:itemId' element={<AdminOrderDetailsPage />} />
                <Route path='discounts' element={<AdminDiscountPage />} />
                <Route path='add-discount' element={<AddDiscountPage />} />
                <Route path='edit-discount/:discountId' element={<EditDiscountPage />} />
                <Route path='reviews' element={<AdminReviewPage />} />
                <Route path='slides' element={<AdminSlideManagement />} />
                <Route path='users' element={<AdminUserManagement />} />
              </Route>
            </Routes>
          </div>
          {!isAdmin && <Footer />}
        </div>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;