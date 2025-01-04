import axios from "axios";
import { BookingBaseUrl, BookingList } from "../../../../../environment/ApiManager";

export const FetchBookingList = (userId: any) => {
    console.log('====================================');
    console.log(userId, "helper");
    console.log('====================================');
    return axios.get(BookingBaseUrl + BookingList + userId, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
}