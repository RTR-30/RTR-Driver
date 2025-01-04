import axios from "axios";
import { BookingBaseUrl, Booking } from "../../../../../environment/ApiManager";

export const FetchBooking = ( userId:any, formData:any ) => {
    return axios.post(BookingBaseUrl + Booking + userId, formData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
}