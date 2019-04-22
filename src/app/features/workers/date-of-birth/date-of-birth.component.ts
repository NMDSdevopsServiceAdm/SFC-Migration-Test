import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DATE_PARSE_FORMAT, DEFAULT_DATE_DISPLAY_FORMAT } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@core/validators/date.validator';
import * as moment from 'moment';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-date-of-birth',
  templateUrl: './date-of-birth.component.html',
})
export class DateOfBirthComponent extends QuestionComponent {
  private minDate = moment()
    .subtract(100, 'years')
    .add(1, 'days');
  private maxDate = moment().subtract(14, 'years');

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      dob: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
    });
    this.form.get('dob').setValidators([DateValidator.dateValid(), DateValidator.between(this.minDate, this.maxDate)]);
  }

  init() {
    if (this.worker.dateOfBirth) {
      const date = moment(this.worker.dateOfBirth, DATE_PARSE_FORMAT);
      this.form.get('dob').patchValue({
        year: date.year(),
        month: date.format('M'),
        day: date.date(),
      });
    }

    this.next = ['/worker', this.worker.uid, 'home-postcode'];
    this.previous = ['/worker', this.worker.uid, 'national-insurance-number'];
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'dob',
        type: [
          {
            name: 'dateValid',
            message: 'DATE IS NOT VALID',
          },
          {
            name: 'dateBetween',
            message: `The date has to be between ${this.minDate.format(
              DEFAULT_DATE_DISPLAY_FORMAT
            )} and ${this.maxDate.format(DEFAULT_DATE_DISPLAY_FORMAT)}.`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { day, month, year } = this.form.get('dob').value;
    const date = day && month && year ? moment(`${year}-${month}-${day}`, DATE_PARSE_FORMAT) : null;

    if (date) {
      return {
        dateOfBirth: date.format(DATE_PARSE_FORMAT),
      };
    }

    return null;
  }
}
