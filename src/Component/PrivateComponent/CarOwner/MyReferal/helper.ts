import axios from "axios";
import { baseUrl, ownBaseUrl, referalApi, userData } from "../../../../../environment/ApiManager";
import { Get } from "../../../../Common/HttpService";

export const referalHistoryService = async () => {
    return Get(`${ownBaseUrl}${referalApi.referal_history}`, 'rtrToken')
}

export const getUserDetailsService = async () => {
    return await Get(`${baseUrl}${userData}`, "rtrToken")
}