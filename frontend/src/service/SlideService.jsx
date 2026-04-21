import axios from "axios";
import ApiService from "./ApiService";

export default class SlideService {
    static BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://laptop-ecommerce-8ved.onrender.com";

    static async createSlide(formData, token) {
        const response = await axios.post(`${this.BASE_URL}/slides/create`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }

    static async updateSlide(slideId, formData, token) {
        const response = await axios.put(`${this.BASE_URL}/slides/update/${slideId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }

    static async deleteSlide(slideId, token) {
        const response = await axios.delete(`${this.BASE_URL}/slides/delete/${slideId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }

    static async getAllSlides(token) {
        const response = await axios.get(`${this.BASE_URL}/slides/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }

    static async getActiveSlides() {
        const response = await axios.get(`${this.BASE_URL}/slides/active`);
        return response.data;
    }

    static async getSlideById(slideId) {
        const response = await axios.get(`${this.BASE_URL}/slides/${slideId}`);
        return response.data;
    }
}
