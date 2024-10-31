import { authconstant } from "../constants";

const initialState = {
    token: null,
    user: {
        nmae: '',
    },
    authenticate: false,
    authenticating: false,
    loading: false,
    error: null,
    message: '',
}

export default (state = initialState, action) => {
    switch (action.type) {
        case authconstant.LOGIN_REQUEST:
            state = {
                ...state,
                authenticating: true,
            }
            break;
        case authconstant.LOGIN_SUCCESS:
            state = {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                authenticate: true,
            }
            break;
        case authconstant.LOGIN_FAILURE:
            state = {
                ...state,
                error: action.payload.error,
                loading: false,
            }
            break;
        case authconstant.LOGOUT_REQUEST:
            state = {
                ...state,
                loading: true,
            }
            break;
        case authconstant.LOGOUT_SUCCESS:
            state = {
                ...initialState,
            }
            break;
        case authconstant.LOGOUT_FAILURE:
            state = {
                ...state,
                error: action.payload.error,
                loading: false,
            }
            break;
    }
    return state;
}
