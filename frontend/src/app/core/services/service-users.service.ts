import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceUsersService {
  constructor(private http: HttpClient) {}

  getServiceUsers() {
    return this.http.get<any>('https://a3akknuhui.eu-west-1.awsapprunner.com/api/serviceUsers');
  }
}
