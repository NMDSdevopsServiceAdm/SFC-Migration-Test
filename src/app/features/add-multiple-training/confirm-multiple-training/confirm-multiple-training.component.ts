import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-multiple-training',
  templateUrl: './confirm-multiple-training.component.html',
})
export class ConfirmMultipleTrainingComponent implements OnInit {
  public workers: { key: string; value: string }[];
  public trainingRecords: { key: string; value: string }[];
  private workplaceUid: string;
  public subscriptions: Subscription = new Subscription();

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
    protected backService: BackLinkService,
  ) {
    this.workplaceUid = this.route.snapshot.data.establishment.uid;
  }

  ngOnInit(): void {
    this.getStaffData();
    this.convertTrainingRecord();
    this.backService.showBackLink();
  }

  private convertTrainingRecord(): void {
    const training = this.trainingService.selectedTraining;
    this.trainingRecords = [
      { key: 'Training category', value: training.trainingCategory?.id },
      { key: 'Training name', value: training.title },
      { key: 'Training accredited', value: training.accredited },
      { key: 'Date completed', value: training.completed ? dayjs(training.completed).format('D MMMM YYYY') : '-' },
      { key: 'Exiry date', value: training.expires ? dayjs(training.expires).format('D MMMM YYYY') : '-' },
      { key: 'Notes', value: training.notes ? training.notes : 'No notes added' },
    ];
  }

  private getStaffData(): void {
    const staff = this.trainingService.selectedStaff;
    this.workers = [];
    for (const id of staff) {
      this.workerService.getWorker(this.workplaceUid, id).subscribe((worker) => {
        this.workers.push({ key: worker.nameOrId, value: worker.mainJob.title });
      });
    }
  }

  public getRoutePath(pageName: string): Array<string> {
    return ['/workplace', this.workplaceUid, 'add-multiple-training', pageName];
  }

  public onSubmit(): void {
    this.workerService
      .createMultipleTrainingRecords(
        this.workplaceUid,
        this.trainingService.selectedStaff,
        this.trainingService.selectedTraining,
      )
      .subscribe(() => this.onSuccess());
  }

  private onSuccess = () => {
    const message = `${this.workers.length} training records added`;
    this.trainingService.addMultipleTrainingInProgress$.next(false);
    this.trainingService.resetSelectedStaff();
    this.trainingService.resetSelectedTraining();

    this.router.navigate([`dashboard`], { fragment: 'training-and-qualifications' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: message,
      });
    });
  };
}
