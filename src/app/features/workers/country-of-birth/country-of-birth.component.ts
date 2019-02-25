import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { CountryResponse, CountryService } from '@core/services/country.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-country-of-birth',
  templateUrl: './country-of-birth.component.html',
})
export class CountryOfBirthComponent implements OnInit, OnDestroy {
  public availableOtherCountries: CountryResponse[];
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private countryService: CountryService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.cobNameValidator = this.cobNameValidator.bind(this);
    this.cobNameFilter = this.cobNameFilter.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    this.form = this.formBuilder.group({
      cobKnown: null,
      cobName: [null, this.cobNameValidator],
    });

    if (this.worker.countryOfBirth) {
      const { value, other } = this.worker.countryOfBirth;

      this.form.patchValue({
        cobKnown: value,
        cobName: other ? other.country : null,
      });
    }

    this.backLink =
      this.worker.nationality && this.worker.nationality.value === 'British' ? 'nationality' : 'british-citizenship';

    this.subscriptions.add(this.countryService.getCountries().subscribe(res => (this.availableOtherCountries = res)));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      if (this.worker.countryOfBirth && this.worker.countryOfBirth.value === 'United Kingdom') {
        this.router.navigate(['/worker', this.worker.uid, 'recruited-from']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'year-arrived-uk']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { cobName, cobKnown } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        if (cobKnown.value) {
          this.worker.countryOfBirth = { value: cobKnown.value };

          if (cobName.value) {
            this.worker.countryOfBirth.other = {
              country: `${cobName.value.charAt(0).toUpperCase()}${cobName.value.slice(1)}`,
            };
          }
        }

        this.subscriptions.add(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        if (cobName.errors) {
          if (Object.keys(cobName.errors).includes('required')) {
            this.messageService.show('error', 'Country must be provided.');
          } else if (Object.keys(cobName.errors).includes('validCob')) {
            this.messageService.show('error', 'Invalid country of birth.');
          }
        }

        reject();
      }
    });
  }

  cobKnownChangeHandler() {
    this.form.controls.cobName.reset();
  }

  cobNameValidator() {
    if (this.form && this.availableOtherCountries) {
      const { cobKnown } = this.form.value;
      const cobName = this.form.controls.cobName.value;

      if (cobKnown === 'Other') {
        if (cobName) {
          const cobNameLowerCase = cobName.toLowerCase();
          return this.availableOtherCountries.some(c => c.country.toLowerCase() === cobNameLowerCase)
            ? null
            : { validCob: true };
        } else {
          return { required: true };
        }
      }
    }

    return null;
  }

  cobNameFilter(): string[] {
    const { cobName } = this.form.value;

    if (this.availableOtherCountries && cobName && cobName.length) {
      const cobNameLowerCase = cobName.toLowerCase();
      return this.availableOtherCountries
        .filter(c => c.country.toLowerCase().startsWith(cobNameLowerCase))
        .filter(c => c.country.toLowerCase() !== cobNameLowerCase)
        .map(c => c.country);
    }

    return [];
  }
}
