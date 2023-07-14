import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RequestPasswordResetResponse {
  usernameOrEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private _resetPasswordUUID$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public resetPasswordUUID$: Observable<string> = this._resetPasswordUUID$.asObservable();

  constructor(private http: HttpClient) {}

  requestPasswordReset(usernameOrEmail: string) {
    return this.http.post<RequestPasswordResetResponse>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/registration/requestPasswordReset', { usernameOrEmail });
  }

  validatePasswordReset(data) {
    return this.http.post('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/registration/validateResetPassword', { uuid: data }, { observe: 'response' });
  }

  resetPassword(data, token) {
    const newPassword = { password: data };
    const headers = new HttpHeaders({ Authorization: token });

    return this.http.post<any>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/user/resetPassword', newPassword, { headers, responseType: 'text' as 'json' });
  }

  changePassword(data) {
    return this.http.post<any>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/user/changePassword', data, { responseType: 'text' as 'json' });
  }

  updateState(data) {
    this._resetPasswordUUID$.next(data);
  }
}
