import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify';
import { Router } from '@angular/router';
import { CognitoUser, SignIn, SignUp } from '../models/user.model';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private refreshTokenTimeout;

  constructor(private router: Router) {

  }

  async loginWithCognito(userDet: SignIn): Promise<boolean> {
    try {
      let user = await Auth.signIn(userDet.email, userDet.password);
      let tokens = user.signInUserSession;
      if (tokens != null) {
        this.startRefreshTokenTimer();
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
      this.stopRefreshTokenTimer();
      return true;
    } catch (error) {
      console.log('error signing out: ', error);
      return false;
    }
  }

  async refreshToken() {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const { refreshToken } = cognitoUser.getSignInUserSession();
      cognitoUser.refreshSession(refreshToken, (err, session) => {
        const { idToken, refreshToken, accessToken } = session;
      });
    } catch (e) {
      console.log('Unable to refresh Token', e);
    }
  }

  public startRefreshTokenTimer() {
    Auth.currentAuthenticatedUser().then((x: CognitoUser) => {
      if (x) {
        const jwtToken = JSON.parse(atob(x.signInUserSession.accessToken.jwtToken.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => from(this.refreshToken()).subscribe(), timeout);
      }
    });
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
