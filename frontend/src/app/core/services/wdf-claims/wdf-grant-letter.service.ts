import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GrantLetter } from '@core/model/wdf-claims/wdf-grant-letter.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GrantLetterService {
  constructor(private http: HttpClient) {}

  public sendEmailGrantLetter(establishmentId: string, grantLetter: string): Observable<GrantLetter> {
    return this.http.post<GrantLetter>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/establishment/${establishmentId}/wdfClaims/grantLetter`, grantLetter);
  }
}