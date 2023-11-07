class User {
    username: string;
    password: string;
    id: number;
    admin: boolean;
  
    constructor(username: string, password: string, id: number, admin: boolean) {
      this.username = username;
      this.password = password;
      this.id = id;
      this.admin = admin;
    }
  }
