import { AppError } from "@utils/AppError";
import axios, { AxiosInstance } from "axios";

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
    registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

const api = axios.create({
    baseURL: 'http://10.50.0.124:3333',
    timeout: 6000,
}) as APIInstanceProps;

api.registerInterceptTokenManager = signOut => {
    const interceptTokenManager = api.interceptors.response.use(response => response, requestError => {
        if (requestError.response && requestError.response.data) {//se é uma mensagem tratada dentro do backend
            return Promise.reject(new AppError(requestError.response.data.message));//pega a mensagem de erro do backend definido la
        } else { //se não
            return Promise.reject(requestError); //erro no servirdor
        }
    })

    return () => {
        api.interceptors.response.eject(interceptTokenManager)
    }
}





export { api };