import axios from "axios";
import { ownBaseUrl, referalApi } from "../../../../../environment/ApiManager";
import { Get } from "../../../../Common/HttpService";

export const referalHistoryService = async () => {
    return Get(`${ownBaseUrl}${referalApi.referal_history}`, 'rtrToken')
}