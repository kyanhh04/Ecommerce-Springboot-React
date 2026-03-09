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

import About from './component/pages/About';
import Contact from './component/pages/Contact';
import Privacy from './component/pages/Privacy';
import Terms from './component/pages/Terms';
import FAQs from './component/pages/FAQS';

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <CartProvider>
        <div className="app-container">

          <Navbar />

          
          <Route path='/payment' element={<ProtectedRoute element={<PaymentPageWrapper/>} />} />
          <div className="main-content">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path='/' element={<Home />} />
              <Route path='/product/:productId' element={<ProductDetailsPage />} />
              <Route path='/categories' element={<CategoryListPage />} />
              <Route path='/category/:categoryId' element={<CategoryProductsPage />} />
              <Route path='/cart' element={<CartPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/faqs" element={<FAQs />} />

              {/* USER PROTECTED */}
              <Route path='/profile' element={<ProtectedRoute element={<ProfilePage />} />} />
              <Route path='/add-address' element={<ProtectedRoute element={<AddressPage />} />} />
              <Route path='/edit-address' element={<ProtectedRoute element={<AddressPage />} />} />
              <Route path='/payment' element={<ProtectedRoute element={<PaymentPageWrapper/>} />} />

              {/* ADMIN ROUTES */}
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

        </Routes>
      <Footer/>
    </CartProvider>
    </BrowserRouter>
  );
}

export default App;