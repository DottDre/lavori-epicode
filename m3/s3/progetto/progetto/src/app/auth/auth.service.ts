import { Injectable } from '@angular/core';
import { Users } from '../models/users';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { Login } from '../models/login';
import { JwtHelperService } from '@auth0/angular-jwt';

type AccessData = {
  accessToken:string,
  user: Users
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  jwtHelper: JwtHelperService =new JwtHelperService()

  authSubject = new BehaviorSubject<Users|null>(null)

  user$ = this.authSubject.asObservable()
  isLoggedIn$ = this.user$.pipe(map(user => !!user))

  constructor(
    private http:HttpClient,
    private router: Router
  ){}
    registerUrl:string = environment.registerUrl
    loginUrl:string = environment.loginUrl

    register(newUser:Partial<Users>):Observable<AccessData>{
      return this.http.post<AccessData>(this.registerUrl,newUser)
    }

    login(loginData:Login):Observable<AccessData>{
      return this.http.post<AccessData>(this.loginUrl,loginData)
      .pipe(tap(d =>{
        this.authSubject.next(d.user)
        localStorage.setItem('accessData',JSON.stringify(d))
        //this.autoLogout(d.accessToken)
      }))
    }

    logout(){
      this.authSubject.next(null)
      localStorage.removeItem('accessData')
      this.router.navigate(['/auth/login'])
    }

    autoLogout(jwt:string){
      const expDate = this.jwtHelper.getTokenExpirationDate(jwt) as Date;
      const expMS = expDate.getTime() - new Date().getTime()


      setTimeout(()=>{
        this.logout()
      },expMS)
    }
    restoreUser(){

      const userJson = localStorage.getItem('accessData')
      if(!userJson) return;

      const accessData:AccessData = JSON.parse(userJson)
      if(this.jwtHelper.isTokenExpired(accessData.accessToken)) return;


      this.authSubject.next(accessData.user)
      this.autoLogout(accessData.accessToken)

    }
    isLoggedIn(){
      return false
    }

}


