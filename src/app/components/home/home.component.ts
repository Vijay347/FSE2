import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    Auth.currentUserInfo().then((x:any) => {
      console.log(x);
    });

    Auth.currentSession().then((x:any) => {
      console.log(x);
    });

  }

}
