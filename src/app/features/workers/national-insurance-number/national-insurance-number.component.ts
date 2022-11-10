import { Component } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NIN_PATTERN } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-national-insurance-number',
  templateUrl: './national-insurance-number.component.html',
})
export class NationalInsuranceNumberComponent extends QuestionComponent {
  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
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

    this.form = this.formBuilder.group(
      {
        nationalInsuranceNumber: [null, this.ninValidator],
      },
      { updateOn: 'submit' },
    );
  }

  init() {
    if (this.worker.nationalInsuranceNumber) {
      this.form.patchValue({
        nationalInsuranceNumber: this.worker.nationalInsuranceNumber,
      });
    }

    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';

    this.next = this.getRoutePath('home-postcode');
    this.previous = this.workerService.hasJobRole(this.worker, 27)
      ? this.getRoutePath('mental-health-professional')
      : this.getRoutePath('date-of-birth');
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'nationalInsuranceNumber',
        type: [
          {
            name: 'validNin',
            message: `Enter a National Insurance number that's 2 letters, 6 numbers, then A, B, C or D, like QQ 12 34 56 C`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { nationalInsuranceNumber } = this.form.controls;

    return nationalInsuranceNumber.value
      ? {
          nationalInsuranceNumber: nationalInsuranceNumber.value.toUpperCase(),
        }
      : { nationalInsuranceNumber: null };
  }

  ninValidator(control: AbstractControl) {
    return !control.value || NIN_PATTERN.test(control.value.toUpperCase()) ? null : { validNin: true };
  }
}
