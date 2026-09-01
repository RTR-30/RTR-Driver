import axios from "axios";
import { baseUrl, updateUser} from "../../../../../environment/ApiManager/index";
import { Put } from "../../../../Common/HttpService";


export const updateingUser = (data: any) => {
    return Put(`${baseUrl}${updateUser}`, data, "rtrToken")
}