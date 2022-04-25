import { Directive, OnDestroy, OnInit } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { SummaryList } from '@core/model/summary-list.model';
import { BackService } from '@core/services/back.service';
import { Subscription } from 'rxjs';

@Directive()
export class ConfirmWorkplaceDetailsDirective implements OnInit, OnDestroy {
  public flow: string;
  public locationAddress: LocationAddress;
  public workplace: Service;
  public workplaceNameAndAddress: SummaryList[];
  public mainService: SummaryList[];
  public nameAndAddress: string;
  public WorkplaceTotalStaff: string;
  public totalStaff: SummaryList[];
  protected subscriptions: Subscription = new Subscription();

  constructor(protected backService: BackService) {}

  ngOnInit(): void {
    this.init();
    this.setNameAndAddress();
    this.setWorkplaceDetails();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected getWorkplaceData(): void {}

  public setWorkplaceDetails(): void {
    if (this.workplace.isCQC && this.locationAddress.locationId) {
      this.setCqcRegulatedWithLocationIdWorkplaceDetails();
    }
    if (this.workplace.isCQC && !this.locationAddress.locationId) {
      this.setCqcRegulatedWithoutLocationIdWorkplaceDetails();
    }
    if (!this.workplace.isCQC) {
      this.setNonCqcRegulatedWorkplaceDetails();
    }

    this.mainService = [
      {
        label: 'Main service',
        data: this.workplace.name,
        route: { url: [this.flow, 'select-main-service'] },
      },
    ];

    this.totalStaff = [
      {
        label: 'Number of staff',
        data: this.WorkplaceTotalStaff,
        route: { url: [this.flow, 'add-total-staff'] },
      },
    ];
  }

  protected setCqcRegulatedWithLocationIdWorkplaceDetails(): void {
    this.workplaceNameAndAddress = [
      {
        label: 'CQC location ID',
        data: this.locationAddress.locationId,
        route: { url: [this.flow, 'find-workplace'] },
      },
      {
        label: 'Name and address',
        data: this.nameAndAddress,
      },
    ];
  }

  protected setCqcRegulatedWithoutLocationIdWorkplaceDetails(): void {
    this.workplaceNameAndAddress = [
      {
        label: 'Name',
        data: this.locationAddress.locationName,
        route: { url: [this.flow, 'find-workplace'] },
      },
      {
        label: 'Address',
        data: this.nameAndAddress,
      },
    ];
  }

  protected setNonCqcRegulatedWorkplaceDetails(): void {
    this.workplaceNameAndAddress = [
      {
        label: 'Name',
        data: this.locationAddress.locationName,
        route: { url: [this.flow, 'workplace-name-address'] },
      },
      {
        label: 'Address',
        data: this.nameAndAddress,
      },
    ];
  }

  public setNameAndAddress(): void {
    const workplaceAddress = [
      this.locationAddress.addressLine1,
      this.locationAddress.addressLine2,
      this.locationAddress.addressLine3,
      this.locationAddress.townCity,
      this.locationAddress.county,
      this.locationAddress.postalCode,
    ];
    if (this.workplace.isCQC && this.locationAddress.locationId) {
      workplaceAddress.unshift(this.locationAddress.locationName);
    }

    this.nameAndAddress = this.convertWorkplaceAddressToString(workplaceAddress);
  }

  private convertWorkplaceAddressToString(workplaceAddress: Array<string>): string {
    return workplaceAddress.filter((x) => x).join('\r\n');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
