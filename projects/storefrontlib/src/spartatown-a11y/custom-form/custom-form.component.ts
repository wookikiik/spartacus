import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'cx-custom-form',
  templateUrl: './custom-form.component.html',
  styleUrls: ['./custom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomFormComponent {}
