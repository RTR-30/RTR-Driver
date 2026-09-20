import axios from "axios";
import { bookingBaseUrl, bookingsApis, createBooking, ownBaseUrl, payment, paymentBaseUrl, tripTypeApi } from "../../../../../environment/ApiManager";
import { Get, Post } from "../../../../Common/HttpService";

export const createBookings = ( data:any ) => {
    console.log(`${bookingBaseUrl}${createBooking}`);
    
    return Post(`${bookingBaseUrl}${createBooking}`, data, "rtrToken")
}

export const createOrder = (data:any) => {
    return Post(`${paymentBaseUrl}${payment.createOrders}`, data, "rtrToken")
}

export const verifyPayments = (data:any) => {
    return Post(`${paymentBaseUrl}${payment.verifyPayment}`, data, "rtrToken")
}

export const PaymentTypeService = async (id: any) => {
    return Get(`${paymentBaseUrl}${tripTypeApi.tripTypePament}${id}`, "rtrToken")
}

export const GetGearTypeService = async () => {
    return Get(`${bookingBaseUrl}${bookingsApis.gearType}`, 'rtrToken')
}