import axiosinstance from "../helpers/axios";
import { userConstants } from "./constants";




export const signup = (user) => {
    return async (dispatch) => {
        dispatch({
            type: userConstants.USER_REGISTER_REQUEST
        });

        try {
            const response = await axiosinstance.post('/api/auth/register', user);

            if (response.status === 201) {
                const { message } = response.data;

                dispatch({
                    type: userConstants.USER_REGISTER_SUCCESS,
                    payload: {
                        message
                    }
                });
                navigator.navigate('/');
            } else {
                dispatch({
                    type: userConstants.USER_REGISTER_FAILURE,
                    payload: {
                        error: response.data.message || 'Login failed'
                    }
                });
            }
        } catch (error) {
            console.error('Login error:', error);

            dispatch({
                type: userConstants.USER_REGISTER_FAILURE,
                payload: {
                    error: 'Server error. Please try again.'
                }
            });
        }
    };
};
