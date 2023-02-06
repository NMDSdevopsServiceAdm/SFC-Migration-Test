import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MultipleTrainingResponse, TrainingRecordRequest } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';

import { AddEditTrainingDirective } from '../../../shared/directives/add-edit-training/add-edit-training.directive';

<<<<<<< HEAD
=======
>>>>>>> test
@Component({
  selector: 'app-add-edit-training',
  templateUrl: '../../../shared/directives/add-edit-training/add-edit-training.component.html',
})
export class MultipleTrainingDetailsComponent extends AddEditTrainingDirective implements OnInit, AfterViewInit {
  public showWorkerCount = true;
  public workerCount: number = this.trainingService.selectedStaff.length;

  constructor(
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
    private establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      route,
      router,
      backLinkService,
      errorSummaryService,
      trainingService,
      workerService,
      alertService,
    );
  }

  protected init(): void {
    this.previousUrl =
      this.establishmentService.primaryWorkplace?.uid === this.workplace.uid
        ? ['/dashboard']
        : ['workplace', this.workplace.uid];
  }

  protected setSection(): void {
    this.section = 'Add multiple records';
  }

  protected setTitle(): void {
    this.title = 'Add training record details';
  }

  protected setSectionHeading(): void {
    this.section = 'Add multiple records';
  }
  protected setButtonText(): void {
    this.buttonText = 'Continue';
  }

  protected async submit(record: TrainingRecordRequest) {
    this.trainingService.updateSelectedTraining(record);

    await this.router.navigate(['workplace', this.workplace.uid, 'add-multiple-training', 'confirm-training']);
  }

  private async onSuccess(response: MultipleTrainingResponse) {
    this.trainingService.resetSelectedStaff();
    this.trainingService.addMultipleTrainingInProgress$.next(false);

    await this.router.navigate(['add-multiple-records-summary']);
  }

  private onError(error) {
    console.error(error);
  }

  public onCancel(): void {
    this.trainingService.resetSelectedStaff();
    this.router.navigate(this.previousUrl, { fragment: 'training-and-qualifications' });
  }
}
