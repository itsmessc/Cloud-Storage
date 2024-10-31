import axiosinstance from "../helpers/axios";
import { authconstant } from "./constants";

export const login = (user) => {
    return async (dispatch) => {
        dispatch({
            type: authconstant.LOGIN_REQUEST
        });

        try {
            const response = await axiosinstance.post('/users/admin/signin', user);

            if (response.status === 200) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                dispatch({
                    type: authconstant.LOGIN_SUCCESS,
                    payload: {
                        token,
                        user
                    }
                });
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
        const res =await axiosinstance.post('/users/admin/signout')
        if(res.status===200){
            localStorage.clear();
            dispatch({
                type: authconstant.LOGOUT_SUCCESS
            })
        }
        else{
            dispatch({
                type: authconstant.LOGOUT_FAILURE,
                payload:{error: res.data.error}
            })
        }
    }
}