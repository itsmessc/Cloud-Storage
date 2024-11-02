import axiosinstance from "../helpers/axios";
import { authconstant } from "./constants";



export const login = (user) => {
    return async (dispatch) => {
        dispatch({
            type: authconstant.LOGIN_REQUEST
        });

        try {
            const response = await axiosinstance.post('/api/auth/login', user);

            if (response.status === 200) {
                const { token, user, otpRequired } = response.data;

                if (otpRequired) {
                    // Don't store token until OTP is verified
                    return { otpRequired: true };
                } else {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    dispatch({
                        type: authconstant.LOGIN_SUCCESS,
                        payload: {
                            token,
                            user
                        }
                    });
                }
            } else {
                dispatch({
                    type: authconstant.LOGIN_FAILURE,
                    payload: {
                        error: response.data.message || 'Login failed'
                    }
                });
            }
        } catch (error) {
            console.error('Login error:', error);

            dispatch({
                type: authconstant.LOGIN_FAILURE,
                payload: {
                    error: 'Server error. Please try again.'
                }
            });
        }
    };
};



export const isUserLoggedin = () =>{
    return async dispatch =>{
        const token = localStorage.getItem('token');
        if(token){
            const user = JSON.parse(localStorage.getItem('user'));
            dispatch({
                type: authconstant.LOGIN_SUCCESS,
                payload:{
                    token,user
                }
            });
            }else{
                dispatch({
                    type: authconstant.LOGIN_FAILURE,
                    payload:{
                        error: 'Login failed'
                    }
                });
            }
    }
}

export const Signout = ()=>{
    return async dispatch=>{
        dispatch({
            type: authconstant.LOGOUT_REQUEST
        })
        // const res =await axiosinstance.post('/users/admin/signout')
        
            localStorage.clear();
            dispatch({
                type: authconstant.LOGOUT_SUCCESS
            })
        
        
    }
}
export const requestOtp = (email) => {
    return async (dispatch) => {
        try {
            const response = await axiosinstance.post('/api/user/sendOTP', { email });
            if (response.status === 200) {
                dispatch({
                    type: authconstant.OTP_REQUEST_SUCCESS,
                    payload: { message: response.data.message }
                });
            }
        } catch (error) {
            console.error('Error requesting OTP:', error);
            dispatch({
                type: authconstant.OTP_REQUEST_FAILURE,
                payload: { error: 'Failed to send OTP. Please try again.' }
            });
        }
    };
};

export const verifyOtp = (data) => {
    return async (dispatch) => {
        try {
            const response = await axiosinstance.post('/api/user/validateotp', data);
            if (response.status === 200) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                dispatch({
                    type: authconstant.LOGIN_SUCCESS,
                    payload: { token, user }
                });
            } else {
                dispatch({
                    type: authconstant.OTP_VERIFICATION_FAILURE,
                    payload: { error: 'Invalid OTP' }
                });
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            dispatch({
                type: authconstant.OTP_VERIFICATION_FAILURE,
                payload: { error: 'Server error. Please try again.' }
            });
        }
    };
};

export const validateotp = (data) => {
    return async (dispatch) => {
        try {
            const response = await axiosinstance.post('/api/user/verifyotp', data);
            if (response.status === 200) {
               return response;
            } else {
                dispatch({
                    type: authconstant.OTP_VERIFICATION_FAILURE,
                    payload: { error: 'Invalid OTP' }
                });
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            dispatch({
                type: authconstant.OTP_VERIFICATION_FAILURE,
                payload: { error: 'Server error. Please try again.' }
            });
        }
    };
};