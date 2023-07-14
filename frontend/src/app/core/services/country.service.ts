import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  constructor(private http: HttpClient) {}

  getCountries(): Observable<CountryResponse[]> {
    return this.http.get<any>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/country').pipe(map(res => res.countries));
  }
}

export interface CountryResponse {
  id: number;
  country: string;
}
