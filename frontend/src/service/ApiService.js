import axios from "axios";

export default class ApiService {

    static BASE_URL = "http://localhost:9800";

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

    static async getOrderItemsByOrderId(orderId) {
        const response = await axios.get(`${this.BASE_URL}/order/order-items/${orderId}`, {
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

    /***AUTHENTICATION CHECKER */
    static logout(){
        localStorage.removeItem('token')
        localStorage.removeItem('role')
    }

    static isAuthenticated(){
        const token = localStorage.getItem('token')
        return !!token
    }

    static isAdmin(){
        const role = localStorage.getItem('role')
        return role === 'ADMIN'
    }



}
