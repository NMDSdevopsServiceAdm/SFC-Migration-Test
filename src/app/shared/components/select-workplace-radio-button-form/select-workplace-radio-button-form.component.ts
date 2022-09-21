import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LocationAddress } from '@core/model/location.model';

@Component({
  selector: 'app-select-workplace-radio-button-form',
  templateUrl: './select-workplace-radio-button-form.component.html',
})
export class SelectWorkplaceRadioButtonFormComponent {
  @Input() form: FormGroup;
  @Input() locationAddresses: LocationAddress[];
}