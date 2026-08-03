import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EMPRESA_HERO_FALLBACK, EmpresaHero } from '../../data/empresa.model';

@Component({
  selector: 'app-empresa-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empresa-hero.html',
  styleUrl: './empresa-hero.css',
})
export class EmpresaHeroComponent {
  readonly hero = input.required<EmpresaHero>();

  protected readonly backgroundImage = computed(() => {
    const url = this.hero().imageUrl?.trim();
    return url || EMPRESA_HERO_FALLBACK;
  });
}
