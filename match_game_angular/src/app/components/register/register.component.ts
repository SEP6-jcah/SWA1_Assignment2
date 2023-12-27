import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import User from 'src/app/model/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: any = {
    username: null,
    password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService) { }

  async onSubmit(): Promise<void> {
    const user: User = this.form;

    const response = await this.authService.register(user);
    if(response){
      this.isSuccessful = true;
    }else{
      this.isSignUpFailed = true;
    }
  }
}