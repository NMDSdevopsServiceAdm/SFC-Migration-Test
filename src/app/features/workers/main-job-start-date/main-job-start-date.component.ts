import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DEFAULT_DATE_FORMAT } from '@core/constants/constants';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { WorkerService } from '@core/services/worker.service';
import { DateValidator } from '@core/validators/date.validator';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-main-job-start-date',
  templateUrl: './main-job-start-date.component.html',
})
export class MainJobStartDateComponent implements OnInit, OnDestroy {
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private workerService: WorkerService,
    private messageService: MessageService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      day: null,
      month: null,
      year: null,
    });
    this.form.setValidators(Validators.compose([this.form.validator, DateValidator.datePastOrToday()]));

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
      this.backLink = this.worker.mainJob.jobId === 27 ? 'mental-health-professional' : 'staff-details';

      if (this.worker.mainJobStartDate) {
        const date = moment(this.worker.mainJobStartDate, DEFAULT_DATE_FORMAT);
        this.form.patchValue({
          year: date.year(),
          month: date.format('M'),
          day: date.date(),
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();
      this.router.navigate(['/worker', this.worker.uid, 'other-job-roles']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler() {
    return new Promise((resolve, reject) => {
      this.messageService.clearError();

      if (this.form.valid) {
        const date = this.dateFromForm();
        const props = {
          mainJobStartDate: date ? date.format(DEFAULT_DATE_FORMAT) : null,
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (this.form.errors) {
          if (this.form.errors.required) {
            this.messageService.show('error', 'Please fill required fields.');
          }
          if (this.form.errors.dateValid) {
            this.messageService.show('error', 'Invalid date.');
          }
          if (this.form.errors.dateInPast) {
            this.messageService.show('error', `The date can't be in the future.`);
          }
        }
        reject();
      }
    });
  }

  dateFromForm() {
    const { day, month, year } = this.form.value;
    const date = moment(`${year}-${month}-${day}`, DEFAULT_DATE_FORMAT);
    return date.isValid() ? date : null;
  }
}
