import axios from "axios"
import { FeedbackApis, FeedBackBaseUrl } from "../../../environment/ApiManager"

export const BookingFeedbackService = (token: any, id: any) => {
    return axios.get(`${FeedBackBaseUrl}${FeedbackApis?.BookingFeedback}${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}

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