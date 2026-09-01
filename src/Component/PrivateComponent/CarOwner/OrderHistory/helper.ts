import axios from "axios";
import { bookingBaseUrl, bookingList, FeedbackApis, FeedBackBaseUrl } from "../../../../../environment/ApiManager";
import { Get } from "../../../../Common/HttpService";

export const FetchOrderHistory = async (limit: any, page:any) => {
    return Get(`${bookingBaseUrl}${bookingList}?status=Cancelled,Closed&limit=${limit}&page=${page}`, "rtrToken")
}

export const BookingFeedbackService = (id: any) => {
    return Get(`${FeedBackBaseUrl}${FeedbackApis?.BookingFeedback}${id}`, "rtrToken")
}