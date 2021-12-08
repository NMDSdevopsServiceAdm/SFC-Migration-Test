import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApprovalRequest } from '@core/model/approval-request.model';
import { CqcChangeData } from '@core/model/cqc-change-data.model';
import { CqcStatusChanges } from '@core/model/cqc-status-changes.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CqcStatusChangeService {
  constructor(private http: HttpClient) {}

  public getCqcStatusChanges(): Observable<CqcStatusChanges[]> {
    return this.http.get<CqcStatusChanges[]>('/api/admin/cqc-status-change/');
  }

  public CqcStatusChangeApproval(data: object) {
    return this.http.post<any>('/api/admin/cqc-status-change/', data);
  }

  public getIndividualCqcStatusChange(establishmentUid: string): Observable<CqcStatusChanges> {
    return this.http.get<CqcStatusChanges>(`/api/admin/cqc-status-change/${establishmentUid}`);
  }

  public getCqcRequestByEstablishmentId(establishmentId: number): Observable<ApprovalRequest<CqcChangeData>> {
    return this.http.get<ApprovalRequest<CqcChangeData>>(
      `/api/approvals/establishment/${establishmentId}?type=CqcStatusChange&status=Pending`,
    );
  }
}
