import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router, NavigationEnd, RouterEvent, NavigationError, NavigationCancel } from '@angular/router';
import { Auth } from 'aws-amplify';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public loggerUser: any = null;
  public isUserLoggedIn: boolean = false;

  constructor(private authService: AuthService,
    private router: Router, private spinner: NgxSpinnerService) {

    this.router.events
      .subscribe(
        (event: RouterEvent) => {
          if (event instanceof NavigationStart) {
            this.spinner.show();
            Auth.currentUserInfo().then((x: any) => {
              this.loggerUser = x;
            });
            Auth.currentAuthenticatedUser().then((x: any) => {
              this.isUserLoggedIn = true;
            }).catch(err => { this.isUserLoggedIn = false; });
          }
          if (event instanceof NavigationEnd) {
            setTimeout(() => {
              this.spinner.hide();
            }, 500);
          }
          if (event instanceof NavigationCancel) {
            setTimeout(() => {
              this.spinner.hide();
            }, 500);
          }
          if (event instanceof NavigationError) {
            setTimeout(() => {
              this.spinner.hide();
            }, 500);
          }
        });

    // this.router.events.pipe(
    //   filter(event => event instanceof NavigationStart)
    // ).subscribe((event: NavigationStart) => {
    //   Auth.currentUserInfo().then((x: any) => {
    //     this.loggerUser = x;
    //   });
    //   Auth.currentAuthenticatedUser().then((x: any) => {
    //     this.isUserLoggedIn = true;
    //   }).catch(err => { this.isUserLoggedIn = false; });
    // });
  }

  ngOnInit() {

  }

  signout(event: Event) {
    event.preventDefault();
    this.authService.signOut().then((res: boolean) => {
      if (res) {
        this.loggerUser = null;
        this.router.navigate(['signin']);
      }
    });
  }
}
