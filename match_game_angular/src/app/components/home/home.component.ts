import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import User from 'src/app/model/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentUser?: User;

  constructor(private router: Router, private authService: AuthService) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
    if(!this.currentUser){
      this.router.navigate(['/login']);
    }
  }
}