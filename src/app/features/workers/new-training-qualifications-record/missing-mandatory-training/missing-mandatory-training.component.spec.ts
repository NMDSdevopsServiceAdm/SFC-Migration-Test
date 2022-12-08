import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkersModule } from '../../workers.module';
import { MissingMandatoryTrainingComponent } from './missing-mandatory-training.component';

describe('MissingMandatoryTrainingComponent', () => {
  async function setup(categories = [], canEditWorker = false) {
    const { fixture, getByTestId } = await render(MissingMandatoryTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: '1',
                  },
                },
              },
            },
          }),
        },
      ],
      componentProperties: {
        missingRecord: categories,
        canEditWorker,
        training: { worker: { uid: '2' } },
      },
    });

    const component = fixture.componentInstance;
    const workplaceUid = component.workplace.uid;

    return {
      component,
      fixture,

      getByTestId,
    };
  }

  it('should render a MissingMandatoryTrainingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show an add button if you have permission to edit a worker', async () => {
    const { component, fixture, getByTestId } = await setup(
      [
        {
          category: 'Duty of care',
          id: 1,
        },
      ],
      true,
    );

    const addMissingRecord = getByTestId('addMissingRecord');
    expect(addMissingRecord.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/training-and-qualifications-record/${component.training.worker.uid}/add-training`,
    );
  });
});
