import { contentBaseUrl, contentApis } from "../../../../../environment/ApiManager";
import { withoutTokenGet } from "../../../../Common/HttpService";

export interface ContactInfo {
    insta?: string;
    whatsapp?: string;
    mail?: string;
    phone?: string;
}

export interface ContactItem {
    title: string;
    description: string;
}

export interface ContactUsResponse {
    success: boolean;
    app_type?: string;
    heading?: string;
    content?: string;
    data?: ContactItem[];
    contact?: ContactInfo;
    message?: string;
}

export const getContactUsService = async (appType: string = "user") => {
    return await withoutTokenGet(`${contentBaseUrl}${contentApis.contactUsByAppType(appType)}`);
};
