import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FormalidationService {

    patternValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (!control.value) {
                return null;
            }
            const regex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$');
            const valid = regex.test(control.value);
            return valid ? null : { invalidPassword: true };
        };
    }

    MatchPassword(password: string, confirmPassword: string) {
        return (formGroup: FormGroup) => {
            const passwordControl = formGroup.controls[password];
            const confirmPasswordControl = formGroup.controls[confirmPassword];

            if (!passwordControl || !confirmPasswordControl) {
                return null;
            }

            if (confirmPasswordControl.errors && !confirmPasswordControl.errors.passwordMismatch) {
                return null;
            }

            if (passwordControl.value !== confirmPasswordControl.value) {
                confirmPasswordControl.setErrors({ passwordMismatch: true });
            } else {
                confirmPasswordControl.setErrors(null);
            }
        }
    }

    userNameValidator(userControl: AbstractControl) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (this.validateUserName(userControl.value)) {
                    resolve({ userNameNotAvailable: true });
                } else {
                    resolve(null);
                }
            }, 1000);
        });
    }

    validateUserName(userName: string) {
        const UserList = ['ankit', 'admin', 'user', 'superuser'];
        return (UserList.indexOf(userName) > -1);
    }

    validateCompanyCode(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            if (!control.value) {
                return of(null);
            }

            if (this.validateCompanyCodeService(control.value)) {
                return of({ companyNotAvailable: true });
            } return of(null);
        };
    }

    validateCompanyCodeService(companyCode: string) {
        const CompanyCodeList = ['CTS', 'TCS', 'WIPRO'];
        return (CompanyCodeList.indexOf(companyCode) > -1);
    }

    companyTurnoverValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const v = +control.value;

            if (isNaN(v)) {
                return { 'gte': true, 'requiredValue': 1 }
            }

            if (v <= 100000000) {
                return { 'gte': true, 'requiredValue': 1 }
            }

            return null;
        };
    }

    stockPriceValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const v = +control.value;

            if (isNaN(v)) {
                return { 'notvalid': true }
            }
            
            let r = new RegExp(/^-?[0-9]\d*(\.\d+)$/);
            if (!r.test(v.toString())) {
                return { 'notvalid': true }
            }

            return null;
        };
    }
} 