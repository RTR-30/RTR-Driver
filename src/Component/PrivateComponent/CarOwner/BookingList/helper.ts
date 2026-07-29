import axios from "axios";
import { bookingBaseUrl, bookingList, getDriverinfo, updateBooking } from "../../../../../environment/ApiManager";

export const FetchBookingList = async (token: any, limit:any, page:any) => {
    return axios.get(`${bookingBaseUrl}${bookingList}`, {
        params:{
            status:"Created,Accepted,InProgress",
            limit:limit,
            page:page
        },
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}

export const UpdateBooking = async (token:any, data:any) => {
    return axios.put(`${bookingBaseUrl}${updateBooking}`, data,{
        params:{
            status:"Cancelled",            
        },
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}

export const getDriverinfoService = (token: any, data: any) => {
    return axios.get(`${bookingBaseUrl}${getDriverinfo}/${data}`,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}