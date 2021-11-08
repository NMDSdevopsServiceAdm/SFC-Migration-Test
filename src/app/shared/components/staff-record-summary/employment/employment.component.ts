import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DATE_DISPLAY_DEFAULT } from '@core/constants/constants';
import { Contracts } from '@core/model/contracts.enum';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WdfConfirmFieldsService } from '@core/services/wdf/wdf-confirm-fields.service';
import { WorkerService } from '@core/services/worker.service';
import isNumber from 'lodash/isNumber';
import moment from 'moment';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  providers: [DecimalPipe],
})
export class EmploymentComponent extends StaffRecordSummaryComponent {
  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Input() public canEditWorker: boolean;

  constructor(
    permissionsService: PermissionsService,
    workerService: WorkerService,
    wdfConfirmFieldsService: WdfConfirmFieldsService,
  ) {
    super(permissionsService, workerService, wdfConfirmFieldsService);
  }

  isNumber(number: number) {
    return isNumber(number);
  }

  get displayYearArrived() {
    return this.worker.countryOfBirth && this.worker.countryOfBirth.value !== 'United Kingdom';
  }

  get displayMentalHealthProfessional() {
    return this.workerService.hasJobRole(this.worker, 27);
  }

  get displayNursingQuestions() {
    return this.workerService.hasJobRole(this.worker, 23);
  }

  get displayDaysSickness() {
    return [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract);
  }

  get displayAverageWeeklyHours() {
    return (
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
    );
  }

  get displayWeeklyContractedHours() {
    return !this.displayAverageWeeklyHours;
  }

  get mainStartDate() {
    return moment(this.worker.mainJobStartDate).format(DATE_DISPLAY_DEFAULT);
  }
}
