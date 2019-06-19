import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { isNull } from 'util';

export class QuestionComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public worker: Worker;
  public submitted = false;

  public return: URLStructure;
  public previous: string[];
  public next: string[];
  public back: URLStructure;

  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected initiated = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {}

  ngOnInit() {
    this.return = this.workerService.returnTo;

    this.subscriptions.add(
      this.workerService.worker$.subscribe(worker => {
        this.worker = worker;

        if (!this.initiated) {
          this._init();

          this.back = this.return ? this.return : { url: this.previous };
          this.backService.setBackLink(this.back);
        }
      })
    );

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.workerService.setReturnTo(null);
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected _init() {
    this.initiated = true;
    this.init();
  }

  protected init() {}
  protected setupFormErrorsMap() {}
  protected setupServerErrorsMap() {}
  protected generateUpdateProps() {}
  protected onSuccess() {}

  protected navigate(action): void {
    switch (action) {
      case 'continue':
        this.router.navigate(this.next);
        break;

      case 'summary':
        this.router.navigate(['/worker', this.worker.uid, 'check-answers']);
        break;

      case 'exit':
        this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
        break;

      case 'return':
        this.router.navigate(this.return.url, { fragment: this.return.fragment, queryParams: this.return.queryParams });
        break;
    }
  }

  public onSubmit(payload: { action: string; save: boolean } = { action: 'continue', save: true }) {
    if (!payload.save) {
      this.navigate(payload.action);
      return;
    }

    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const props = this.generateUpdateProps();

    if (isNull(props)) {
      this.onSuccess();
      this.navigate(payload.action);
      return;
    }

    if (!this.worker) {
      this.subscriptions.add(
        this.workerService
          .createWorker(props)
          .subscribe(data => this._onSuccess(data, payload.action), error => this.onError(error))
      );
    } else {
      this.subscriptions.add(
        this.workerService
          .updateWorker(this.worker.uid, props)
          .subscribe(data => this._onSuccess(data, payload.action), error => this.onError(error))
      );
    }
  }

  _onSuccess(data, action) {
    this.workerService.setState({ ...this.worker, ...data });
    this.onSuccess();
    this.navigate(action);
  }

  onError(error) {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }
}
