import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:9090/';

class UserService {
  getUsers() {
    return axios.get(API_URL + 'users');
  }

  getUserDetails(user: User) {
    return axios.get(API_URL + 'user.' + user.id, { headers: authHeader() });
  }

  updateUserDetails(user: User) {
    return axios.patch(API_URL + 'user.' + user.id, { headers: authHeader() });
  }  

}

export default new UserService();