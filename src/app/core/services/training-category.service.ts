import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TrainingCategoryService {
  constructor(private http: HttpClient) {}

  getCategoriesWithTraining(establishmentId): Observable<any[]> {
    return this.http.get<any>(`/api/trainingCategories/${establishmentId}/with-training`).pipe(
      map((res) => {
        console.log(res.trainingCategories);
        return res.trainingCategories;
      }),
    );
  }
}
