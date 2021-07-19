import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { FindWorkplaceAddress } from '@shared/directives/create-workplace/find-workplace-address/find-workplace-address';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-find-workplace-address',
  templateUrl: './find-workplace-address.component.html',
})
export class FindWorkplaceAddressComponent extends FindWorkplaceAddress {
  constructor(
    private registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, formBuilder, locationService, router, featureFlagsService);
  }

  protected init(): void {
    this.flow = 'registration';
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'postcode',
        type: [
          {
            name: 'required',
            message: 'Enter your workplace postcode',
          },
          {
            name: 'maxlength',
            message: 'Postcode must be 8 characters or fewer',
          },
          {
            name: 'invalidPostcode',
            message: 'Enter a valid workplace postcode',
          },
        ],
      },
    ];
  }

  protected onSuccess(data: LocationSearchResponse): void {
    this.registrationService.locationAddresses$.next(data.postcodedata);
  }
}