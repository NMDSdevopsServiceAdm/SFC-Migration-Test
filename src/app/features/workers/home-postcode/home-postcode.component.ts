import { Component } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { POSTCODE_PATTERN } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-home-postcode',
  templateUrl: './home-postcode.component.html',
})
export class HomePostcodeComponent extends QuestionComponent {
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
        postcode: [null, this.postcodeValidator],
      },
      { updateOn: 'submit' },
    );
  }

  init() {
    if (this.worker.postcode) {
      this.form.patchValue({
        postcode: this.worker.postcode,
      });
    }

    this.next = this.getRoutePath('gender');
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'postcode',
        type: [
          {
            name: 'validPostcode',
            message: 'Enter a real postcode',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { postcode } = this.form.controls;

    return postcode.value
      ? {
          postcode: postcode.value,
        }
      : { postcode: null };
  }

  postcodeValidator(control: AbstractControl) {
    return !control.value || POSTCODE_PATTERN.test(control.value) ? null : { validPostcode: true };
  }
}
