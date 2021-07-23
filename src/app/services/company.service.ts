import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Constants } from '../constants';
import { CompanyDetails } from '../models/company.model';

@Injectable()
export class CompanyService {

  constructor(@Inject("gatewayAPIRoot") private GATEWAY_API_ROOT, private http: HttpClient) { }

  public getAllCompanies(): Observable<CompanyDetails[]> {
    let url = `${this.GATEWAY_API_ROOT}/${Constants.CompanyGatewayEndpoints.getAllCompaniesEndpoint}`;
    return this.http.get<CompanyDetails[]>(url).pipe(map(this.extractResult), catchError(this.handleError));
  }

  public getCompany(code: any): Observable<CompanyDetails> {
    let url = `${this.GATEWAY_API_ROOT}/${Constants.CompanyGatewayEndpoints.getCompanyEndpoint}/${code}`;
    return this.http.get<CompanyDetails>(url).pipe(map(this.extractResult), catchError(this.handleError));
  }

  public addCompany(company: CompanyDetails): Observable<CompanyDetails> {
    let url = `${this.GATEWAY_API_ROOT}/${Constants.CompanyGatewayEndpoints.addCompanyEndpoint}`;
    return this.http.post<CompanyDetails>(url, JSON.stringify(company)).pipe(map(this.extractResult), catchError(this.handleError));
  }

  public deleteCompany(code: any): Observable<CompanyDetails> {
    let url = `${this.GATEWAY_API_ROOT}/${Constants.CompanyGatewayEndpoints.deleteCompanyEndpoint}/${code}`;
    return this.http.delete<CompanyDetails>(url).pipe(map(this.extractResult), catchError(this.handleError));
  }

  private extractResult(result: any) {
    return result || {};
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent)
      console.error('An error occured', error.error.message);
    else
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    return throwError('Something bad happened; please try again.');
  }
}
