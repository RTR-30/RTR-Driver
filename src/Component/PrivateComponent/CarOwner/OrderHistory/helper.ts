import axios from "axios";
import { bookingBaseUrl, bookingList } from "../../../../../environment/ApiManager";

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