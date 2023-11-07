import axios from "axios";
import User from "../model/user"

const API_URL = "http://localhost:9090/";

class AuthService {
    
    register(user: User) {
      return axios.post(API_URL + "users", {user})
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
    }

    login(user: User) {
        return axios.post(API_URL + "login", {user})
        .then(response => {
          if (response.data.accessToken) {
            localStorage.setItem("user", JSON.stringify(response.data));
          }
          return response.data;
        });
    }

    logout() {
        return axios.post(API_URL + "logout?=" + localStorage.getItem("token"))
          .then(response => {
            if (response.data.accessToken) {
              localStorage.setItem("user", JSON.stringify(response.data));
            }
            return response.data;
          });
      }


    getCurrentUser() {
        const userStr = localStorage.getItem("user");
        if (userStr) return JSON.parse(userStr);

        return null;
    }
}

export default new AuthService();