import { authconstant } from "../actions/constants"

const initState ={
    token:null,
    user:{
        firstname: "",
        lastname: "",
        email: "",
        picture:""
    },
    authenticate :false,
    authenticating:false,
    loading:false,
    error:null,
    message:''
}

export default (state =initState ,action)=>{

    console.log(action);

    switch(action.type){
        case authconstant.LOGIN_REQUEST:
            state={
                ...state,
                authenticating:true
            }
            break;
        case authconstant.LOGIN_SUCCESS:
            state={
                ...state,
                user:action.payload.user,
                token:action.payload.token,
                
                authenticate:true,
                authenticating:false
            }
            console.log('action.payload',action.payload.token);
            break;
        case authconstant.LOGIN_FAILURE:
            state={
                ...state,
                authenticating:false
            }
            break;
        case authconstant.LOGOUT_REQUEST:
            state={
                ...state,
                loading:true
            }
            break;
        case authconstant.LOGOUT_SUCCESS:
            state={
                ...initState,
                
            }
            break;
        case authconstant.LOGOUT_FAILURE:
            state={
                ...state,
                error:action.payload.error,
                loading:false
            }
            break;
    }
    return state;
}