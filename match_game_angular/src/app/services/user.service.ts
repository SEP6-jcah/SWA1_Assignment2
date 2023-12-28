import { Injectable } from "@angular/core";
import User from "../model/user";

const API_URL = 'http://localhost:9090/';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  async getUsers(userSession: string) {
    const userToken = (JSON.parse(userSession) as { token: string })?.token;
    const response = await fetch(API_URL + 'users?token=' + userToken);
    if (response.ok) {
      return response.json();
    } else if (response.status === 403) {
      console.error('Unauthorized access to getUsers');
      return null;
    } else {
      console.error('Error in getUsers:', response.statusText);
      return null;
    }
  }

  async getUserDetails(userSession: string | null) {
    if (userSession == null) {
      console.log("User session invalid")
      return null;
    }
    
    const userId = (JSON.parse(userSession) as { userId: number })?.userId;
    const userToken = (JSON.parse(userSession) as { token: string })?.token;
  
    const response = await fetch(API_URL 
      + 'users/' + userId 
      + '?token=' + userToken);
  
    if (response.ok) {
      return response.json();
    } else if (response.status === 403) {
      console.error('Unauthorized access to getUserDetails');
      return null;
    } else {
      console.error('Error in getUserDetails:', response.statusText);
      return null;
    }
  }

  async updateUserDetails(user: User, userSession: string) {
    const userToken = (JSON.parse(userSession) as { token: string })?.token;
    const response = await fetch(API_URL + 'users/' + user.id + '?token=' + userToken, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (response.ok) {
      return user;
    } else if (response.status === 403) {
      console.error('Unauthorized access to updateUserDetails');
      return null;
    } else {
      console.error('Error in updateUserDetails:', response.statusText);
      return null;
    }
  }
}