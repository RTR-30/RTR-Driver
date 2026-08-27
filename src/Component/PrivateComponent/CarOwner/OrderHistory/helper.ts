import axios from "axios";
import { bookingBaseUrl, bookingList, FeedbackApis, FeedBackBaseUrl } from "../../../../../environment/ApiManager";

export const FetchOrderHistory = async (token: any, limit: any, page:any) => {
    
    return axios.get(`${bookingBaseUrl}${bookingList}`, {
        params:{
            status:"Cancelled,Closed",
            limit:limit,
            page:page
        },
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}

export const BookingFeedbackService = (token: any, id: any) => {
    return axios.get(`${FeedBackBaseUrl}${FeedbackApis?.BookingFeedback}${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}