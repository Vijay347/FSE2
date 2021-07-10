import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';
import { SignIn, SignUp } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {

  }

  async loginWithCognito(userDet: SignIn): Promise<boolean> {
    try {
      let user = await Auth.signIn(userDet.email, userDet.password);
      let tokens = user.signInUserSession;
      if (tokens != null) {
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

  async signOut(): Promise<boolean> {
    try {
      await Auth.signOut();
      return true;
    } catch (error) {
      console.log('error signing out: ', error);
      return false;
    }
  }
}
