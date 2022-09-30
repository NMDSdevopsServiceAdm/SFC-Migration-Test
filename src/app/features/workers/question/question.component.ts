import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import isNull from 'lodash/isNull';
import { Subscription } from 'rxjs';

@Directive()
export class QuestionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public worker: Worker;
  public workplace: Establishment;
  public primaryWorkplace: Establishment;
  public submitted = false;

  public return: URLStructure;
  public previous: string[];
  public next: string[];
  public back: URLStructure;
  public skipRoute: string[];

  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected initiated = false;

  public staffRecordSections: string[];
  public insideFlow: boolean;
  public flow: string;
  public staffRecordSummaryPath: string[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.return = this.workerService.returnTo;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.insideFlow = this.route.parent.snapshot.url[0].path !== 'staff-record-summary';
    this.staffRecordSections = ProgressBarUtil.staffRecordProgressBarSections();
    this.subscriptions.add(
      this.workerService.worker$.subscribe((worker) => {
        this.worker = worker;

        if (!this.initiated) {
          this.back = this.previous
            ? {
                url: this.previous,
                ...(!this.workerService.addStaffRecordInProgress$.value && { fragment: 'staff-records' }),
              }
            : this.return;

          this.backService.setBackLink(this.back);
          this._init();
        }
      }),
    );

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
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
        this.router.navigate(this.getRoutePath(''));
        break;

      case 'skip':
        this.router.navigate(this.next);
        break;

      case 'exit':
        const url =
          this.primaryWorkplace?.uid === this.workplace.uid ? ['/dashboard'] : ['/workplace', this.workplace.uid];
        this.router.navigate(url, { fragment: 'staff-records' });
        break;

      case 'return':
        this.router.navigate([
          '/workplace',
          this.workplace.uid,
          'staff-record',
          this.worker.uid,
          'staff-record-summary',
        ]);
        break;
    }
  }

  public getRoutePath(name: string) {
    if (name) {
      return ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, name];
    } else {
      return ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'staff-record-summary'];
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
        this.workerService.createWorker(this.workplace.uid, props).subscribe(
          (data) => this._onSuccess(data, payload.action),
          (error) => this.onError(error),
        ),
      );
    } else {
      this.subscriptions.add(
        this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(
          (data) => this._onSuccess(data, payload.action),
          (error) => this.onError(error),
        ),
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
