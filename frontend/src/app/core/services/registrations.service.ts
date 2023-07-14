import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Note,
  Registration,
  Registrations,
  UpdateRegistrationStatusRequest,
  UpdateWorkplaceIdRequest,
} from '@core/model/registrations.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationsService {
  constructor(private http: HttpClient) {}

  public getRegistrations(status: string): Observable<Registrations[]> {
    return this.http.get<Registrations[]>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/registrations/${status}`);
  }

  public getSingleRegistration(establishmentUid: string): Observable<Registration> {
    return this.http.get<Registration>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/registrations/status/${establishmentUid}`);
  }

  public updateWorkplaceId(data: UpdateWorkplaceIdRequest): Observable<any> {
    return this.http.post<any>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/registrations/updateWorkplaceId`, data);
  }

  public updateRegistrationStatus(data: UpdateRegistrationStatusRequest): Observable<any> {
    return this.http.post<any>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/registrations/updateRegistrationStatus`, data);
  }

  public registrationApproval(data: object) {
    return this.http.post<any>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/approval/', data);
  }

  public unlockAccount(data: object) {
    return this.http.post<any>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/unlock-account/', data);
  }

  public addRegistrationNote(data: object): Observable<any> {
    return this.http.post<any>(
      'https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/registrations/addRegistrationNote',
      data,
    );
  }

  public getRegistrationNotes(establishmentUid: string): Observable<Note[]> {
    return this.http.get<any>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/registrations/getRegistrationNotes/${establishmentUid}`);
  }
}
