import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import User from 'src/app/model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  currentUser: User | undefined;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) { }

  async ngOnInit(): Promise<void> {
    this.currentUser = await this.authService.getCurrentUser();
   
  }

  onSubmit(): void {
    const user: User = this.form;

    this.authService.login(user);
    this.router.navigate(["/profile"]);
  }
}