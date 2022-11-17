import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-gender',
  templateUrl: './gender.component.html',
})
export class GenderComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Female', tag: 'Female' },
    { value: 'Male', tag: 'Male' },
    { value: 'Other', tag: 'Other' },
    { value: `Don't know`, tag: 'I do not know' },
  ];
  public section = 'Personal details';
  private disabilityPath: string[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    public route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.form = this.formBuilder.group({
      gender: null,
    });
  }

  init() {
    if (this.worker.gender) {
      this.form.patchValue({
        gender: this.worker.gender,
      });
    }

    this.next = this.getRoutePath('disability');
  }

  generateUpdateProps() {
    const { gender } = this.form.controls;
    return gender.value
      ? {
          gender: gender.value,
        }
      : null;
  }
}
