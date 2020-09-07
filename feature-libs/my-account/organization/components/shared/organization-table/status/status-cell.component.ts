import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrganizationCellComponent } from '../organization-cell.component';

@Component({
  template: `
    <a
      [routerLink]="{ cxRoute: route, params: routeModel } | cxUrl"
      [class.is-active]="isActive"
      [tabindex]="tabIndex"
    >
      <span class="text"> {{ property | cxTranslate }}</span>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusCellComponent extends OrganizationCellComponent {
  get property() {
    return this.isActive ? 'organization.enabled' : 'organization.disabled';
  }

  get isActive(): boolean {
    return this.model.active;
  }
}
