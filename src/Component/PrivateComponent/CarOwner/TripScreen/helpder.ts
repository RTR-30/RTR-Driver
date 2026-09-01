import { paymentBaseUrl, tripTypeApi } from "../../../../../environment/ApiManager";
import { Get } from "../../../../Common/HttpService";

export const tripTypeService = async (token: any) => {
    return Get(`${paymentBaseUrl}${tripTypeApi.tripTypes}`, "rtrToken")
}