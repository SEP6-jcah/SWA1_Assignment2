import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.isLoggedIn = sessionStorage['user'] ?  true : false;

    document.addEventListener('logout', this.logout);
  }

  ngOnDestroy() {
    document.removeEventListener('logout', this.logout)
  }

  logout(): void {
    this.authService.logout();
    sessionStorage.clear();
    window.location.reload();
  }
}