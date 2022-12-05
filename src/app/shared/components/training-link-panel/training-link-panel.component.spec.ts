import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { TrainingLinkPanelComponent } from '@shared/components/training-link-panel/training-link-panel.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment as MockEstablishment } from '../../../../mockdata/establishment';

fdescribe('TrainingLinkPanelComponent', () => {
  async function setup() {
    const { fixture, getByText, queryByText } = await render(TrainingLinkPanelComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, Roles.Admin),
          deps: [HttpClient],
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditEstablishment']),
          deps: [HttpClient, Router, UserService],
        },
      ],
      componentProperties: {
        workplace: MockEstablishment as Establishment,
        workers: [
          {
            trainingCount: 1,
            trainingLastUpdated: new Date('2020-01-01').toISOString(),
          },
        ] as Worker[],
        totalRecords: 6,
      },
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText };
  }

  it('should render a TrainingLinkPanelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the total number of records', async () => {
    const { getByText } = await setup();

    expect(getByText('Training and qualifications (6)'));
  });

  xit('should show the latest date of any training record (1/1/20)', async () => {
    const { getByText } = await setup();
    expect(getByText('Updated 1 January 2020')).toBeTruthy();
  });

  it('should show the `Add and manage mandatory training categories` link when canEditEstablishment in permissions service is true', async () => {
    const { getByText } = await setup();

    expect(getByText('Add and manage mandatory training categories')).toBeTruthy();
  });

  it('should not show the `Add and manage mandatory training categories` link when user does not have edit access', async () => {
    const { component, fixture, queryByText } = await setup();

    component.canEditEstablishment = false;
    fixture.detectChanges();

    expect(queryByText('Add and manage mandatory training categories')).toBeFalsy();
  });

  it('should show the `Manage expiry alerts` link when canEditEstablishment in permissions service is true', async () => {
    const { component, fixture, getByText } = await setup();

    component.canEditEstablishment = true;
    fixture.detectChanges();

    expect(getByText('Manage expiry alerts')).toBeTruthy();
  });

  it('should not show the `Manage expiry alerts` link when canEditEstablishment in permissions service is false', async () => {
    const { component, fixture, queryByText } = await setup();

    component.canEditEstablishment = false;
    fixture.detectChanges();

    expect(queryByText(`Manage expiry alerts' alerts`)).toBeFalsy();
  });

  it('should call getTrainingAndQualificationsReport with establishment uid when Download training report is clicked', async () => {
    const { component, fixture, getByText } = await setup();

    const reportService = TestBed.inject(ReportService);
    const reportServiceSpy = spyOn(reportService, 'getTrainingAndQualificationsReport').and.returnValue(of(null));
    const saveFileSpy = spyOn(component, 'saveFile').and.returnValue(null);

    const downloadTrainingButton = getByText('Download training report');

    downloadTrainingButton.click();
    fixture.detectChanges();

    expect(reportServiceSpy).toHaveBeenCalledWith(component.establishmentUid);
    expect(saveFileSpy).toHaveBeenCalled();
  });

  it('should display the `Add multiple training records` button with the correct link when the user has edit permission', async () => {
    const { component, fixture, getByText } = await setup();

    component.canEditWorker = true;
    fixture.detectChanges();

    const workplaceUid = component.workplace.uid;
    const multipleTrainingButton = getByText('Add multiple training records');
    expect(multipleTrainingButton).toBeTruthy();
    expect(multipleTrainingButton.getAttribute('href')).toEqual(
      `/workplace/${workplaceUid}/add-multiple-training/select-staff`,
    );
  });

  it('should not display the `Add multiple training records` button when the user does not have edit permission', async () => {
    const { queryByText } = await setup();

    const multipleTrainingButton = queryByText('Add multiple training records');
    expect(multipleTrainingButton).toBeFalsy();
  });

  describe('Parent training and quals report', () => {
    it('should call getParentTrainingAndQualificationsReport with establishment uid when Download training report is clicked', async () => {
      const { component, fixture, getByText } = await setup();

      const reportService = TestBed.inject(ReportService);
      const reportServiceSpy = spyOn(reportService, 'getParentTrainingAndQualificationsReport').and.returnValue(
        of(null),
      );
      const saveFileSpy = spyOn(component, 'saveFile').and.returnValue(null);

      component.isParent = true;
      fixture.detectChanges();

      const downloadTrainingButton = getByText('Download parent training report');
      downloadTrainingButton.click();
      fixture.detectChanges();

      expect(reportServiceSpy).toHaveBeenCalledWith(component.establishmentUid);
      expect(saveFileSpy).toHaveBeenCalled();
    });

    it('should only be visible for parents', async () => {
      const { component, fixture, getByText } = await setup();

      component.isParent = true;
      fixture.detectChanges();

      const downloadTrainingButton = getByText('Download parent training report');
      expect(downloadTrainingButton).toBeTruthy();
    });

    it('should not be visible for standalone workplaces', async () => {
      const { component, fixture, queryByText } = await setup();

      component.isParent = false;
      fixture.detectChanges();

      const downloadTrainingButton = queryByText('Download parent training report');
      expect(downloadTrainingButton).toBeFalsy();
    });
  });
});
