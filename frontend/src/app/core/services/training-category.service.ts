import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { TrainingRecordCategories } from '@core/model/training.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class TrainingCategoryService {
  constructor(private http: HttpClient) {}

  getCategoriesWithTraining(establishmentId): Observable<TrainingRecordCategories[]> {
    return this.http
      .get<any>(`${environment.appRunnerEndpoint}/api/trainingCategories/${establishmentId}/with-training`)
      .pipe(map((res) => res.trainingCategories));
  }

  getTrainingCategory(establishmentUid: string, trainingCategoryId: number, queryParams?: Params): Observable<any> {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/trainingCategories/${establishmentUid}/${trainingCategoryId}`,
      {
        params: queryParams,
      },
    );
  }
}
