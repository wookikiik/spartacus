import { ModuleWithProviders, NgModule } from '@angular/core';
import { TMS_COLLECTORS } from '@spartacus/core';
import { PageEventCollector } from './page-event.collector';

@NgModule({})
export class PageEventCollectorModule {
  static forRoot(): ModuleWithProviders<PageEventCollectorModule> {
    console.log('page event collectors module for root');
    return {
      ngModule: PageEventCollectorModule,
      providers: [
        {
          provide: TMS_COLLECTORS,
          useExisting: PageEventCollector,
          multi: true,
        },
      ],
    };
  }
}
