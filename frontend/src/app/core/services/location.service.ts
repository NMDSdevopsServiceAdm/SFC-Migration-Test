import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationSearchResponse } from '@core/model/location.model';
import { Observable } from 'rxjs';

@Injectable()
export class LocationService {
  constructor(private http: HttpClient) {}

  public getLocationByPostCode(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/locations/pc/${id}`);
  }

  public getLocationByLocationId(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/locations/lid/${id}`);
  }

  public getAddressesByPostCode(postcode: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/postcodes/${postcode}`);
  }

  public getUnassignedLocationByPostCode(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/locations/pc/matching/${id}`);
  }

  public getUnassignedLocationByLocationId(id: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/locations/lid/matching/${id}`);
  }

  public getLocationByPostcodeOrLocationID(postcodeOrLocationID: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/locations/pcorlid/${postcodeOrLocationID}`);
  }

  public getUnassignedLocationByPostcodeOrLocationID(postcodeOrLocationID: string): Observable<LocationSearchResponse> {
    return this.http.get<LocationSearchResponse>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/locations/pcorlid/matching/${postcodeOrLocationID}`);
  }
}
