import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { benchmarksData } from '@core/test-utils/MockBenchmarkService';
import { BenchmarksSelectViewPanelComponent } from '@shared/components/benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { DataAreaRecruitmentAndRetentionComponent } from './data-area-recruiment-and-retention.component';

describe('DataAreaRecruitmentAndRetentionComponent', () => {
  const setup = async (viewBenchmarksComparisonGroups = false) => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaRecruitmentAndRetentionComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        data: benchmarksData,
        viewBenchmarksComparisonGroups,
        rankingsData: {
          pay: {
            careWorkerPay: {
              groupRankings: {
                maxRank: 14,
                currentRank: 7,
                hasValue: true,
                allValues: [],
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
            seniorCareWorkerPay: {
              groupRankings: {
                maxRank: 3,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
            registeredNursePay: {
              groupRankings: {
                maxRank: 9,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
              goodCqcRankings: {
                maxRank: 3,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
            },
            registeredManagerPay: {
              groupRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
          },
          turnover: {
            groupRankings: {
              maxRank: 54,
              currentRank: 32,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 2,
              hasValue: true,
              allValues: [
                {
                  value: -1,
                  currentEst: false,
                },
                {
                  value: 0.3333333333333333,
                  currentEst: true,
                },
                {
                  value: 5,
                  currentEst: false,
                },
              ],
            },
          },
          sickness: {
            groupRankings: {
              maxRank: 42,
              currentRank: 11,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 3,
              hasValue: true,
              allValues: [],
            },
          },
          qualifications: {
            groupRankings: {
              maxRank: 41,
              currentRank: 1,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              hasValue: false,
              stateMessage: 'no-comparison-data',
            },
          },
          vacancy: {
            groupRankings: {
              maxRank: 88,
              currentRank: 21,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 1,
              hasValue: true,
              allValues: [],
            },
          },
          timeInRole: {
            groupRankings: {
              maxRank: 47,
              currentRank: 1,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 1,
              hasValue: true,
              allValues: [],
            },
          },
        },
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render values for the workplace and comparison data', async () => {
    const { component, getByTestId } = await setup();

    console.log(component.data.turnoverRate);
    const vacancyRow = getByTestId('vacancyRow');
    const turnoverRow = getByTestId('turnoverRow');
    const timeInRoleRow = getByTestId('timeInRoleRow');

    expect(within(vacancyRow).getByText('7%')).toBeTruthy();
    expect(within(vacancyRow).getByText('6%')).toBeTruthy();
    expect(within(turnoverRow).getByText('28%')).toBeTruthy();
    expect(within(turnoverRow).getByText('27%')).toBeTruthy();
    expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
    expect(within(timeInRoleRow).getByText('89%')).toBeTruthy();
  });

  it('should render the values for the workplace and goodCqc comparison data', async () => {
    const { getByTestId } = await setup(true);

    const vacancyRow = getByTestId('vacancyRow');
    const turnoverRow = getByTestId('turnoverRow');
    const timeInRoleRow = getByTestId('timeInRoleRow');

    expect(within(vacancyRow).getByText('7%')).toBeTruthy();
    expect(within(vacancyRow).getByText('5%')).toBeTruthy();
    expect(within(turnoverRow).getByText('28%')).toBeTruthy();
    expect(within(turnoverRow).getByText('29%')).toBeTruthy();
    expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
    expect(within(timeInRoleRow).getByText('90%')).toBeTruthy();
  });

  fdescribe('rankings area', async () => {
    it('should show when viewBenchmarksPosition is false', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.viewBenchmarksPosition = false;
      fixture.detectChanges();

      expect(getByTestId('rankings')).toBeTruthy();
      expect(queryByTestId('barcharts')).toBeFalsy();
    });

    describe('comparison grpoup rankings', async () => {
      it('should set rankings group rankings when there is group data and group toggle is false', async () => {
        const { component, fixture } = await setup();

        const rankingsDataForComparision = {
          pay: {
            careWorkerPay: {
              groupRankings: {
                maxRank: 14,
                currentRank: 7,
                hasValue: true,
                allValues: [],
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
            seniorCareWorkerPay: {
              groupRankings: {
                maxRank: 3,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
            registeredNursePay: {
              groupRankings: {
                maxRank: 9,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
              goodCqcRankings: {
                maxRank: 3,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
            },
            registeredManagerPay: {
              groupRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
          },
          turnover: {
            groupRankings: {
              maxRank: 54,
              currentRank: 32,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 2,
              hasValue: true,
              allValues: [
                {
                  value: -1,
                  currentEst: false,
                },
                {
                  value: 0.3333333333333333,
                  currentEst: true,
                },
                {
                  value: 5,
                  currentEst: false,
                },
              ],
            },
          },
          sickness: {
            groupRankings: {
              maxRank: 42,
              currentRank: 11,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 3,
              hasValue: true,
              allValues: [],
            },
          },
          qualifications: {
            groupRankings: {
              maxRank: 41,
              currentRank: 1,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              hasValue: false,
              stateMessage: 'no-comparison-data',
            },
          },
          vacancy: {
            groupRankings: {
              maxRank: 88,
              currentRank: 21,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 1,
              hasValue: true,
              allValues: [],
            },
          },
          timeInRole: {
            groupRankings: {
              maxRank: 47,
              currentRank: 2,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 7,
              currentRank: 2,
              hasValue: true,
              allValues: [],
            },
          },
        };

        component.viewBenchmarksComparisonGroups = false;
        fixture.detectChanges();

        component.rankingsData = rankingsDataForComparision;
        component.ngOnChanges();

        expect(component.vacancyMaxRank).toEqual(rankingsDataForComparision.vacancy.groupRankings.maxRank);
        expect(component.turnoverMaxRank).toEqual(rankingsDataForComparision.turnover.groupRankings.maxRank);
        expect(component.timeInRoleMaxRank).toEqual(rankingsDataForComparision.timeInRole.groupRankings.maxRank);

        expect(component.vacancyCurrentRank).toEqual(rankingsDataForComparision.vacancy.groupRankings.currentRank);
        expect(component.turnoverCurrentRank).toEqual(rankingsDataForComparision.turnover.groupRankings.currentRank);
        expect(component.timeInRoleCurrentRank).toEqual(
          rankingsDataForComparision.timeInRole.groupRankings.currentRank,
        );
      });

      it('should set rankings group rankings when there is group data and group toggle is true', async () => {
        const { component, fixture } = await setup();

        const rankingsDataForComparision = {
          pay: {
            careWorkerPay: {
              groupRankings: {
                maxRank: 14,
                currentRank: 7,
                hasValue: true,
                allValues: [],
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
            seniorCareWorkerPay: {
              groupRankings: {
                maxRank: 3,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
            registeredNursePay: {
              groupRankings: {
                maxRank: 9,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
              goodCqcRankings: {
                maxRank: 3,
                hasValue: false,
                stateMessage: 'no-pay-data',
              },
            },
            registeredManagerPay: {
              groupRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
              goodCqcRankings: {
                hasValue: false,
                stateMessage: 'no-comparison-data',
              },
            },
          },
          turnover: {
            groupRankings: {
              maxRank: 54,
              currentRank: 32,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 2,
              hasValue: true,
              allValues: [
                {
                  value: -1,
                  currentEst: false,
                },
                {
                  value: 0.3333333333333333,
                  currentEst: true,
                },
                {
                  value: 5,
                  currentEst: false,
                },
              ],
            },
          },
          sickness: {
            groupRankings: {
              maxRank: 42,
              currentRank: 11,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 3,
              hasValue: true,
              allValues: [],
            },
          },
          qualifications: {
            groupRankings: {
              maxRank: 41,
              currentRank: 1,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              hasValue: false,
              stateMessage: 'no-comparison-data',
            },
          },
          vacancy: {
            groupRankings: {
              maxRank: 88,
              currentRank: 21,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 3,
              currentRank: 1,
              hasValue: true,
              allValues: [],
            },
          },
          timeInRole: {
            groupRankings: {
              maxRank: 47,
              currentRank: 2,
              hasValue: true,
              allValues: [],
            },
            goodCqcRankings: {
              maxRank: 7,
              currentRank: 2,
              hasValue: true,
              allValues: [],
            },
          },
        };

        component.viewBenchmarksComparisonGroups = true;
        fixture.detectChanges();

        component.rankingsData = rankingsDataForComparision;
        component.ngOnChanges();

        expect(component.vacancyMaxRank).toEqual(rankingsDataForComparision.vacancy.goodCqcRankings.maxRank);
        expect(component.turnoverMaxRank).toEqual(rankingsDataForComparision.turnover.goodCqcRankings.maxRank);
        expect(component.timeInRoleMaxRank).toEqual(rankingsDataForComparision.timeInRole.goodCqcRankings.maxRank);

        expect(component.vacancyCurrentRank).toEqual(rankingsDataForComparision.vacancy.goodCqcRankings.currentRank);
        expect(component.turnoverCurrentRank).toEqual(rankingsDataForComparision.turnover.goodCqcRankings.currentRank);
        expect(component.timeInRoleCurrentRank).toEqual(
          rankingsDataForComparision.timeInRole.goodCqcRankings.currentRank,
        );
      });
    });
  });

  it('should show the barcharts area when viewBenchmarksPosition is true', async () => {
    const { component, fixture, getByTestId, queryByTestId } = await setup();

    component.viewBenchmarksPosition = true;
    fixture.detectChanges();

    expect(getByTestId('barcharts')).toBeTruthy();
    expect(queryByTestId('rankings')).toBeFalsy();
  });

  it('should toggle between rankings and benchmarks when the rank and positioned links are clicked', async () => {
    const { component, fixture, getByText, getByTestId } = await setup();

    component.viewBenchmarksPosition = true;
    fixture.detectChanges();

    fireEvent.click(getByText('Where you rank'));
    fixture.detectChanges();

    expect(component.viewBenchmarksPosition).toEqual(false);
    expect(getByTestId('rankings')).toBeTruthy();

    fireEvent.click(getByText(`Where you're positioned`));
    fixture.detectChanges();

    expect(component.viewBenchmarksPosition).toEqual(true);
    expect(getByTestId('barcharts')).toBeTruthy();
  });
});
