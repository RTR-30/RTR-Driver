import axios from "axios"
import { FeedbackApis, FeedBackBaseUrl } from "../../../environment/ApiManager"
import { Get, Post } from "../HttpService"

export const FeedbackTagService = () => {
    return Get(`${FeedBackBaseUrl}${FeedbackApis?.Tags}`, "rtrToken");
}

export const submitFeedbackService = (payload: any) => {
    return Post(`${FeedBackBaseUrl}${FeedbackApis?.Submit}`, payload, "rtrToken")
}