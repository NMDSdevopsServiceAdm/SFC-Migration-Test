import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BenchmarksResponse, MetricsContent, Tile } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html',
  styleUrls: ['./benchmarks-tab.component.scss'],
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() workplace: Establishment;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;

  public payContent = MetricsContent.Pay;
  public turnoverContent = MetricsContent.Turnover;
  public qualificationsContent = MetricsContent.Qualifications;
  public sicknessContent = MetricsContent.Sickness;
  public canViewFullBenchmarks: boolean;

  public tilesData: BenchmarksResponse;

  constructor(
    private benchmarksService: BenchmarksService,
    private elRef: ElementRef,
    private pdfService: PdfService,
    private permissionsService: PermissionsService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.canViewFullBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    this.subscriptions.add(
      this.benchmarksService
        .getTileData(this.workplace.uid, ['sickness', 'turnover', 'pay', 'qualifications'])
        .subscribe((data) => {
          if (data) {
            this.tilesData = data;
          }
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get payTile(): Tile {
    return this.tilesData?.careWorkerPay;
  }

  get turnoverTile(): Tile {
    return this.tilesData?.turnoverRate;
  }

  get sicknessTile(): Tile {
    return this.tilesData?.sickness;
  }

  get qualificationsTile(): Tile {
    return this.tilesData?.qualifications;
  }

  public async downloadAsPDF($event: Event) {
    $event.preventDefault();
    try {
      return await this.pdfService.BuildBenchmarksPdf(
        this.elRef,
        this.aboutData.aboutData,
        this.workplace,
        'Benchmarks.pdf',
      );
    } catch (error) {
      console.error(error);
    }
  }

  public setReturn() {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }
}
