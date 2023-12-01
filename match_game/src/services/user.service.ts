import authHeader from './auth-header';
import User from "../model/user";

const API_URL = 'http://localhost:9090/';

class UserService {
  getUsers() {
    return fetch(API_URL + 'users', {
      headers: authHeader(),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 403) {
          // Handle unauthorized access
          console.error('Unauthorized access to getUsers');
          return null;
        } else {
          // Handle other error cases
          console.error('Error in getUsers:', response.statusText);
          return null;
        }
      });
  }

  getUserDetails(id: string) {
    return fetch(API_URL + 'users/' + id, {
      headers: authHeader(),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 403) {
          // Handle unauthorized access
          console.error('Unauthorized access to getUserDetails');
          return null;
        } else {
          // Handle other error cases
          console.error('Error in getUserDetails:', response.statusText);
          return null;
        }
      });
  }

  updateUserDetails(user: User) {
    return fetch(API_URL + 'users/' + user.id, {
      method: 'PATCH',
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 403) {
          // Handle unauthorized access
          console.error('Unauthorized access to updateUserDetails');
          return null;
        } else {
          // Handle other error cases
          console.error('Error in updateUserDetails:', response.statusText);
          return null;
        }
      });
  }
}

export default new UserService();
