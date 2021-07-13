import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Amplify, { Auth } from 'aws-amplify';
import { SigninComponent } from './components/auth/signin/signin.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { UnAuthorizedComponent } from './components/un-authorized/un-authorized.component';
import { environment } from 'src/environments/environment';
import { AuthActivateGuardService } from './guards/auth-activate-guard.service';
import { ListCompaniesComponent } from './components/list-companies/list-companies.component';

Amplify.configure({
  Auth: environment.awsCognitoSettings
});


@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SignupComponent,
    HomeComponent,
    UnAuthorizedComponent,
    ListCompaniesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MDBBootstrapModule.forRoot()
  ],
  providers: [AuthActivateGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
