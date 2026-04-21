import axios from "axios";

export default class ApiService {

    static BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://laptop-ecommerce-8ved.onrender.com";

    static getHeader() {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    }

    /**AUTh && USERS API */
    static async registerUser(registration) {
        const response = await axios.post(`${this.BASE_URL}/auth/register`, registration)
        return response.data;
    }


    static async loginUser(loginDetails) {
        const response = await axios.post(`${this.BASE_URL}/auth/login`, loginDetails)
        return response.data;
    }

    static async googleLogin(token) {
        const response = await axios.post(`${this.BASE_URL}/auth/oauth2/google`, { token });
        return response.data;
    }

    static async checkEmailExists(email) {
        const response = await axios.get(`${this.BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
        return response.data;
    }

    static async sendRegistrationOTP(email) {
        const response = await axios.post(`${this.BASE_URL}/auth/otp/send?email=${encodeURIComponent(email)}`);
        return response.data;
    }

    static async verifyRegistrationOTP(email, code) {
        const response = await axios.post(`${this.BASE_URL}/auth/otp/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
        return response.data;
    }

    static async sendForgotPasswordOTP(email) {
        const response = await axios.post(`${this.BASE_URL}/auth/otp/forgot-password/send?email=${encodeURIComponent(email)}`);
        return response.data;
    }

    static async verifyForgotPasswordOTP(email, code) {
        const response = await axios.post(`${this.BASE_URL}/auth/otp/forgot-password/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
        return response.data;
    }

    static async resetPassword(email, newPassword, otpCode) {
        const response = await axios.post(`${this.BASE_URL}/auth/reset-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}&otpCode=${encodeURIComponent(otpCode)}`);
        return response.data;
    }


    static async getLoggedInUserInfo() {
        const response = await axios.get(`${this.BASE_URL}/user/my-info`, {
            headers: this.getHeader()
        });
        return response.data;
    }


    /**PRODUCT ENDPOINT */

    static async addProduct(formData) {
        const response = await axios.post(`${this.BASE_URL}/product/create`, formData, {
            headers: {
                ...this.getHeader(),
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }

    static async updateProduct(formData) {
        const response = await axios.put(`${this.BASE_URL}/product/update`, formData, {
            headers: {
                ...this.getHeader(),
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }

    static async getAllProducts() {
        const response = await axios.get(`${this.BASE_URL}/product/get-all`)
        return response.data;
    }

    static async getProducts(page = 0, size = 8, search = "") {
        const params = { page, size };
        if (search && search.trim()) {
            params.search = search.trim();
        }
        const response = await axios.get(`${this.BASE_URL}/product/list`, { params });
        return response.data;
    }

    static async searchProducts(searchValue) {
        const response = await axios.get(`${this.BASE_URL}/product/search`, {
            params: { searchValue }
        });
        return response.data;
    }

    static async getAllProductsByCategoryId(categoryId) {
        const response = await axios.get(`${this.BASE_URL}/product/get-by-category-id/${categoryId}`)
        return response.data;
    }

    static async getProductById(productId) {
        const response = await axios.get(`${this.BASE_URL}/product/get-by-product-id/${productId}`)
        return response.data;
    }

    static async deleteProduct(productId) {
        const response = await axios.delete(`${this.BASE_URL}/product/delete/${productId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /**CATEGORY */
    static async createCategory(body) {
        const response = await axios.post(`${this.BASE_URL}/category/create`, body, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async getAllCategory() {
        const response = await axios.get(`${this.BASE_URL}/category/get-all`)
        return response.data;
    }

    static async getCategoryById(categoryId) {
        const response = await axios.get(`${this.BASE_URL}/category/get-category-by-id/${categoryId}`)
        return response.data;
    }

    static async updateCategory(categoryId, body) {
        const response = await axios.put(`${this.BASE_URL}/category/update/${categoryId}`, body, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async deleteCategory(categoryId) {
        const response = await axios.delete(`${this.BASE_URL}/category/delete/${categoryId}`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    /**ORDEDR */
    static async createOrder(body) {
        const response = await axios.post(`${this.BASE_URL}/order/create`, body, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async getAllOrders() {
        const response = await axios.get(`${this.BASE_URL}/order/filter`, {
            headers: this.getHeader()
        })
        return response.data;
    }

    static async getMyOrder(orderId) {
        const response = await axios.get(`${this.BASE_URL}/order/my-order/${orderId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getOrderItemById(itemId) {
        const response = await axios.get(`${this.BASE_URL}/order/filter`, {
            headers: this.getHeader(),
            params: {itemId}
        })
        return response.data;
    }

    static async getAllOrderItemsByStatus(status) {
        const response = await axios.get(`${this.BASE_URL}/order/filter`, {
            headers: this.getHeader(),
            params: {status}
        })
        return response.data;
    }

    static async updateOrderitemStatus(orderItemId, status) {
        const response = await axios.put(`${this.BASE_URL}/order/update-item-status/${orderItemId}`, {}, {
            headers: this.getHeader(),
            params: {status}
        })
        return response.data;
    }




    /**ADDRESS */
    static async saveAddress(body) {
        const response = await axios.post(`${this.BASE_URL}/address/save`, body, {
            headers: this.getHeader()
        })
        return response.data;
    }

    /**USER UPDATE */
    static async updateUser(updateUserDto) {
        const response = await axios.patch(`${this.BASE_URL}/user/update`, updateUserDto, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getAllUsers() {
        const response = await axios.get(`${this.BASE_URL}/user/get-all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getUserById(userId) {
        const response = await axios.get(`${this.BASE_URL}/user/get-by-id/${userId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async deleteUser(userId) {
        const response = await axios.delete(`${this.BASE_URL}/user/delete/${userId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async adminUpdateUser(userId, updateData) {
        const response = await axios.patch(`${this.BASE_URL}/user/admin-update/${userId}`, updateData, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /**DISCOUNT APIS */
    static async createDiscount(discountDTO) {
        const response = await axios.post(`${this.BASE_URL}/api/discounts/create`, discountDTO, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async updateDiscount(discountId, discountDTO) {
        const response = await axios.put(`${this.BASE_URL}/api/discounts/update/${discountId}`, discountDTO, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async deleteDiscount(discountId) {
        const response = await axios.delete(`${this.BASE_URL}/api/discounts/delete/${discountId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getAllDiscounts() {
        const response = await axios.get(`${this.BASE_URL}/api/discounts/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getDiscountById(discountId) {
        const response = await axios.get(`${this.BASE_URL}/api/discounts/${discountId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getDiscountByCode(code) {
        const response = await axios.get(`${this.BASE_URL}/api/discounts/code/${code}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getActiveDiscounts() {
        const response = await axios.get(`${this.BASE_URL}/api/discounts/active/list`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async validateDiscount(code, orderId) {
        const response = await axios.post(`${this.BASE_URL}/api/discounts/validate`, null, {
            headers: this.getHeader(),
            params: { code, orderId }
        });
        return response.data;
    }

    /**PAYMENT APIS */
    static async initializePayment(paymentRequest) {
        const response = await axios.post(`${this.BASE_URL}/api/payments/initialize`, paymentRequest, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async verifyPaymentOTP(verifyRequest) {
        const response = await axios.post(`${this.BASE_URL}/api/payments/verify-otp`, verifyRequest, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async processPayment(orderId) {
        const response = await axios.post(`${this.BASE_URL}/api/payments/process/${orderId}`, {}, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getPaymentStatus(orderId) {
        const response = await axios.get(`${this.BASE_URL}/api/payments/status/${orderId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /**OTP API */
    static async requestPaymentOTP(orderId) {
        const response = await axios.post(`${this.BASE_URL}/api/otp/request-payment/${orderId}`, {}, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /**REVIEWS */
    static async getProductReviews(productId, page, size) {
        const params = {};
        if (page !== undefined && page !== null) {
            params.page = page;
        }
        if (size !== undefined && size !== null) {
            params.size = size;
        }
        const response = await axios.get(`${this.BASE_URL}/api/reviews/product/${productId}`, { params });
        return response.data;
    }

    static async createReview(body) {
        const response = await axios.post(`${this.BASE_URL}/api/reviews`, body, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /**WISHLIST */
    static async addToWishlist(productId) {
        const response = await axios.post(`${this.BASE_URL}/api/wishlist/add/${productId}`, {}, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async removeFromWishlist(productId) {
        const response = await axios.delete(`${this.BASE_URL}/api/wishlist/remove/${productId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getWishlist() {
        const response = await axios.get(`${this.BASE_URL}/api/wishlist`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async getWishlistCount(productId) {
        const response = await axios.get(`${this.BASE_URL}/api/wishlist/count/${productId}`);
        return response.data;
    }

    static async getAllReviews() {
        const response = await axios.get(`${this.BASE_URL}/api/reviews/all`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async deleteReview(reviewId) {
        const response = await axios.delete(`${this.BASE_URL}/api/reviews/${reviewId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async addNewReply(reviewId, content) {
        const response = await axios.post(`${this.BASE_URL}/api/reviews/${reviewId}/replies`, {}, {
            headers: this.getHeader(),
            params: { content }
        });
        return response.data;
    }

    static async updateReplyById(replyId, content) {
        const response = await axios.put(`${this.BASE_URL}/api/reviews/replies/${replyId}`, {}, {
            headers: this.getHeader(),
            params: { content }
        });
        return response.data;
    }

    static async deleteReplyById(replyId) {
        const response = await axios.delete(`${this.BASE_URL}/api/reviews/replies/${replyId}`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    /***AUTHENTICATION CHECKER */
    static logout(){
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        // Trigger cart reload to switch to guest cart
        window.dispatchEvent(new Event('userChanged'));
    }

    static isAuthenticated(){
        const token = localStorage.getItem('token')
        return !!token
    }

    static isAdmin(){
        const role = localStorage.getItem('role')
        return role === 'ADMIN'
    }

    /**EXCEL IMPORT/EXPORT */
    static async downloadProductTemplate() {
        const response = await axios.get(`${this.BASE_URL}/product/download-template`, {
            headers: this.getHeader(),
            responseType: 'blob'
        });
        return response;
    }

    static async exportProductsToExcel() {
        const response = await axios.get(`${this.BASE_URL}/product/export-excel`, {
            headers: this.getHeader(),
            responseType: 'blob'
        });
        return response;
    }

    static async importProductsFromExcel(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${this.BASE_URL}/product/import-excel`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    /**USER DISCOUNTS */
    static async getMyDiscounts() {
        const response = await axios.get(`${this.BASE_URL}/api/user-discounts/my-discounts`, {
            headers: this.getHeader()
        });
        return response.data;
    }

    static async assignDiscountToUser(userId, discountId) {
        const response = await axios.post(`${this.BASE_URL}/api/user-discounts/assign?userId=${userId}&discountId=${discountId}`, {}, {
            headers: this.getHeader()
        });
        return response.data;
    }

}
