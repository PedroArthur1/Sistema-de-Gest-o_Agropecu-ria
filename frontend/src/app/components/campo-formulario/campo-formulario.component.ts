import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-campo-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campo-formulario.component.html',
  styleUrl: './campo-formulario.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoFormularioComponent),
      multi: true
    }
  ]
})
export class CampoFormularioComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() tipo: 'text' | 'number' | 'select' | 'textarea' | 'date' = 'text';
  @Input() placeholder: string = '';
  @Input() obrigatorio: boolean = false;
  @Input() opcoes: string[] = [];
  @Input() mensagemErro: string = '';
  @Input() invalido: boolean = false;
  @Input() campoId: string = '';
  @Input() step: string = '';
  @Input() linhas: number = 3;

  valor: any = '';
  desabilitado: boolean = false;

  // Funções do ControlValueAccessor
  private onChange: (valor: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(valor: any): void {
    this.valor = valor ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado = desabilitado;
  }

  aoMudar(evento: Event): void {
    const elemento = evento.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const novoValor = this.tipo === 'number' ? parseFloat(elemento.value) : elemento.value;
    this.valor = novoValor;
    this.onChange(novoValor);
  }

  aoPerderFoco(): void {
    this.onTouched();
  }
}
