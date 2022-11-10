import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DATE_DISPLAY_DEFAULT } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';

import { DateOfBirthComponent } from './date-of-birth.component';

describe('DateOfBirthComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      DateOfBirthComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                  data: {
                    establishment: { uid: 'mocked-uid' },
                    primaryWorkplace: {},
                  },
                },
              },
            },
          },
          {
            provide: WorkerService,
            useClass: MockWorkerServiceWithUpdateWorker,
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService);
    const backService = injector.inject(BackService);

    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerServiceSpy = spyOn(workerService, 'updateWorker').and.callThrough();
    const backLinkSpy = spyOn(backService, 'setBackLink');

    return {
      component,
      fixture,
      workerService,
      routerSpy,
      submitSpy,
      workerServiceSpy,
      backLinkSpy,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the DateOfBirthComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' and 'Skip this question' link if in the flow`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup();

      userEvent.type(getByLabelText('Day'), '11');
      userEvent.type(getByLabelText('Month'), '6');
      userEvent.type(getByLabelText('Year'), '1993');
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ dob: { day: 11, month: 6, year: 1993 } });

      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        dateOfBirth: '1993-06-11',
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'national-insurance-number',
      ]);
    });

    it('allows the user to view the staff record summary', async () => {
      const { fixture, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup();

      userEvent.click(getByText('View this staff record'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'summary', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'staff-record-summary',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('allows the user to skip the question', async () => {
      const { fixture, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup();

      userEvent.click(getByText('Skip this question'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'skip', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'national-insurance-number',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if outside the flow`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and return' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup(
        false,
      );

      userEvent.type(getByLabelText('Day'), '11');
      userEvent.type(getByLabelText('Month'), '6');
      userEvent.type(getByLabelText('Year'), '1993');
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ dob: { day: 11, month: 6, year: 1993 } });

      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        dateOfBirth: '1993-06-11',
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'staff-record-summary',
      ]);
    });

    it('return to the staff record summary when cancel is clicked', async () => {
      const { fixture, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup(false);

      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'staff-record-summary',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('error messages', () => {
    it('returns an error if an invalid date is entered', async () => {
      const { fixture, getByText, getAllByText, getByLabelText } = await setup();

      userEvent.type(getByLabelText('Day'), '55555');
      userEvent.type(getByLabelText('Month'), '12');
      userEvent.type(getByLabelText('Year'), '2000');
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const errors = getAllByText('Enter a valid date of birth, like 31 3 1980');

      expect(errors.length).toBe(2);
    });

    it('returns an error if an out-of-range date is entered', async () => {
      const { fixture, getByText, getAllByText, getByLabelText } = await setup();

      const minDate = dayjs().subtract(100, 'years').add(1, 'days');
      const maxDate = dayjs().subtract(14, 'years');

      userEvent.type(getByLabelText('Day'), '1');
      userEvent.type(getByLabelText('Month'), '12');
      userEvent.type(getByLabelText('Year'), '1000');
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const errors = getAllByText(
        `Date of birth must to be between ${minDate.format(DATE_DISPLAY_DEFAULT)} and ${maxDate.format(
          DATE_DISPLAY_DEFAULT,
        )}.`,
      );

      expect(errors.length).toBe(2);
    });
  });

  describe('setBackLink()', () => {
    it('should set the backlink to /workplace/workplace-uid, when in the flow but addStaffRecoredInProgress is false and primary workplace id is different to workplace id', async () => {
      const { component, backLinkSpy } = await setup();

      component.setBackLink();
      expect(backLinkSpy).toHaveBeenCalledWith({
        url: [`/workplace/${component.workplace.uid}`],
        fragment: 'staff-records',
      });
    });

    it('should set the backlink to /dasboard, when in the flow but addStaffRecoredInProgress is false and primary workplace id is equal to workplace id', async () => {
      const { component, fixture, backLinkSpy } = await setup();

      const establishmentService = TestBed.inject(EstablishmentService);
      spyOnProperty(establishmentService, 'primaryWorkplace').and.returnValue({ uid: 'mocked-uid' });
      component.initiated = false;
      component.ngOnInit();

      fixture.detectChanges();
      component.setBackLink();
      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/dashboard'],
        fragment: 'staff-records',
      });
    });

    it('should set the backlink to mandatory-details, when in the flow and addStaffRecordInProgress is true', async () => {
      const { component, backLinkSpy, workerService } = await setup();

      spyOnProperty(workerService, 'addStaffRecordInProgress', 'get').and.returnValue(true);
      component.initiated = false;
      component.ngOnInit();
      component.setBackLink();
      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/workplace', component.workplace.uid, 'staff-record', component.worker.uid, 'mandatory-details'],
        fragment: 'staff-records',
      });
    });

    it('should set the backlink to staff-record-summary, when not in the flow', async () => {
      const { component, backLinkSpy } = await setup(false);

      component.setBackLink();
      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/workplace', component.workplace.uid, 'staff-record', component.worker.uid, 'staff-record-summary'],
        fragment: 'staff-records',
      });
    });
  });
});
