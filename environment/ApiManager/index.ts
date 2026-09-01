export const Google_Key = "AIzaSyBgUp4ddMRJBFN8VuDL-Xfo75m0lIyHHts";
export const AppID = "63b4b0ba-aa00-4409-aaad-c2d75eb8ff86";

export const ownBaseUrl = "http://10.176.191.206:8000/";

export const baseUrl = `${ownBaseUrl}user/`;
export const bookingBaseUrl = `${ownBaseUrl}booking/`;
export const paymentBaseUrl = `${ownBaseUrl}payment/`;
export const forgetBaseUrl = `${ownBaseUrl}forget/`;
export const deviceBaseUrl = `${ownBaseUrl}user_devices/`;
export const FeedBackBaseUrl = `${ownBaseUrl}feedback`;

export const loginUrl = "login";
export const signUp = "createUser";

export const SignUpEmailVerify = {
    confirmEmail:"confirmEmail",
    verifyEmail:"verifyEmail"
}

export const createBooking = "createBooking";
export const bookingList = "getBookingList";
export const updateBooking = "updateBooking";
export const getDriverinfo = "partner-details";

export const updateUser = "updateUser";
export const bookingsApis = {
    gearType: 'admin/gear-types'
}

export const payment = {
    createOrders : "create-order",
    verifyPayment : "verify-payment"
}

export const forget = {
    verifyEmail : "forget-password",
    verifyOtp : "verifyOtp",
    forgetPassword : "reset-password"
}

export const tripTypeApi = {
    tripTypes : "trip-types",
    tripTypePament : "trip-payments?tripTypeId="
}

export const OneSignalAPi = {
    UserDevices : "user/devices"
}

export const referalApi = {
    referal_history: 'referral/history'
}

export const statisticsApi = {
    statistics: 'statistics'
}

export const FeedbackApis = {
    Tags: '/tags?targetType=driver',
    Submit: '/submit',
    BookingFeedback: '/booking/'
}