import axios from "axios";
import { baseUrl, signUp, SignUpEmailVerify } from "../../../../environment/ApiManager/index";

export const fetchSignUp = (data: any) => {
    return axios.post(`${baseUrl}${signUp}`, data);
}

export const signUpVerifyingMail = (data:any) => {
    return axios.post(`${baseUrl}${SignUpEmailVerify.confirmEmail}`, data);
}

export const signUpVerifyingOtp = (data:any) => {
    return axios.post(`${baseUrl}${SignUpEmailVerify.verifyEmail}`, data);
}