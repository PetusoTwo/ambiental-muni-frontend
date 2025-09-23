import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { inject } from '@angular/core';

export const LoginGuard: CanActivateFn = (route, state) => {

  const userService: UserService = inject(UserService);

  return userService.validateLoginEntrance();
  
};
