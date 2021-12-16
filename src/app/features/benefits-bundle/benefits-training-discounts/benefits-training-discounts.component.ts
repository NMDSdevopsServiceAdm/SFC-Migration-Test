import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-benefits-training-discounts',
  templateUrl: './benefits-training-discounts.component.html',
})
export class BenefitsTrainingDiscountsComponent implements OnInit {
  public workplaceName: string;
  public revealTitle = `What's an endorsed training provider?`;

  constructor(private establishmentService: EstablishmentService, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.workplaceName = this.establishmentService.primaryWorkplace.name;
    this.breadcrumbService.show(JourneyType.BENEFITS_BUNDLE);
  }
}
