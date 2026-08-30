import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { AnimalService } from "../../../../services/animal/animal.service";
import { VacinacaoService } from "../../../../services/vacinacao/vacinacao.service";
import { Animal } from "../../../../models/animal.model";
import { Vacinacao } from "../../../../models/vacinacao.model";
import { CabecalhoPaginaComponent } from "../../../../components/cabecalho-pagina/cabecalho-pagina.component";
import { AlertaMensagemComponent } from "../../../../components/alerta-mensagem/alerta-mensagem.component";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { TratamentoService, Tratamento } from "../../../../services/tratamento/tratamento.service";
import { ConsultaService } from "../../../../services/consulta/consulta.service";
import { Consulta } from "../../../../models/consulta.model";

@Component({
  selector: "app-animal-detalhe",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CabecalhoPaginaComponent,
    AlertaMensagemComponent,
    ReactiveFormsModule
  ],
  templateUrl: "./animal-detalhe.html",
  styleUrl: "./animal-detalhe.css"
})
export class AnimalDetalhe implements OnInit {
  animal: Animal | null = null;
  historico: Vacinacao[] = [];
  proximasDoses: Vacinacao[] = [];
  carregando = true;
  errorMessage = "";
  tratamentoForm!: FormGroup;
  historicoTratamentos: Tratamento[] = [];
  mensagemSucessoTratamento: string = "";
  mostrarFormTratamento: boolean = false;

  // Consultas Veterinárias
  consultaForm!: FormGroup;
  historicoConsultas: Consulta[] = [];
  mensagemSucessoConsulta: string = "";
  mostrarFormConsulta: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private animalService: AnimalService,
    private vacinacaoService: VacinacaoService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private tratamentoService: TratamentoService,
    private consultaService: ConsultaService,
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get("id");
      const id = Number(idParam);

      if (!idParam || isNaN(id) || id <= 0) {
        this.errorMessage = "Identificador do animal inválido.";
        this.carregando = false;
        this.cdr.detectChanges();
        return;
      }

