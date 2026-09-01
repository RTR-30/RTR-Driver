import axios from "axios";
import { baseUrl, loginUrl, forgetBaseUrl, forget, deviceBaseUrl, OneSignalAPi } from "../../../../environment/ApiManager/index";
import { Post, withoutTokenPost } from "../../../Common/HttpService";


export const FetchLogin = (data: any) => {
    return withoutTokenPost(`${baseUrl}${loginUrl}`, data)
}

export const VerifyingMail = (data:any) => {
    return withoutTokenPost(`${forgetBaseUrl}${forget.verifyEmail}`, data);
}

export const verifyingOtp = (data:any) => {
    return withoutTokenPost(`${forgetBaseUrl}${forget.verifyOtp}`, data);
}

export const forgetedPassword = (data:any) => {
    return withoutTokenPost(`${forgetBaseUrl}${forget.forgetPassword}`, data);
}

export const oneSignalservice = (data: any) => {
    return Post(`${baseUrl}${OneSignalAPi.UserDevices}`, data, "rtrToken")
}