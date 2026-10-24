import axios from "axios";
import { baseUrl, statisticsApi } from "../../../../../environment/ApiManager";
import { Get } from "../../../../Common/HttpService";

export const StatisticService = async (payload: any = {}) => {
    const filter = payload?.filter || "";
    const startDate = payload?.startDate || "";
    const endDate = payload?.endDate || "";
    return Get(`${baseUrl}${statisticsApi.statistics}?filter=${filter}&startDate=${startDate}&endDate=${endDate}`, "rtrToken");
};