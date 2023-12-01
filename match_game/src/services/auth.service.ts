import User from "../model/user";

const API_URL = "http://localhost:9090/";

class AuthService {

  //TODO: maybe call login after a succesful register so the user
  //to update sessionStorage. Otherwise User has to manually login after register
  async register(user: User) {
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    };

    const response = await fetch(API_URL + 'users', requestOptions);
    const data = await response.json();

    if (data.accessToken) {
      localStorage.setItem("user", JSON.stringify(data));
    }

    return data;
  }

  async login(user: User) {
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    };

    const response = await fetch(API_URL + 'login', requestOptions);
    const data = await response.json();

    sessionStorage.setItem('user', JSON.stringify(data));
    return data;
  }

  async logout() {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token");
      return null;
    }

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    };

    const response = await fetch(API_URL + 'logout?token=' + encodeURIComponent(token), requestOptions);
    const data = await response.json();

    if (data.accessToken) {
      localStorage.setItem("user", JSON.stringify(data));
    }

    return data;
  }


  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);

    return null;
  }
}

export default new AuthService();
