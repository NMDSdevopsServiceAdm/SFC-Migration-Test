import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationAddress } from '@core/model/location-address.model';
import { RegistrationModel } from '@core/model/registration.model';
import { WorkplaceService } from '@core/model/workplace-service.model';
import { LoginApiModel } from '@core/model/loginApi.model';
import { SecurityDetails } from '@core/model/security-details.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  public registration$: BehaviorSubject<RegistrationModel> = new BehaviorSubject(null);
  public locationAddresses$: BehaviorSubject<Array<LocationAddress>> = new BehaviorSubject(null);
  public selectedLocationAddress$: BehaviorSubject<LocationAddress> = new BehaviorSubject(null);
  public selectedWorkplaceService$: BehaviorSubject<WorkplaceService> = new BehaviorSubject(null);
  public createCredentials$: BehaviorSubject<LoginApiModel> = new BehaviorSubject(null);
  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private router: Router) {}

  postRegistration(id: any) {
    this.http.post<RegistrationModel>('/api/registration/', id.locationdata).subscribe(
      data => console.log(data),
      error => console.log(error),
      () => {
        this.router.navigate(['/registration/complete']);
      }
    );
  }

  getLocationByPostCode(id: string) {
    return this.http.get<RegistrationModel>(`/api/locations/pc/${id}`);
  }

  getLocationByLocationId(id: string) {
    return this.http.get<RegistrationModel>(`/api/locations/lid/${id}`);
  }

  public getAddressByPostCode(postcode: string): Observable<RegistrationModel> {
    return this.http.get<RegistrationModel>(`/api/postcodes/${postcode}`);
  }

  getUpdatedAddressByPostCode(postcode: string) {
    return this.http.get<RegistrationModel>(`/api/postcodes/${postcode}`);
  }

  public getServicesByCategory(isRegulated: boolean) {
    return this.http.get(`/api/services/byCategory?cqc=${isRegulated}`);
  }

  getUsernameDuplicate(id: string) {
    return this.http.get(`/api/registration/username/${id}`);
  }

  public updateState(data): void {
    this.registration$.next(data);
  }

  public isRegulated(location: LocationAddress): boolean {
    return location.isRegulated === true || location.locationId ? true : false;
  }
}
