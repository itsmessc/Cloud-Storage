import { authconstant } from "../actions/constants";

const initState = {
    token: null,
    user: {
        firstname: "",
        lastname: "",
        email: "",
        picture: ""
    },
    authenticate: false,
    authenticating: false,
    otpRequired: false, // New state to track if OTP is required
    loading: false,
    error: null,
    message: ''
};

export default (state = initState, action) => {
    console.log(action);

    switch (action.type) {
        case authconstant.LOGIN_REQUEST:
            state = {
                ...state,
                authenticating: true,
                otpRequired: false, // Reset OTP requirement on new login attempt
                error: null
            };
            break;
        
        case authconstant.LOGIN_SUCCESS:
            state = {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                authenticate: true,
                authenticating: false,
                otpRequired: false // Reset if login is successful without OTP
            };
            break;
        
        case authconstant.LOGIN_FAILURE:
            state = {
                ...state,
                authenticating: false,
                error: action.payload.error,
                otpRequired: action.payload.otpRequired || false // Set OTP requirement if login failed due to OTP
            };
            break;
        
        case authconstant.OTP_REQUEST:
            state = {
                ...state,
                loading: true,
                error: null,
                message: ''
            };
            break;
        
        case authconstant.OTP_REQUEST_SUCCESS:
            state = {
                ...state,
                loading: false,
                otpRequired: true, // OTP is now required
                message: action.payload.message
            };
            break;
        
        case authconstant.OTP_REQUEST_FAILURE:
            state = {
                ...state,
                loading: false,
                error: action.payload.error
            };
            break;
        
        case authconstant.OTP_VERIFICATION_REQUEST:
            state = {
                ...state,
                loading: true,
                error: null
            };
            break;
        
        case authconstant.OTP_VERIFICATION_SUCCESS:
            state = {
                ...state,
                token: action.payload.token,
                user: action.payload.user,
                authenticate: true,
                loading: false,
                otpRequired: false, // OTP verified, no longer required
                error: null
            };
            break;
        
        case authconstant.OTP_VERIFICATION_FAILURE:
            state = {
                ...state,
                loading: false,
                error: action.payload.error
            };
            break;
        
        case authconstant.LOGOUT_REQUEST:
            state = {
                ...state,
                loading: true
            };
            break;
        
        case authconstant.LOGOUT_SUCCESS:
            state = {
                ...initState
            };
            break;
        
        case authconstant.LOGOUT_FAILURE:
            state = {
                ...state,
                error: action.payload.error,
                loading: false
            };
            break;

        default:
            return state;
    }
    return state;
};
