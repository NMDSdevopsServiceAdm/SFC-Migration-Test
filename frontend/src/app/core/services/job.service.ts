import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetJobsResponse, Job } from '@core/model/job.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient) {}

  public getJobs(): Observable<Job[]> {
    return this.http.get<GetJobsResponse>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/jobs').pipe(map(this.sortJobs));
  }

  private sortJobs(response): Job[] {
    const { jobs } = response;
    const otherJobs: Job[] = [];
    const nonOtherJobs: Job[] = [];

    return jobs.reduce((acc, job) => {
      if (job.other) {
        otherJobs.push(job);
      } else {
        nonOtherJobs.push(job);
      }
      return [...nonOtherJobs, ...otherJobs];
    }, []);
  }
}