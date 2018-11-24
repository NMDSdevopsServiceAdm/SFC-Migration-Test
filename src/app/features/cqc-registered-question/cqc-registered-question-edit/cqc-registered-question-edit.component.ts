import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { RegistrationService } from '../../../core/services/registration.service';
import { CqcRegisteredQuestionEnteredLocation } from './cqc-regsitered-check';


@Component({
  selector: 'app-cqc-registered-question-edit',
  templateUrl: './cqc-registered-question-edit.component.html',
  styleUrls: ['./cqc-registered-question-edit.component.scss']
})

export class CqcRegisteredQuestionEditComponent implements OnInit {
  cqcRegisteredQuestionForm: FormGroup;
  CqcRegisteredQuestionEnteredLocation = new CqcRegisteredQuestionEnteredLocation();
  registeredQuestionSelectedValue: string;

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    this.cqcRegisteredQuestionForm = this.fb.group({
      registeredQuestionSelected: '',
      radioSelect: 'registeredQuestionSelected',
      cqcRegisteredGroup: this.fb.group({
        cqcRegisteredPostcode: ['', Validators.maxLength(8)],
        locationId: ['', Validators.maxLength(50)],
      }, { validator: checkInputValues }),
      notRegisteredPostcode: ''
    });

    // Watch registeredQuestionSelected
    this.cqcRegisteredQuestionForm.get('registeredQuestionSelected').valueChanges.subscribe(
      value => this.registeredQuestionChanged(value)
    );
  }

  save() {

    let cqcRegisteredPostcodeValue = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.cqcRegisteredPostcode').value;
    let locationIdValue = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.locationId').value;
    let notRegisteredPostcodeValue = this.cqcRegisteredQuestionForm.get('notRegisteredPostcode').value;

    if (cqcRegisteredPostcodeValue.length > 0) {
      this._registrationService.getLocationByPostCode(cqcRegisteredPostcodeValue);
    }
    else if (locationIdValue.length > 0) {
      this._registrationService.getLocationByLocationId(locationIdValue);   
    }
    else if (notRegisteredPostcodeValue.length > 0) {

      console.log("No API yet");

    }
  }

  // Check if user is CQC Registered or not and display appropriate fields
  // If not CQC registered is selected set postcodes validation
  registeredQuestionChanged(value: string): void {
    this.registeredQuestionSelectedValue = value;
    const notRegisteredPostcode = this.cqcRegisteredQuestionForm.get('notRegisteredPostcode');

    if (this.registeredQuestionSelectedValue === "false") {
      notRegisteredPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
    }
    notRegisteredPostcode.updateValueAndValidity();

  }
}

// Check for content in both CQC registered input fields
function checkInputValues(c: AbstractControl): { [key: string]: boolean } | null {
  const postcodeControl = c.get('cqcRegisteredPostcode');
  const locationIdControl = c.get('locationId');

  if (postcodeControl.pristine || locationIdControl.pristine) {
    return null;
  }

  if (postcodeControl.value.length < 1 && locationIdControl.value.length < 1) {
    return null;
  }

  if ((postcodeControl.value.length < 1 && locationIdControl.value.length > 0) || (postcodeControl.value.length > 0 && locationIdControl.value.length < 1)) {
    return null;
  }

  return { 'containsContent': true };
}



