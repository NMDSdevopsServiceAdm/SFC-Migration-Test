import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-enter-workplace-address',
  templateUrl: './enter-workplace-address.component.html',
  styleUrls: ['./enter-workplace-address.component.scss']
})
export class EnterWorkplaceAddressComponent implements OnInit {
  enterWorkplaceAddressForm: FormGroup;
  registration: RegistrationModel;

  // Set up Messages
  isSubmitted = false;
  submittedPostcodeInput = false;
  submittedAddress1Input = false;
  submittedAddress2Input = false;
  submittedTownCityInput = false;
  submittedCountyInput = false;
  submittedWpNameInput = false;

  postcodeMessage: string;
  address1Message: string;
  address2Message: string;
  townCityMessage: string;
  countyMessage: string;
  wpNameMessage: string;

  private postcodeMessages = {
    maxlength: 'Your postcode must be no longer than 8 characters.',
    required: 'TS - Please enter your postcode.'
  };

  private address1Messages = {
    maxlength: 'Your address must be no longer than 40 characters.',
    required: 'TS - Please enter your address'
  };

  private address2Messages = {
    maxlength: 'Your address must be no longer than 40 characters.',
    required: 'TS - Please enter your address'
  };

  private townCityMessages = {
    maxlength: 'Your town/city must be no longer than 40 characters.',
    required: 'TS - Please enter your town/city'
  };

  private countyMessages = {
    maxlength: 'Your county must be no longer than 40 characters.',
    required: 'TS - Please enter your county'
  };

  private wpNameMessages = {
    maxlength: 'Your workplace name must be no longer than 120 characters.',
    required: 'TS - Please enter a workplace name'
  };

  constructor(
    private _registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  // Get postcode
  get getPostcode() {
    return this.enterWorkplaceAddressForm.get('postcodeInput');
  }

  // Get address 1
  get getAddress1() {
    return this.enterWorkplaceAddressForm.get('address1Input');
  }

  // Get address 2
  get getAddress2() {
    return this.enterWorkplaceAddressForm.get('address2Input');
  }

  // Get town/city
  get getTownCity() {
    return this.enterWorkplaceAddressForm.get('townCityInput');
  }

  // Get county
  get getCounty() {
    return this.enterWorkplaceAddressForm.get('countyInput');
  }

  // Get workplace name
  get getWpName() {
    return this.enterWorkplaceAddressForm.get('wpNameInput');
  }

  ngOnInit() {
    this.enterWorkplaceAddressForm = this.fb.group({
      postcodeInput: ['', [Validators.required, Validators.maxLength(8)]],
      address1Input: ['', [Validators.required, Validators.maxLength(40)]],
      address2Input: ['', [Validators.required, Validators.maxLength(40)]],
      townCityInput: ['', [Validators.required, Validators.maxLength(40)]],
      countyInput: ['', [Validators.required, Validators.maxLength(40)]],
      wpNameInput: ['', [Validators.required, Validators.maxLength(120)]]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    ;

    this.loadExistingValues();

    // -- START -- Validation check watchers
    // Watch registeredQuestionSelected
    this.getPostcode.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => //this.setPostcodeMessage(this.getPostcode)
      {
        if (value.length > 0) {

          if (this.getPostcode.errors) {
            this.setPostcodeMessage(this.getPostcode);
          }
        }
        // else {
        //   this.isSubmitted = false;
        //   this.submittedPostcodeInput = false;
        //   this.submittedAddress1Input = false;
        //   this.submittedAddress2Input = false;
        //   this.submittedTownCityInput = false;
        //   this.submittedCountyInput = false;
        //   this.submittedWpNameInput = false;
        //   this.setPostcodeMessage(this.getPostcode);
        // }
      }
    );

    this.getAddress1.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => //this.setAddress1Message(this.getAddress1)
      {
        if (value.length > 0) {

          if (this.getAddress1.errors) {
            this.setAddress1Message(this.getAddress1);
          }
        }
        // else {
        //   this.isSubmitted = false;
        //   this.submittedPostcodeInput = false;
        //   this.submittedAddress1Input = false;
        //   this.submittedAddress2Input = false;
        //   this.submittedTownCityInput = false;
        //   this.submittedCountyInput = false;
        //   this.submittedWpNameInput = false;
        //   this.setAddress1Message(this.getAddress1);
        // }
      }
    );

    this.getAddress2.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => //this.setAddress2Message(this.getAddress2)
      {
        if (value.length > 0) {

          if (this.getAddress2.errors) {
            this.setAddress2Message(this.getAddress2);
          }
        }
        // else {
        //   this.isSubmitted = false;
        //   this.submittedPostcodeInput = false;
        //   this.submittedAddress1Input = false;
        //   this.submittedAddress2Input = false;
        //   this.submittedTownCityInput = false;
        //   this.submittedCountyInput = false;
        //   this.submittedWpNameInput = false;
        //   this.setAddress2Message(this.getAddress2);
        // }
      }
    );

    this.getTownCity.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => //this.setTownCityMessage(this.getTownCity)
      {
        if (value.length > 0) {

          if (this.getTownCity.errors) {
            this.setTownCityMessage(this.getTownCity);
          }
        }
        // else {
        //   this.isSubmitted = false;
        //   this.submittedPostcodeInput = false;
        //   this.submittedAddress1Input = false;
        //   this.submittedAddress2Input = false;
        //   this.submittedTownCityInput = false;
        //   this.submittedCountyInput = false;
        //   this.submittedWpNameInput = false;
        //   this.setTownCityMessage(this.getTownCity);
        // }
      }
    );

