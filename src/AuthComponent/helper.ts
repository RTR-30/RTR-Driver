import axios from "axios";
import { baseUrl, OneSignalAPi } from "../../environment/ApiManager/index";
import { Delete } from "../Common/HttpService";

export const removeOneSignalservice = (token: any, data: any) => {
    // return Delete(`${baseUrl}${OneSignalAPi.UserDevices}`, data, "rtrToken")
    return axios.delete(`${baseUrl}${OneSignalAPi.UserDevices}`, {
        data: data,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

}