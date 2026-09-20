import { Get } from "../../../../Common/HttpService";
import { baseUrl, userData } from "../../../../../environment/ApiManager";

export const userDataService = async () => {
    return Get(`${baseUrl}${userData}`, "rtrToken")
}