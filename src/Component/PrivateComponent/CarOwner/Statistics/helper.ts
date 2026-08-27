import axios from "axios";
import { baseUrl, statisticsApi } from "../../../../../environment/ApiManager";
export const StatisticService = async (token: any, payload: any) => {
    
    return axios.get(`${baseUrl}${statisticsApi.statistics}?filter=${payload.filter}&startDate=${payload.startDate}&endDate=${payload.endDate}`,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}