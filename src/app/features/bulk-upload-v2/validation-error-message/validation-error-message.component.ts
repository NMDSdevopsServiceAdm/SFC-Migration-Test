import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-error-message',
  templateUrl: './validation-error-message.component.html',
  styleUrls: ['./validation-error-message.component.scss'],
})
export class ValidationErrorMessageComponent {
  @Input() errorMessage: string;
}
