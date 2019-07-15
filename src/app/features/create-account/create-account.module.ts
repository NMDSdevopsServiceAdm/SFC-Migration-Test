import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateAccountRoutingModule } from '@features/create-account/create-account-routing.module';
import { SharedModule } from '@shared/shared.module';
import { CreateAccountComponent } from './create-account/create-account.component';
import { CreateUsernameComponent } from './create-username/create-username.component';
import { SecurityQuestionComponent } from './security-question/security-question.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, CreateAccountRoutingModule],
  declarations: [CreateAccountComponent, CreateUsernameComponent, SecurityQuestionComponent],
})
export class CreateAccountModule {}