import axios from "axios";
import { baseUrl, updateUser} from "../../../../../environment/ApiManager/index";


export const updateingUser = (data: any, token: any) => {
    return axios.put(`${baseUrl}${updateUser}`, data, {
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}

// export const UpdateBooking = async (token:any, data:any) => {
//     return axios.put(`${bookingBaseUrl}${updateBooking}`, data,{
//         params:{
//             status:"Cancelled",            
//         },
//         headers:{
//             Authorization: `Bearer ${token}`,
//         }
//     })
// }