import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from '../../services/user.service';
import User from 'src/app/model/user';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | undefined;
  bioUpdateError: string;
  isEditingBio: boolean;

  constructor(private authService: AuthService, private userService: UserService) {
    this.bioUpdateError = '';
    this.isEditingBio = false;
  }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
  }

  handleEditBioToggle() {
    this.isEditingBio = !this.isEditingBio;
  }

  async handleUpdateBio() {
    try {
      const updatedUserData = await this.userService.updateUserDetails(
        this.currentUser!,
        sessionStorage['user']
      );

      if (updatedUserData) {
        this.isEditingBio = false;
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      this.bioUpdateError = 'An unexpected error occurred';
    }
  }
}
