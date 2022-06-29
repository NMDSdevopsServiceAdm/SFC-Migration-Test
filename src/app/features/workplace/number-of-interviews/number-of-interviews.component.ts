import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { jobOptionsEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { tap } from 'rxjs/operators';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-number-of-interviews',
  templateUrl: './number-of-interviews.component.html',
})
export class NumberOfInterviewsComponent extends Question implements OnInit, OnDestroy {
  private numberCheckRegex = /^-?\d*(\.\d*)?$/;
  private wholeNumberCheckRegex = /^-?[A-Za-z0-9]*$/;
  private positiveNumberCheckRegex = /^[A-Za-z\d*(.\d*)]*$/;

  public numberOfInterviewsKnownOptions = [
    {
      label: 'Nobody has been interviewed in the last 4 weeks',
      value: jobOptionsEnum.NONE,
    },
    {
      label: 'I do not know how many people have been interviewed',
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];

  public inStaffRecruitmentFlow: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.setupForm();
    this.setupFormValueSubscriptions();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;
    this.setPreviousRoute();
    this.prefill();
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'recruitment-advertising-cost'];
  }

  private prefill(): void {
    if (this.establishment.peopleInterviewedInTheLastFourWeeks) {
      if (
        this.establishment.peopleInterviewedInTheLastFourWeeks === jobOptionsEnum.NONE ||
        this.establishment.peopleInterviewedInTheLastFourWeeks === jobOptionsEnum.DONT_KNOW
      ) {
        this.form.get('numberOfInterviewsKnown').setValue(this.establishment.peopleInterviewedInTheLastFourWeeks);
      } else {
        this.form.get('numberOfInterviews').setValue(this.establishment.peopleInterviewedInTheLastFourWeeks);
      }
    }
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      numberOfInterviews: [
        null,
        [
          this.customValidator(this.numberCheckRegex, 'nonInteger'),
          this.customValidator(this.positiveNumberCheckRegex, 'negativeNumber'),
          this.customValidator(this.wholeNumberCheckRegex, 'nonWholeNumber'),
        ],
      ],
      numberOfInterviewsKnown: null,
    });
  }

  private customValidator(regexp: RegExp, error: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const { value } = control;
      const validControlValue = regexp.test(value);
      if (value) {
        return !validControlValue ? { [error]: { value } } : null;
      }
      return null;
    };
  }

  private setupFormValueSubscriptions(): void {
    this.subscriptions.add(
      this.form.get('numberOfInterviewsKnown').valueChanges.subscribe((value) => {
        this.form.get('numberOfInterviews').clearValidators();
        this.form.get('numberOfInterviews').setValue(null, { emitEvent: false });
        this.form.get('numberOfInterviewsKnown').setValue(value, { emitEvent: false });
      }),
    );

    this.subscriptions.add(
      this.form.get('numberOfInterviews').valueChanges.subscribe(() => {
        this.form
          .get('numberOfInterviews')
          .setValidators([
            this.customValidator(this.numberCheckRegex, 'nonInteger'),
            this.customValidator(this.positiveNumberCheckRegex, 'negativeNumber'),
            this.customValidator(this.wholeNumberCheckRegex, 'nonWholeNumber'),
          ]);

        if (this.form.get('numberOfInterviewsKnown').value !== null) {
          this.form.get('numberOfInterviewsKnown').setValue(null, { emitEvent: false });
        }

        this.addErrorLinkFunctionality();
      }),
    );
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'numberOfInterviews',
        type: [
          {
            name: 'nonInteger',
            message: 'Number of people interviewed must be a number, like 7',
          },
          {
            name: 'nonWholeNumber',
            message: 'Number of people interviewed must be a whole number, like 7',
          },

          {
            name: 'negativeNumber',
            message: 'Number of people interviewed must be a positive number, like 7',
          },
        ],
      },
    ];
  }

  protected generateUpdateProps(): any {
    const { numberOfInterviews, numberOfInterviewsKnown } = this.form.value;

    if (numberOfInterviews || numberOfInterviewsKnown) {
      return numberOfInterviewsKnown ? { numberOfInterviews: numberOfInterviewsKnown } : { numberOfInterviews };
    }

    return null;
  }

  protected updateEstablishment(props: any): void {
    this.subscriptions.add(
      this.establishmentService.postStaffRecruitmentData(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected updateEstablishmentService(): void {
    this.establishmentService
      .getEstablishment(this.establishmentService.establishmentId)
      .pipe(
        tap((workplace) => {
          return (
            this.establishmentService.setWorkplace(workplace), this.establishmentService.setPrimaryWorkplace(workplace)
          );
        }),
      )
      .subscribe();
  }

  protected onSuccess(): void {
    this.updateEstablishmentService();
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'staff-recruitment-capture-training-requirement'];
  }

  protected addErrorLinkFunctionality(): void {
    if (!this.errorSummaryService.formEl$.value) {
      this.errorSummaryService.formEl$.next(this.formEl);
      this.submitted = false;
    }
  }
}
