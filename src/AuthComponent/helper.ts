import axios from "axios";
import { baseUrl, OneSignalAPi } from "../../environment/ApiManager/index";

export const removeOneSignalservice = (token: any, data: any) => {

    return axios.delete(`${baseUrl}${OneSignalAPi.UserDevices}`, {
        data: data,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

}