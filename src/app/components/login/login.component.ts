import { Component, inject } from '@angular/core';
import { UserDumpData, UserService } from '../../service/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private userService: UserService = inject(UserService);
  private _approvedCredentials: boolean = true;
  userDumpData: UserDumpData = {
    email: '',
    password: ''
  }

  login(): void {
    this.userService.login(this.userDumpData).subscribe(
      never => this._approvedCredentials = true,
      error => this._approvedCredentials = false
    );
  }

  get approvedCredentials(): boolean {
    return this._approvedCredentials;
  }

}
