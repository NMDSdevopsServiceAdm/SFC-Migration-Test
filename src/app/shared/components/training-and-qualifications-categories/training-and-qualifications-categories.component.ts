import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment, SortTrainingAndQualsOptionsCat } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-and-qualifications-categories',
  templateUrl: './training-and-qualifications-categories.component.html',
})
export class TrainingAndQualificationsCategoriesComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() trainingCategories: Array<any>;
  @Output() viewTrainingByCategory: EventEmitter<boolean> = new EventEmitter();

  public workerDetails = [];
  public workerDetailsLabel = [];
  public canEditWorker = false;
  public filterByDefault: string;
  public filterValue: string;
  public sortTrainingAndQualsOptions;
  public sortByDefault: string;
  public newTrainingAndQualificationsRecordsFlag: boolean;
  public trainingAndQualsRoute: string;
  public expiresSoonAlertDate: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private permissionsService: PermissionsService,
    protected trainingStatusService: TrainingStatusService,
    private workerService: WorkerService,
    private router: Router,
    private featureFlagsService: FeatureFlagsService,
    private establishmentService: EstablishmentService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.filterByDefault = 'all';
    this.filterValue = 'all';
    this.sortTrainingAndQualsOptions = SortTrainingAndQualsOptionsCat;
    this.sortByDefault = '0_expired';
    this.orderTrainingCategories(this.sortByDefault);
    this.getExpiresSoonAlertDates();

    this.newTrainingAndQualificationsRecordsFlag = await this.featureFlagsService.configCatClient.getValueAsync(
      'newTrainingAndQualificationsRecords',
      false,
    );

    this.trainingAndQualsRoute = this.newTrainingAndQualificationsRecordsFlag ? 'new-training' : 'training';
  }

  private getExpiresSoonAlertDates(): void {
    this.subscriptions.add(
      this.establishmentService.getExpiresSoonAlertDates(this.workplace.uid).subscribe((date) => {
        this.expiresSoonAlertDate = date.expiresSoonAlertDate;
      }),
    );
  }

  public toggleFilter(filterValue): void {
    this.filterValue = filterValue;
  }

  public orderTrainingCategories(dropdownValue: string): void {
    let sortValue: number;
    if (dropdownValue.includes('missing')) {
      sortValue = this.trainingStatusService.MISSING;
    } else if (dropdownValue.includes('expired')) {
      sortValue = this.trainingStatusService.EXPIRED;
    } else if (dropdownValue.includes('expires_soon')) {
      sortValue = this.trainingStatusService.EXPIRING;
    }
    if (dropdownValue === 'category') {
      this.trainingCategories = orderBy(this.trainingCategories, [(tc) => tc.category.toLowerCase()], ['asc']);
    } else {
      this.trainingCategories = orderBy(
        this.trainingCategories,
        [
          (tc) => this.trainingStatusService.trainingStatusCount(tc.training, sortValue, this.expiresSoonAlertDate),
          (tc) => tc.category.toLowerCase(),
        ],
        ['desc', 'asc'],
      );
    }
  }

  public toggleDetails(id, event): void {
    event.preventDefault();

    this.workerDetails[id] = !this.workerDetails[id];
    this.workerDetailsLabel[id] = this.workerDetailsLabel[id] === 'Close' ? 'Open' : 'Close';
  }

  public totalTrainingRecords(training) {
    return training.filter((trainingRecord) => {
      return this.trainingStatus(trainingRecord) !== this.trainingStatusService.MISSING;
    }).length;
  }

  public trainingIsComplete(training) {
    return (
      [
        this.trainingStatusService.trainingStatusCount(
          training,
          this.trainingStatusService.EXPIRED,
          this.expiresSoonAlertDate,
        ),
        this.trainingStatusService.trainingStatusCount(
          training,
          this.trainingStatusService.EXPIRING,
          this.expiresSoonAlertDate,
        ),
        this.trainingStatusService.trainingStatusCount(
          training,
          this.trainingStatusService.MISSING,
          this.expiresSoonAlertDate,
        ),
      ].reduce((total, num) => {
        return total + num;
      }) === 0
    );
  }

  public trainingStatus(training) {
    return this.trainingStatusService.trainingStatusForRecord(training, this.expiresSoonAlertDate);
  }

  public updateTrainingRecord(event, training): void {
    event.preventDefault();
    this.workerService.getRoute$.next('/dashboard?view=categories#training-and-qualifications');

    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      training.worker.uid,
      'training',
      training.uid,
    ]);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
