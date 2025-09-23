import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { BehaviorSubject, ignoreElements, map, Observable, tap } from 'rxjs';
import { sha512 } from 'js-sha512';
import { environment } from '../environment/environment-development';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private isLogged: BehaviorSubject<boolean>  = new BehaviorSubject(false);
  private userData: BehaviorSubject<UserData> = new BehaviorSubject({ email: "", id: 0, name: "" });
  private httpClient: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
  private BASE_URL: string = environment.PHP_BACKEND_URL;
  isLogged$ = this.isLogged.asObservable();
  userData$ = this.userData.asObservable();

  constructor() { }

  public login(user: UserDumpData): Observable<never> {

    const userDumpData: UserDumpData = { email: user.email, password: sha512(user.password) };

    return this.httpClient.post<UserData>(`${this.BASE_URL}/login`, userDumpData, { withCredentials: true }).pipe(map(
      userData => {
        this.isLogged.next(true);
        this.userData.next(userData);
        this.router.navigate(['/admin']);
      }
    ),
    ignoreElements()
    );
  }

  validateSession(): Observable<true | UrlTree> {

    return this.httpClient.post<ValidationResponse>(`${this.BASE_URL}/validateSession`, {}, { withCredentials: true }).pipe(
      map(response => {

        if (response.approval) {

          this.isLogged.next(true);
          this.userData.next(response.userInformation!);
          return true;

        } else return this.router.parseUrl('/login');

      })
    );

  }

  validateLoginEntrance(): Observable<true | UrlTree> {

    return this.httpClient.post<ValidationResponse>(`${this.BASE_URL}/validateSession`, {}, { withCredentials: true }).pipe(
      map(response => {

        if (response.approval) {

          this.isLogged.next(true);
          this.userData.next(response.userInformation!);
          return this.router.parseUrl('/admin');

        } else return true;

      })
    );

  }

  public logout() {
    return this.httpClient.get<any>(`${this.BASE_URL}/logout`, { withCredentials: true }).pipe(
      tap(() => {
        this.isLogged.next(false);
        this.userData.next({ email: "", id: 0, name: "" });
        this.router.navigate(['/login']);
      })
    );
  }

}

type ValidationResponse = {
  approval: boolean,
  userInformation?: UserData
}

export type UserDumpData = {
  email: string,
  password: string
}

export type UserData = { 
  id: number,
  name: string,
  email: string
}