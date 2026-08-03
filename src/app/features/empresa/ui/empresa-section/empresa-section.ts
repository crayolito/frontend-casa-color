import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import {
  DEFAULT_EMPRESA_TITLE_COLOR,
  EmpresaSection,
} from '../../data/empresa.model';

@Component({
  selector: 'app-empresa-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeHtmlPipe],
  templateUrl: './empresa-section.html',
  styleUrl: './empresa-section.css',
})
export class EmpresaSectionComponent {
  readonly section = input.required<EmpresaSection>();

  protected readonly titleColor = computed(
    () => this.section().titleColor?.trim() || DEFAULT_EMPRESA_TITLE_COLOR,
  );

  protected readonly hasDescription = computed(
    () => !!this.section().descriptionHtml?.trim(),
  );
}
