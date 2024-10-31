import { combineReducers } from "redux";
import authReducers from "./auth.reducers";
import userReducer from './user.reducer';

const rootReducer =combineReducers({
    auth:authReducers,
    user:userReducer
})

export default rootReducer;