    this.getCounty.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => //this.setCountyMessage(this.getCounty)
      {
        if (value.length > 0) {

          if (this.getCounty.errors) {
            this.setCountyMessage(this.getCounty);
          }
        }
        // else {
        //   this.isSubmitted = false;
        //   this.submittedPostcodeInput = false;
        //   this.submittedAddress1Input = false;
        //   this.submittedAddress2Input = false;
        //   this.submittedTownCityInput = false;
        //   this.submittedCountyInput = false;
        //   this.submittedWpNameInput = false;
        //   this.setCountyMessage(this.getCounty);
        // }
      }
    );

    this.getWpName.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => //this.setWpNameMessage(this.getWpName)
      {
        if (value.length > 0) {

          if (this.getWpName.errors) {
            this.setWpNameMessage(this.getWpName);
          }
        }
        // else {
        //   this.isSubmitted = false;
        //   this.submittedPostcodeInput = false;
        //   this.submittedAddress1Input = false;
        //   this.submittedAddress2Input = false;
        //   this.submittedTownCityInput = false;
        //   this.submittedCountyInput = false;
        //   this.submittedWpNameInput = false;
        //   this.setWpNameMessage(this.getWpName);
        // }
      }
    );

    // -- END -- Validation check watchers
  }

  // -- START -- Set validation handlers
  setPostcodeMessage(c: AbstractControl): void {
    this.postcodeMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.postcodeMessage = Object.keys(c.errors).map(
        key => this.postcodeMessage += this.postcodeMessages[key]).join(' ');
    }
    ;
    //this.submittedPostcodeInput = false;
  }

  setAddress1Message(c: AbstractControl): void {
    this.address1Message = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.address1Message = Object.keys(c.errors).map(
        key => this.address1Message += this.address1Messages[key]).join(' ');
    }
    //this.submittedAddress1Input = false;
    // else {

    //   if (this.isSubmitted && !this.getAddress1.errors) {
    //     this.save();
    //   }
    // }
  }

  setAddress2Message(c: AbstractControl): void {
    this.address2Message = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.address2Message = Object.keys(c.errors).map(
        key => this.address2Message += this.address2Messages[key]).join(' ');
    }
    //this.submittedAddress2Input = false;
    // else {

    //   if (this.isSubmitted && !this.getAddress2.errors) {
    //     this.save();
    //   }
    // }
  }

  setTownCityMessage(c: AbstractControl): void {
    this.townCityMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.townCityMessage = Object.keys(c.errors).map(
        key => this.townCityMessage += this.townCityMessages[key]).join(' ');
    }
    //this.submittedTownCityInput = false;
    // else {

    //   if (this.isSubmitted && !this.getTownCity.errors) {
    //     this.save();
    //   }
    // }
  }

  setCountyMessage(c: AbstractControl): void {
    this.countyMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.countyMessage = Object.keys(c.errors).map(
        key => this.countyMessage += this.countyMessages[key]).join(' ');
    }
    //this.submittedCountyInput = false;
  }

  setWpNameMessage(c: AbstractControl): void {
    this.wpNameMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.wpNameMessage = Object.keys(c.errors).map(
        key => this.wpNameMessage += this.wpNameMessages[key]).join(' ');
    }
    //this.submittedWpNameInput = false;
  }
  // -- END -- Set validation handlers

  loadExistingValues() {
    ;
    if ((this.registration.locationdata[0].hasOwnProperty('locationName')) && (this.registration.locationdata[0].locationName === '')) {
      const postcodeValue = this.registration.locationdata[0].postalCode;
      const address1Value = this.registration.locationdata[0].addressLine1;
      const address2Value = this.registration.locationdata[0].addressLine2;
      const townCityValue = this.registration.locationdata[0].townCity;
      const countyValue = this.registration.locationdata[0].county;

      this.enterWorkplaceAddressForm.setValue({
        postcodeInput: postcodeValue,
        address1Input: address1Value,
        address2Input: address2Value,
        townCityInput: townCityValue,
        countyInput: countyValue,
        wpNameInput: '',
      });
    }
  }

  onSubmit() {
    //this.isSubmitted = false;
    this.submittedPostcodeInput = true;
    this.submittedAddress1Input = true;
    this.submittedAddress2Input = true;
    this.submittedTownCityInput = true;
    this.submittedCountyInput = true;
    this.submittedWpNameInput = true;

    ;

    // stop here if form is invalid
    if (this.enterWorkplaceAddressForm.invalid) {
      // this.submittedPostcodeInput = false;
      // this.submittedAddress1Input = false;
      // this.submittedAddress2Input = false;
      // this.submittedTownCityInput = false;
      // this.submittedCountyInput = false;
      // this.submittedWpNameInput = false;
      // this.setPostcodeMessage(this.getPostcode);
      // this.setAddress1Message(this.getAddress1);
      // this.setAddress2Message(this.getAddress2);
      // this.setTownCityMessage(this.getTownCity);
      // this.setCountyMessage(this.getCounty);
      // this.setWpNameMessage(this.getWpName);
      ;
        return;
    }
    else {
      ;
      this.save();
    }
  }

  save() {
    const postcodeValue = this.enterWorkplaceAddressForm.get('postcodeInput').value;
    const address1Value = this.enterWorkplaceAddressForm.get('address1Input').value;
    const address2Value = this.enterWorkplaceAddressForm.get('address2Input').value;
    const townCityValue = this.enterWorkplaceAddressForm.get('townCityInput').value;
    const countyValue = this.enterWorkplaceAddressForm.get('countyInput').value;
    const wpNameValue = this.enterWorkplaceAddressForm.get('wpNameInput').value;

    //this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);

    this.registration.locationdata[0]['postalCode'] = postcodeValue;
    this.registration.locationdata[0]['addressLine1'] = address1Value;
    this.registration.locationdata[0]['addressLine2'] = address2Value;
    this.registration.locationdata[0]['townCity'] = townCityValue;
    this.registration.locationdata[0]['county'] = countyValue;
    this.registration.locationdata[0]['locationName'] = wpNameValue;

    console.log(this.registration.locationdata.length);

    const updateRegistration = this.registration.locationdata[0];

    this._registrationService.updateState(this.registration);
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/select-main-service']);

  }

}
