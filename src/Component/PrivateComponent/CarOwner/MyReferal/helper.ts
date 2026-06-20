import axios from "axios";
import { ownBaseUrl, referalApi } from "../../../../../environment/ApiManager";

export const referalHistoryService = async (token: any) => {
    return axios.get(`${ownBaseUrl}${referalApi.referal_history}`,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}