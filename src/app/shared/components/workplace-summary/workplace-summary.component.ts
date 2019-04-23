import { I18nPluralPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { isArray } from 'util';

@Component({
  selector: 'app-workplace-summary',
  templateUrl: './workplace-summary.component.html',
  providers: [I18nPluralPipe],
})
export class WorkplaceSummaryComponent {
  public capacityMessages = [];
  public pluralMap = [];
  private _workplace: any;
  @Input() reportDetails: any;
  @Input() displayWDFReport: boolean;

  @Input()
  set workplace(workplace: any) {
    this._workplace = workplace;
    this.capacityMessages = [];

    if (this._workplace && this._workplace.capacities) {
      const temp = [];
      this._workplace.capacities.forEach(capacity => {
        temp[capacity.question] = temp[capacity.question] ? temp[capacity.question] + capacity.answer : capacity.answer;
      });

      if (Object.keys(temp).length) {
        Object.keys(temp).forEach(key => {
          const message = this.i18nPluralPipe.transform(temp[key], this.pluralMap[key]);
          this.capacityMessages.push(message);
        });
      }
    }
  }

  get workplace(): any {
    return this._workplace;
    debugger;
  }

  constructor(private i18nPluralPipe: I18nPluralPipe) {
    this.pluralMap['How many beds do you currently have?'] = {
      '=1': '# bed',
      other: '# beds',
    };
    this.pluralMap['How many of those beds are currently used?'] = {
      '=1': '# bed available',
      other: '# beds available',
    };
    this.pluralMap['How many places do you currently have?'] = {
      '=1': '# place',
      other: '# places',
    };
    this.pluralMap['Number of people receiving care on the completion date'] = {
      '=1': '# person receiving care',
      other: '# people receiving care',
    };
    this.pluralMap['Number of people using the service on the completion date'] = {
      '=1': '# person using the service',
      other: '# people using the service',
    };
  }

  isArray(variable) {
    return isArray(variable);
  }
}
