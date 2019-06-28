import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { DashboardHeaderComponent } from '@shared/components/dashboard-header/dashboard-header.component';

import { AutoSuggestComponent } from './components/auto-suggest/auto-suggest.component';
import { BackLinkComponent } from './components/back-link/back-link.component';
import { CharacterCountComponent } from './components/character-count/character-count.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DetailsComponent } from './components/details/details.component';
import { ErrorSummaryComponent } from './components/error-summary/error-summary.component';
import { InsetTextComponent } from './components/inset-text/inset-text.component';
import { MessagesComponent } from './components/messages/messages.component';
import { PanelComponent } from './components/panel/panel.component';
import { PhaseBannerComponent } from './components/phase-banner/phase-banner.component';
import { ProgressComponent } from './components/progress/progress.component';
import { SkipLinkComponent } from './components/skip-link/skip-link.component';
import { StartButtonComponent } from './components/start-button/start-button.component';
import { StatusComponent } from './components/status/status.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TotalStaffPanelComponent } from './components/total-staff-panel/total-staff-panel.component';
import { WorkplaceSummaryComponent } from './components/workplace-summary/workplace-summary.component';
import { FileValueAccessorDirective } from './form-controls/file-control-value-accessor';
import { AbsoluteNumberPipe } from './pipes/absolute-number.pipe';
import { ClosedEndedAnswerPipe } from './pipes/closed-ended-answer.pipe';
import { OpenEndedAnswerPipe } from './pipes/open-ended-answer.pipe';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  declarations: [
    AbsoluteNumberPipe,
    AlertComponent,
    AutoSuggestComponent,
    BackLinkComponent,
    CharacterCountComponent,
    DashboardHeaderComponent,
    DatePickerComponent,
    DetailsComponent,
    ErrorSummaryComponent,
    FileValueAccessorDirective,
    InsetTextComponent,
    MessagesComponent,
    PanelComponent,
    PhaseBannerComponent,
    ProgressComponent,
    SkipLinkComponent,
    StartButtonComponent,
    StatusComponent,
    SubmitButtonComponent,
    TabComponent,
    TabsComponent,
    TotalStaffPanelComponent,
    WorkplaceSummaryComponent,
    OpenEndedAnswerPipe,
    ClosedEndedAnswerPipe,
  ],
  exports: [
    AlertComponent,
    AutoSuggestComponent,
    BackLinkComponent,
    CharacterCountComponent,
    DashboardHeaderComponent,
    DatePickerComponent,
    DetailsComponent,
    ErrorSummaryComponent,
    FileValueAccessorDirective,
    InsetTextComponent,
    MessagesComponent,
    PanelComponent,
    PhaseBannerComponent,
    ProgressComponent,
    SkipLinkComponent,
    StartButtonComponent,
    StatusComponent,
    SubmitButtonComponent,
    TabComponent,
    TabsComponent,
    TotalStaffPanelComponent,
    WorkplaceSummaryComponent,
    OpenEndedAnswerPipe,
    ClosedEndedAnswerPipe,
  ],
})
export class SharedModule {}
