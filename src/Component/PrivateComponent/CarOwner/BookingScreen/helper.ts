import axios from "axios";
import { bookingBaseUrl, createBooking, payment, paymentBaseUrl, tripTypeApi } from "../../../../../environment/ApiManager";

export const createBookings = ( token:any, data:any ) => {
    return axios.post(`${bookingBaseUrl}${createBooking}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
}

export const createOrder = (token:any, data:any) => {
    return axios.post(`${paymentBaseUrl}${payment.createOrders}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const verifyPayments = (data:any) => {
    return axios.post(`${paymentBaseUrl}${payment.verifyPayment}`, data)
}

export const PaymentTypeService = async (id: any, token: any) => {
    return axios.get(`${paymentBaseUrl}${tripTypeApi.tripTypePament}${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}