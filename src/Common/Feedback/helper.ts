import axios from "axios"
import { FeedbackApis, FeedBackBaseUrl } from "../../../environment/ApiManager"

export const FeedbackTagService = (token: any) => {
    return axios.get(`${FeedBackBaseUrl}${FeedbackApis?.Tags}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}

export const submitFeedbackService = (payload: any, token: any) => {
    return axios.post(`${FeedBackBaseUrl}${FeedbackApis?.Submit}`, payload, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}