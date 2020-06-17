import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataSharingOptions } from '@core/model/data-sharing.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-total-staff',
  templateUrl: './total-staff.component.html',
})
export class TotalStaffComponent extends Question implements OnInit, OnDestroy {
  public form: FormGroup;
  public workplace: Establishment;
  private totalStaffConstraints = { min: 0, max: 999 };
  public formErrorsMap: Array<ErrorDetails>;

  constructor(
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected backService: BackService, 
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      totalStaff: [
        null,
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.min(this.totalStaffConstraints.min),
          Validators.max(this.totalStaffConstraints.max),
        ],
      ],
    });
  }

  protected init(): void {
    this.subscriptions.add(
      this.establishmentService.getStaff(this.establishment.uid).subscribe(staff => {
        this.form.patchValue({ totalStaff: staff });
      })
    );

    this.next = ['/workplace', `${this.establishment.uid}`, 'vacancies'];
    this.setPreviousRoute();

    this.setupFormErrors();
  }

  private setupFormErrors(): void {
    this.formErrorsMap = [
      {
        item: 'totalStaff',
        type: [
          {
            name: 'required',
            message: 'Total Staff is required.',
          },
          {
            name: 'min',
            message: `Total Staff must be greater than or equal to ${this.totalStaffConstraints.min}`,
          },
          {
            name: 'max',
            message: `Total Staff must be lower than or equal to ${this.totalStaffConstraints.max}`,
          },
          {
            name: 'pattern',
            message: 'Total Staff must be a number.',
          },
        ],
      },
    ];
  }

  private setPreviousRoute(): void {
    this.previous = this.establishment.share.with.includes(DataSharingOptions.LOCAL)
      ? ['/workplace', `${this.establishment.uid}`, 'sharing-data-with-local-authorities']
      : ['/workplace', `${this.establishment.uid}`, 'sharing-data'];
  }

  protected generateUpdateProps() {
    return {
      totalStaff: this.form.value.totalStaff,
    };
  }

  protected updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService.postStaff(this.establishment.uid, props.totalStaff).subscribe(
        data => this._onSuccess(data),
        error => this.onError(error)
      )
    );
  }
}
