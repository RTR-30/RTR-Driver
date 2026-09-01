import axios from "axios";
import { bookingBaseUrl, bookingList, getDriverinfo, updateBooking } from "../../../../../environment/ApiManager";
import { Get, Put } from "../../../../Common/HttpService";

export const FetchBookingList = async (limit:any, page:any) => {
    return Get(`${bookingBaseUrl}${bookingList}?status=Created,Accepted,InProgress&limit=${limit}&page=${page}`, "rtrToken")
}

export const UpdateBooking = async (data:any) => {
    return Put(`${bookingBaseUrl}${updateBooking}?status=Cancelled`, data, "rtrToken")
}

export const getDriverinfoService = (data: any) => {
    return Get(`${bookingBaseUrl}${getDriverinfo}/${data}`, "rtrToken");
}