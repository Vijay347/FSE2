import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './components/auth/signin/signin.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { ListCompaniesComponent } from './components/list-companies/list-companies.component';
import { UnAuthorizedComponent } from './components/un-authorized/un-authorized.component';
import { AuthActivateGuardService } from './guards/auth-activate-guard.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'signin' },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'signin',
    component: SigninComponent,
    canActivate: [AuthActivateGuardService]
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [AuthActivateGuardService]
  },
  {
    path: 'list-companies',
    component: ListCompaniesComponent
  },
  {
    path: 'un-authorized',
    component: UnAuthorizedComponent
  },
  { path: '**', redirectTo: 'home' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
