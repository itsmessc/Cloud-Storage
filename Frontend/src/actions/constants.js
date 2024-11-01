export const authconstant = {
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT_REQUEST: 'LOGOUT_REQUEST',
    LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
    LOGOUT_FAILURE: 'LOGOUT_FAILURE',
    
    // New OTP-related constants
    OTP_REQUEST: 'OTP_REQUEST', // Action when requesting an OTP
    OTP_REQUEST_SUCCESS: 'OTP_REQUEST_SUCCESS', // OTP sent successfully
    OTP_REQUEST_FAILURE: 'OTP_REQUEST_FAILURE', // OTP send failed
    OTP_VERIFICATION_REQUEST: 'OTP_VERIFICATION_REQUEST', // Action when verifying OTP
    OTP_VERIFICATION_SUCCESS: 'OTP_VERIFICATION_SUCCESS', // OTP verified successfully
    OTP_VERIFICATION_FAILURE: 'OTP_VERIFICATION_FAILURE', // OTP verification failed
};

export const userConstants = {
    USER_REGISTER_REQUEST: 'USER_REGISTER_REQUEST',
    USER_REGISTER_SUCCESS: 'USER_REGISTER_SUCCESS',
    USER_REGISTER_FAILURE: 'USER_REGISTER_FAILURE',
    
    // You may also add OTP-related constants here if OTP is part of user registration flow
};
