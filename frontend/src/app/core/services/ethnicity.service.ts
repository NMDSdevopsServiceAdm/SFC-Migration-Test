import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EthnicityFullResponse, EthnicityResponse } from '../model/ethnicity.model';

@Injectable({
  providedIn: 'root',
})
export class EthnicityService {
  constructor(private http: HttpClient) {}

  public getEthnicities(): Observable<EthnicityResponse> {
    return this.http
      .get<EthnicityFullResponse>('https://a3akknuhui.eu-west-1.awsapprunner.com/api/ethnicity')
      .pipe(map((res) => res.ethnicities));
  }
}
