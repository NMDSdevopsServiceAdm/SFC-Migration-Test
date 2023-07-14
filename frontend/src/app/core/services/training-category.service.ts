import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { TrainingRecordCategories } from '@core/model/training.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TrainingCategoryService {
  constructor(private http: HttpClient) {}

  getCategoriesWithTraining(establishmentId): Observable<TrainingRecordCategories[]> {
    return this.http
      .get<any>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/trainingCategories/${establishmentId}/with-training`)
      .pipe(map((res) => res.trainingCategories));
  }

  getTrainingCategory(establishmentUid: string, trainingCategoryId: number, queryParams?: Params): Observable<any> {
    return this.http.get<any>(`https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/trainingCategories/${establishmentUid}/${trainingCategoryId}`, {
      params: queryParams,
    });
  }
}
