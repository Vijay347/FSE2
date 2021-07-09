import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';
import { SignIn, SignUp } from '../models/user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userBehaviourSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public userSubject$ = this.userBehaviourSubject.asObservable();

  constructor(private router: Router) {
    // if (this.userBehaviourSubject.value == undefined || this.userBehaviourSubject.value == null) {
    //   if (sessionStorage.getItem('currentUser')) {
    //     this.userBehaviourSubject.next(JSON.parse(sessionStorage.getItem('currentUser')));
    //   }
    //   else
    //     this.userBehaviourSubject.next(null);
    // }
  }

  async loginWithCognito(userDet: SignIn): Promise<boolean> {
    try {
      let user = await Auth.signIn(userDet.email, userDet.password);
      let tokens = user.signInUserSession;
      if (tokens != null) {
        console.log('User authenticated');
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async registerWithCognito(userDet: SignUp): Promise<boolean> {
    try {
      const user = await Auth.signUp({
        username: userDet.email,
        password: userDet.password,
        attributes: {
          email: userDet.email,
          given_name: userDet.attributes.given_name,
          family_name: userDet.attributes.family_name
        }
      });
      console.log({ user });
      return true;
    } catch (error) {
      console.log('error signing up:', error);
      return false;
    }
  }
}
