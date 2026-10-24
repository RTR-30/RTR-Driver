import { contentBaseUrl, contentApis } from "../../../../../environment/ApiManager";
import { withoutTokenGet } from "../../../../Common/HttpService";

export interface TermItem {
    title: string;
    description: string;
}

export interface TermsResponse {
    success: boolean;
    app_type?: string;
    heading?: string;
    content?: string;
    data?: TermItem[];
    message?: string;
}

export const getTermsAndConditionsService = async (appType: string = "user") => {
    return await withoutTokenGet(`${contentBaseUrl}${contentApis.termsByAppType(appType)}`);
};