      this.carregarDados(id);
    });
    this.tratamentoForm = this.fb.group({
      medicamento: ["", Validators.required],
      data: ["", Validators.required],
      motivo: ["", Validators.required],
      dosagem: [""],
      observacoes: [""],
      dataPrevista: [""]
    }, { validators: this.validarDataPrevista });

    this.consultaForm = this.fb.group({
      dataConsulta: ["", Validators.required],
      motivo: ["", Validators.required],
      profissionalResponsavel: ["", Validators.required],
      diagnostico: [""],
      observacoes: [""],
      tratamentoIds: [[]]
    });
  }

  validarDataPrevista(group: FormGroup) {
    const data = group.get("data")?.value;
    const dataPrevista = group.get("dataPrevista")?.value;
    if (data && dataPrevista && dataPrevista < data) {
      group.get("dataPrevista")?.setErrors({ anterior: true });
      return { dataPrevistaAnterior: true };
    }
    const errors = group.get("dataPrevista")?.errors;
    if (errors) {
      delete errors["anterior"];
      if (Object.keys(errors).length === 0) {
        group.get("dataPrevista")?.setErrors(null);
      } else {
        group.get("dataPrevista")?.setErrors(errors);
      }
    }
    return null;
  }

  carregarDados(animalId: number): void {
    this.carregando = true;
    this.errorMessage = "";
    this.animal = null;
    this.historico = [];
    this.proximasDoses = [];

    forkJoin({
      animal: this.animalService.buscarAnimalPorId(animalId),
      historico: this.vacinacaoService.listarHistorico(animalId).pipe(catchError(() => of([]))),
      proximas: this.vacinacaoService.listarProximasDoses(animalId).pipe(catchError(() => of([]))),
      tratamentos: this.tratamentoService.listarPorAnimal(animalId).pipe(catchError(() => of([]))),
      consultas: this.consultaService.listarPorAnimal(animalId).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ animal, historico, proximas, tratamentos, consultas }) => {
        this.animal = animal;
        this.historico = historico ?? [];
        this.proximasDoses = proximas ?? [];
        this.historicoTratamentos = tratamentos ?? [];
        this.historicoConsultas = consultas ?? [];
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.carregando = false;
        if (err.status === 404) {
          this.errorMessage = "Animal não encontrado ou você não tem permissão para acessá-lo.";
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = "Sessão expirada ou não autenticada. Por favor, faça login novamente.";
        } else {
          this.errorMessage = "Erro ao carregar informações do animal. Verifique a conexão com o backend.";
        }
        this.cdr.detectChanges();
      }
    });
  }

  registrarNovoTratamento(): void {
    if (!this.animal || !this.animal.id) {
      return;
    }

    if (this.tratamentoForm.invalid) {
      this.tratamentoForm.markAllAsTouched();
      return;
    }

    const formValue = this.tratamentoForm.value;
    const novoTratamento: Tratamento = {
      animalId: this.animal.id,
      medicamento: formValue.medicamento,
      data: formValue.data,
      motivo: formValue.motivo,
      dosagem: formValue.dosagem || undefined,
      observacoes: formValue.observacoes || undefined,
      dataPrevista: formValue.dataPrevista || undefined
    };

    this.tratamentoService.registrarTratamento(novoTratamento).subscribe({
      next: (salvo: Tratamento) => {
        this.historicoTratamentos.unshift(salvo);
        this.tratamentoForm.reset();
        this.mostrarFormTratamento = false;
        this.mensagemSucessoTratamento = "Tratamento registrado com sucesso!";

        if (this.animal) {
          this.animal.condicaoSaude = "Em Tratamento";
          this.animalService.atualizarAnimal(this.animal.id!, this.animal).subscribe({
            next: () => {},
            error: (err: any) => console.error("Erro ao atualizar status do animal", err)
          });
        }

        this.cdr.detectChanges();
        setTimeout(() => {
          this.mensagemSucessoTratamento = "";
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        console.error("Erro ao salvar tratamento:", err);
        this.errorMessage = "Erro ao registrar tratamento. Verifique os dados e tente novamente.";
        this.cdr.detectChanges();
      }
    });
  }

  toggleFormTratamento(): void {
    this.mostrarFormTratamento = !this.mostrarFormTratamento;
  }

  // === Consultas Veterinárias ===

  registrarNovaConsulta(): void {
    if (this.consultaForm.valid) {
      const id = Number(this.route.snapshot.paramMap.get("id"));
      const formValue = this.consultaForm.value;
      const nova: Consulta = {
        animalId: id,
        dataConsulta: formValue.dataConsulta,
        motivo: formValue.motivo,
        profissionalResponsavel: formValue.profissionalResponsavel,
        diagnostico: formValue.diagnostico || undefined,
        observacoes: formValue.observacoes || undefined,
        tratamentoIds: formValue.tratamentoIds?.length ? formValue.tratamentoIds : undefined
      };

      this.consultaService.registrar(nova).subscribe({
        next: (res: Consulta) => {
          this.historicoConsultas.unshift(res);
          this.consultaForm.reset({ tratamentoIds: [] });
          this.mostrarFormConsulta = false;
          this.mensagemSucessoConsulta = "Consulta registrada com sucesso!";
          setTimeout(() => this.mensagemSucessoConsulta = "", 4000);
        },
        error: (err: any) => {
          console.error("Erro ao registrar consulta:", err);
        }
      });
    }
  }

  toggleFormConsulta(): void {
    this.mostrarFormConsulta = !this.mostrarFormConsulta;
  }

  onTratamentoCheckChange(event: Event, tratamentoId: number): void {
    const checkbox = event.target as HTMLInputElement;
    const currentIds: number[] = this.consultaForm.get("tratamentoIds")?.value || [];

    if (checkbox.checked) {
      this.consultaForm.patchValue({ tratamentoIds: [...currentIds, tratamentoId] });
    } else {
      this.consultaForm.patchValue({ tratamentoIds: currentIds.filter(id => id !== tratamentoId) });
    }
  }
}
