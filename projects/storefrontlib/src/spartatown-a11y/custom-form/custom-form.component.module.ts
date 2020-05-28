import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CustomFormComponent } from './custom-form.component';
import { SkipLinkModule } from '../../layout/a11y/skip-link/skip-link.module';
import { I18nModule } from '@spartacus/core';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SkipLinkModule, I18nModule],
  declarations: [CustomFormComponent],
  entryComponents: [CustomFormComponent],
  exports: [CustomFormComponent],
})
export class CustomFormModule {}
