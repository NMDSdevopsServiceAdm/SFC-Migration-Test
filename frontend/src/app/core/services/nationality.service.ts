import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Nationality, NationalityResponse } from '@core/model/nationality.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NationalityService {
  constructor(private http: HttpClient) {}

  getNationalities(): Observable<Nationality[]> {
    return this.http.get<NationalityResponse>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/nationality').pipe(map(res => res.nationalities));
  }
}
