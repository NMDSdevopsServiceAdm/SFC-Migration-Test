import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegulatedByCqcComponent } from '@features/add-workplace/regulated-by-cqc/regulated-by-cqc.component';
import { SelectWorkplaceAddressComponent } from '@features/add-workplace/select-workplace-address/select-workplace-address.component';
import { SelectWorkplaceComponent } from '@features/add-workplace/select-workplace/select-workplace.component';
import { StartComponent } from './start/start.component';

const routes: Routes = [
  {
    path: 'start',
    component: StartComponent,
    data: { title: 'Add Workplace' },
  },
  {
    path: 'regulated-by-cqc',
    component: RegulatedByCqcComponent,
    data: { title: 'Regulated by CQC' },
  },
  {
    path: 'select-workplace',
    component: SelectWorkplaceComponent,
    data: { title: 'Select Workplace' },
  },
  {
    path: 'select-workplace-address',
    component: SelectWorkplaceAddressComponent,
    data: { title: 'Select Workplace Address' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddWorkplaceRoutingModule {}