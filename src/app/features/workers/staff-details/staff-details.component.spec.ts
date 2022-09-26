import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { Roles } from '@core/model/roles.enum';
import { WorkerEditResponse } from '@core/model/worker.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockJobService } from '@core/test-utils/MockJobService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService, MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { StaffDetailsComponent } from './staff-details.component';

describe('StaffDetailsComponent', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.datatype.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });

  async function setup(returnUrl = true) {
    const establishment = establishmentBuilder();
    const component = await render(StaffDetailsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        {
          provide: WindowRef,
          useValue: WindowRef,
        },
        {
          provide: Contracts,
          useValue: Contracts,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, Roles.Admin),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useValue: MockEstablishmentService,
        },
        {
          provide: JobService,
          useClass: MockJobService,
        },
        {
          provide: AuthService,
          useValue: MockAuthService,
        },
        {
          provide: WorkerService,
          useClass: returnUrl ? MockWorkerService : MockWorkerServiceWithoutReturnUrl,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
              parent: {
                url: [{ path: returnUrl ? 'staff-record' : 'staff-record/staff-record-summary' }],
              },
            },
            parent: {
              snapshot: {
                url: [{ path: 'staff-record' }],
                data: {
                  establishment,
                  primaryWorkplace: establishment,
                },
              },
            },
          },
        },
      ],
    });
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      establishmentService,
      router,
      spy,
    };
  }

  it('should render a StaffDetails', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save staff record' cta button and 'Cancel' link when adding a staff record`, async () => {
      const { component } = await setup(false);

      component.fixture.componentInstance.canReturn = false;
      component.fixture.detectChanges();

      expect(component.getByText('Save this staff record')).toBeTruthy();
      expect(component.getByText('Cancel')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link when editing a staff record`, async () => {
      const { component } = await setup();

      expect(component.getByText('Save and return')).toBeTruthy();
      expect(component.getByText('Cancel')).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the workplace but not the user account progress bar', async () => {
      const { component } = await setup();

      expect(component.getByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { component } = await setup(false);

      expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  it('should be able to submit when given correct data', async () => {
    const { component } = await setup();
    component.fixture.detectChanges();
    spyOn(component.fixture.componentInstance, 'onSubmit');
    const submit = component.fixture.nativeElement.querySelector('button[type="submit"]');
    submit.click();
    expect(component.fixture.componentInstance.onSubmit).toHaveBeenCalled();
  });

  it('should set submitted to true', async () => {
    const { component } = await setup();
    component.fixture.detectChanges();
    component.fixture.componentInstance.onSubmit();
    expect(component.fixture.componentInstance.submitted).toBeTruthy();
  });

  it('should be able to pass validation when given correct data', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.nameOrId.setValue('Jeff');
    form.controls.mainJob.setValue('1');
    form.controls.contract.setValue('Permanent');
    expect(form.valid).toBeTruthy();
  });

  it('should be able to fail validation when given wrong data', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.nameOrId.setValue('');
    form.controls.mainJob.setValue('');
    form.controls.contract.setValue('');
    expect(form.valid).toBeFalsy();
  });

  it('should see other job when not chosen other job', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.nameOrId.setValue('Jeff');
    form.controls.mainJob.setValue('3');
    form.controls.contract.setValue('Permanent');
    const contractSelect = component.fixture.nativeElement.querySelector('#mainJob');
    contractSelect.dispatchEvent(new Event('change'));
    component.fixture.detectChanges();
    const otherjob = component.fixture.nativeElement.querySelector('#otherJobRole-conditional');
    expect(otherjob).toBeTruthy();
  });

  it('should not see other job when not chosen other job type', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.nameOrId.setValue('Jeff');
    form.controls.mainJob.setValue('2');
    form.controls.contract.setValue('Permanent');
    const contractSelect = component.fixture.nativeElement.querySelector('#mainJob');
    contractSelect.dispatchEvent(new Event('change'));
    component.fixture.detectChanges();
    expect(component.fixture.nativeElement.querySelector('.govuk-select__conditional--hidden')).toBeTruthy();
  });

  it('should call the updateWorker api with correct information', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.nameOrId.setValue('Jeff');
    form.controls.mainJob.setValue('2');
    form.controls.contract.setValue('Permanent');

    const workerId = component.fixture.componentInstance.worker.uid;
    const workplaceId = component.fixture.componentInstance.workplace.uid;

    const saveButton = component.getByText('Save and return');

    fireEvent.click(saveButton);
    component.fixture.detectChanges();

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne(`/api/establishment/${workplaceId}/worker/${workerId}`);

    expect(req.request.body).toEqual({ nameOrId: 'Jeff', mainJob: { jobId: 2 }, contract: 'Permanent' });
  });

  it('should go to back to staff record page when editing existing a staff record', async () => {
    const { component, spy } = await setup();

    const form = component.fixture.componentInstance.form;
    form.controls.nameOrId.setValue('Jeff');
    form.controls.mainJob.setValue('2');
    form.controls.contract.setValue('Permanent');

    const workerId = component.fixture.componentInstance.worker.uid;
    const workplaceId = component.fixture.componentInstance.workplace.uid;

    spyOn(component.fixture.componentInstance.workerService, 'updateWorker').and.returnValue(
      of({ uid: workerId } as WorkerEditResponse),
    );
    const saveButton = component.getByText('Save and return');

    fireEvent.click(saveButton);
    component.fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'staff-record-summary']);
  });

  it('should go to mandatory-details url when adding a new staff record', async () => {
    const { component, spy } = await setup();
    component.fixture.componentInstance.editFlow = false;
    const form = component.fixture.componentInstance.form;
    form.controls.nameOrId.setValue('Jeff');
    form.controls.mainJob.setValue('2');
    form.controls.contract.setValue('Permanent');

    const workerId = component.fixture.componentInstance.worker.uid;
    const workplaceId = component.fixture.componentInstance.workplace.uid;

    spyOn(component.fixture.componentInstance.workerService, 'updateWorker').and.returnValue(
      of({ uid: workerId } as WorkerEditResponse),
    );
    const saveButton = component.getByText('Save and return');

    fireEvent.click(saveButton);
    component.fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'mandatory-details']);
  });

  it('should return to the dashboard if the user cancels adding of a new staff member', async () => {
    const { component, spy } = await setup();

    // reset worker mock
    component.fixture.componentInstance.worker = null;

    const cancelBtn = component.getByText('Cancel');
    expect(cancelBtn).toBeTruthy();
    fireEvent.click(cancelBtn);

    expect(spy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
  });
});
