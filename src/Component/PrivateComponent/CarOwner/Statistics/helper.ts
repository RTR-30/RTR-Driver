import axios from "axios";
import { baseUrl, statisticsApi } from "../../../../../environment/ApiManager";
import { Get } from "../../../../Common/HttpService";

export const StatisticService = async (payload: any) => {
    return Get(`${baseUrl}${statisticsApi.statistics}?filter=${payload.filter}&startDate=${payload.startDate}&endDate=${payload.endDate}`, "rtrToken")
}