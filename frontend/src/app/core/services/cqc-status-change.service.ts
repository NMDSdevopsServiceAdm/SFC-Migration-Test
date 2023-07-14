import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApprovalRequest } from '@core/model/approval-request.model';
import { CqcChangeData } from '@core/model/cqc-change-data.model';
import { CqcStatusChange } from '@core/model/cqc-status-change.model';
import { CqcStatusChanges } from '@core/model/cqc-status-changes.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CqcStatusChangeService {
  constructor(private http: HttpClient) {}

  public getCqcStatusChanges(): Observable<CqcStatusChanges[]> {
    return this.http.get<CqcStatusChanges[]>(
      'https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/cqc-status-change/',
    );
  }

  public CqcStatusChangeApproval(data: object) {
    return this.http.post<any>('https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/cqc-status-change/', data);
  }

  public getIndividualCqcStatusChange(establishmentUid: string): Observable<CqcStatusChange> {
    return this.http.get<CqcStatusChange>(
      `https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/cqc-status-change/${establishmentUid}`,
    );
  }

  public updateApprovalStatus(data): Observable<any> {
    return this.http.post<any>(
      `https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/admin/cqc-status-change/updateStatus`,
      data,
    );
  }

  public getCqcRequestByEstablishmentId(establishmentId: number): Observable<ApprovalRequest<CqcChangeData>> {
    return this.http.get<ApprovalRequest<CqcChangeData>>(
      `https://yj33f7v4a9.eu-west-1.awsapprunner.com/api/approvals/establishment/${establishmentId}?type=CqcStatusChange&status=Pending`,
    );
  }
}
