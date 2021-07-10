import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Auth } from 'aws-amplify';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public loggerUser: any = null;
  constructor(private authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      Auth.currentUserInfo().then((x: any) => {
        this.loggerUser = x;
      });
      Auth.currentSession().then((x: any) => {
      console.log(x);
      });
    });
  }
  ngOnInit(): void {

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
