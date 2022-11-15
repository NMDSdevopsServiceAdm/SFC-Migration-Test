import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-social-care-qualification',
  templateUrl: './social-care-qualification.component.html',
})
export class SocialCareQualificationComponent extends QuestionComponent {
  public answersAvailable = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.form = this.formBuilder.group({
      qualificationInSocialCare: null,
    });
  }

  init() {
    if (this.worker.qualificationInSocialCare) {
      this.prefill();
    }
    this.next = this.getRoutePath('other-qualifications');
  }

  private prefill(): void {
    this.form.patchValue({
      qualificationInSocialCare: this.worker.qualificationInSocialCare,
    });
  }

  generateUpdateProps(): unknown {
    const { qualificationInSocialCare } = this.form.value;

    if (!qualificationInSocialCare) {
      return null;
    }

    return {
      qualificationInSocialCare,
    };
  }

  onSuccess(): void {
    const { qualificationInSocialCare } = this.form.value;

    const summaryRecordUrl = this.getRoutePath('');
    if (qualificationInSocialCare === 'Yes') {
      if (this.insideFlow) {
        this.next = this.getRoutePath('social-care-qualification-level');
      } else {
        this.next = summaryRecordUrl;
        this.next.push('social-care-qualification-level');
      }
    } else {
      !this.insideFlow && (this.next = summaryRecordUrl);
    }
  }
}
