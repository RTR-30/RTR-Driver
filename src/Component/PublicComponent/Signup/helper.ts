import { baseUrl, signUp, SignUpEmailVerify } from "../../../../environment/ApiManager/index";
import { withoutTokenPost } from "../../../Common/HttpService";

export const fetchSignUp = (data: any) => {
    return withoutTokenPost(`${baseUrl}${signUp}`, data);
}

export const signUpVerifyingMail = (data:any) => {
    return withoutTokenPost(`${baseUrl}${SignUpEmailVerify.confirmEmail}`, data);
}

export const signUpVerifyingOtp = (data:any) => {
    return withoutTokenPost(`${baseUrl}${SignUpEmailVerify.verifyEmail}`, data);
}