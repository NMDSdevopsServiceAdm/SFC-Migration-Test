import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { render } from '@testing-library/angular';

import { BulkUploadRelatedContentComponent } from '../bulk-upload-sidebar/bulk-upload-related-content/bulk-upload-related-content.component';
import { CodesAndGuidanceComponent } from '../codes-and-guidance/codes-and-guidance.component';
import { BulkUploadTroubleshootingComponent } from './bulk-upload-troubleshooting-page.component';

describe('BulkUploadTroubleshootingComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(BulkUploadTroubleshootingComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        { provide: AuthService, useClass: MockAuthService },
      ],
      declarations: [BulkUploadTroubleshootingComponent, BulkUploadRelatedContentComponent, CodesAndGuidanceComponent],
    });
    const component = fixture.componentInstance;

    return { fixture, component, getByText };
  };

  it('Should render a BulkUploadTroubleshootingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('Should render the page heading, and fixed text', async () => {
    const { getByText } = await setup();

    expect(getByText('Troubleshooting')).toBeTruthy();
    expect(
      getByText('Our handy hints could help you fix common problems and errors that some bulk uploads have reported'),
    ).toBeTruthy();
  });

  it('should render related contents and download codes and guidance links', async () => {
    const { fixture, getByText } = await setup();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getByText('Related content')).toBeTruthy();
      expect(getByText('Download codes and guidance')).toBeTruthy();
    });
  });

  it('should render get help with bulk uploads and data changes links under the related contents', async () => {
    const { fixture, getByText } = await setup();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(getByText('Data changes')).toBeTruthy();
      expect(getByText('About bulk upload')).toBeTruthy();
    });
  });
});
