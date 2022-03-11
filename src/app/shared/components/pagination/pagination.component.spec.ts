import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  async function setup(noOfItemsOnPage = 15, totalNoOfItems = 43) {
    const component = await render(PaginationComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [],
      componentProperties: {
        noOfItemsOnPage,
        totalNoOfItems,
      },
    });

    return component;
  }

  it('should render a PaginationComponent', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('Displaying numbers and previous/next buttons', () => {
    it('should not display Previous when on first page', async () => {
      const { queryByText } = await setup();
      expect(queryByText('Previous')).toBeFalsy();
    });

    it('should display 1 to 3 when 43 items and pages of 15', async () => {
      const { queryByText } = await setup();

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('3')).toBeTruthy();
      expect(queryByText('4')).toBeFalsy();
    });

    it('should display 1 to 5 when 43 items and pages of 10', async () => {
      const { queryByText } = await setup(10, 43);

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('3')).toBeTruthy();
      expect(queryByText('4')).toBeTruthy();
      expect(queryByText('5')).toBeTruthy();
      expect(queryByText('6')).toBeFalsy();
    });

    it('should not display any elipsis when only there are less than 10 pages', async () => {
      const { fixture, queryByTestId } = await setup(15, 135);

      fixture.componentInstance.currentPageNo = 4;
      fixture.detectChanges();

      expect(queryByTestId('elipsis-1')).toBeNull();
      expect(queryByTestId('elipsis-7')).toBeNull();
    });

    it('should not display anything when only one page worth of items', async () => {
      const { queryByText } = await setup(15, 12);

      expect(queryByText('Previous')).toBeFalsy();
      expect(queryByText('Next')).toBeFalsy();
      expect(queryByText('1')).toBeFalsy();
    });

    it('should not display Next when on final page', async () => {
      const { fixture, queryByText } = await setup();

      fixture.componentInstance.currentPageNo = 2;
      fixture.detectChanges();

      expect(queryByText('Next')).toBeFalsy();
    });

    it('should display 1 as text (not link) when on page 1', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('pageNoText-0')).toBeTruthy();
    });
  });

  describe('Displaying changes when clicking to page', () => {
    it('should display 1 as link and 2 as text when Next clicked from first page', async () => {
      const { fixture, queryByText, queryByTestId } = await setup();

      const nextPageButton = queryByText('Next');
      nextPageButton.click();

      fixture.detectChanges();

      expect(queryByTestId('pageNoLink-0')).toBeTruthy();
      expect(queryByTestId('pageNoText-0')).toBeFalsy();

      expect(queryByTestId('pageNoText-1')).toBeTruthy();
      expect(queryByTestId('pageNoLink-1')).toBeFalsy();
    });

    it('should display 1 as text and 2 as link when Previous clicked from second page', async () => {
      const { fixture, queryByText, queryByTestId } = await setup();

      fixture.componentInstance.currentPageNo = 1;
      fixture.detectChanges();

      const previousPageButton = queryByText('Previous');
      previousPageButton.click();

      fixture.detectChanges();

      expect(queryByTestId('pageNoLink-0')).toBeFalsy();
      expect(queryByTestId('pageNoText-0')).toBeTruthy();

      expect(queryByTestId('pageNoText-1')).toBeFalsy();
      expect(queryByTestId('pageNoLink-1')).toBeTruthy();
    });

    it('should display 1 as link and 3 as text when 3 clicked from first page', async () => {
      const { fixture, queryByText, queryByTestId } = await setup();

      const nextPageButton = queryByText('3');
      nextPageButton.click();

      fixture.detectChanges();

      expect(queryByTestId('pageNoLink-0')).toBeTruthy();
      expect(queryByTestId('pageNoText-0')).toBeFalsy();

      expect(queryByTestId('pageNoText-2')).toBeTruthy();
      expect(queryByTestId('pageNoLink-2')).toBeFalsy();
    });
  });

  describe('Emitting event when clicking to page', () => {
    it('should emit pageNo 1 and noOfItemsOnPage when Next button clicked from first page', async () => {
      const { fixture, queryByText } = await setup();

      const emitSpy = spyOn(fixture.componentInstance.emitCurrentPage, 'emit');

      const nextPageButton = queryByText('Next');
      nextPageButton.click();

      expect(emitSpy).toHaveBeenCalledWith({ pageNo: 1, noOfItemsOnPage: 15 });
    });

    it('should emit pageNo 0 and noOfItemsOnPage when going to page 1 by clicking Previous button', async () => {
      const { fixture, queryByText } = await setup();

      const emitSpy = spyOn(fixture.componentInstance.emitCurrentPage, 'emit');

      fixture.componentInstance.currentPageNo = 1;
      fixture.detectChanges();

      const previousPageButton = queryByText('Previous');
      previousPageButton.click();

      expect(emitSpy).toHaveBeenCalledWith({ pageNo: 0, noOfItemsOnPage: 15 });
    });

    it('should emit pageNo 2 and noOfItemsOnPage when 3 clicked', async () => {
      const { fixture, queryByText } = await setup();

      const emitSpy = spyOn(fixture.componentInstance.emitCurrentPage, 'emit');

      const nextPageButton = queryByText('3');
      nextPageButton.click();

      expect(emitSpy).toHaveBeenCalledWith({ pageNo: 2, noOfItemsOnPage: 15 });
    });
  });

  describe('Displaying numbers when there are more than 10 pages', () => {
    it('should display page numbers 1 to 3 and final page number when on first page', async () => {
      const { queryByText } = await setup(15, 152);

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('3')).toBeTruthy();

      expect(queryByText('4')).toBeFalsy();
      expect(queryByText('5')).toBeFalsy();
      expect(queryByText('6')).toBeFalsy();
      expect(queryByText('7')).toBeFalsy();
      expect(queryByText('8')).toBeFalsy();
      expect(queryByText('9')).toBeFalsy();
      expect(queryByText('10')).toBeFalsy();

      expect(queryByText('11')).toBeTruthy();
    });

    it('should display page numbers 11 - 9 and first page number when on last page', async () => {
      const { queryByText, fixture } = await setup(15, 152);

      fixture.componentInstance.currentPageNo = 10;
      fixture.detectChanges();

      expect(queryByText('1')).toBeTruthy();

      expect(queryByText('2')).toBeFalsy();
      expect(queryByText('3')).toBeFalsy();
      expect(queryByText('4')).toBeFalsy();
      expect(queryByText('5')).toBeFalsy();
      expect(queryByText('6')).toBeFalsy();
      expect(queryByText('7')).toBeFalsy();
      expect(queryByText('8')).toBeFalsy();

      expect(queryByText('9')).toBeTruthy();
      expect(queryByText('10')).toBeTruthy();
      expect(queryByText('11')).toBeTruthy();
    });

    it('should display first, last, and pages 3-7 when on page 5', async () => {
      const { queryByText, fixture } = await setup(15, 149);

      fixture.componentInstance.currentPageNo = 4;
      fixture.detectChanges();

      expect(queryByText('1')).toBeTruthy();

      expect(queryByText('2')).toBeFalsy();

      expect(queryByText('3')).toBeTruthy();
      expect(queryByText('4')).toBeTruthy();
      expect(queryByText('5')).toBeTruthy();
      expect(queryByText('6')).toBeTruthy();
      expect(queryByText('7')).toBeTruthy();

      expect(queryByText('8')).toBeFalsy();
      expect(queryByText('9')).toBeFalsy();

      expect(queryByText('10')).toBeTruthy();
    });
  });
  describe('Displaying elipsis when there are more than 10 pages', async () => {
    it('Should display an elipsis after pages 1-3 when on first page', async () => {
      const { queryByText, queryByTestId } = await setup(15, 149);

      expect(queryByText('1')).toBeTruthy();
      expect(queryByText('2')).toBeTruthy();
      expect(queryByText('3')).toBeTruthy();

      expect(queryByTestId('elipsis-3')).toBeTruthy();
    });

    it('Should display an elipsis before pages 8-10 when on last page', async () => {
      const { fixture, queryByText, queryByTestId } = await setup(15, 149);

      fixture.componentInstance.currentPageNo = 9;
      fixture.detectChanges();

      expect(queryByTestId('elipsis-6')).toBeTruthy();
      expect(queryByText('8')).toBeTruthy();
      expect(queryByText('9')).toBeTruthy();
      expect(queryByText('10')).toBeTruthy();
    });

    it('Should display first, first elpisis, pages 4-8 when on page 6', async () => {
      const { fixture, queryByText, queryByTestId } = await setup(15, 149);

      fixture.componentInstance.currentPageNo = 5;
      fixture.detectChanges();

      expect(queryByText('1')).toBeTruthy();
      expect(queryByTestId('elipsis-2')).toBeTruthy();
      expect(queryByText('4')).toBeTruthy();
      expect(queryByText('5')).toBeTruthy();
      expect(queryByText('6')).toBeTruthy();
      expect(queryByText('7')).toBeTruthy();
      expect(queryByText('8')).toBeTruthy();
      expect(queryByTestId('elipsis-8')).toBeTruthy();
      expect(queryByText('10')).toBeTruthy();
    });
  });
});
