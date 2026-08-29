import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rebanho } from './rebanho';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Animal } from '../../../models/animal.model';

describe('Rebanho', () => {
  let component: Rebanho;
  let fixture: ComponentFixture<Rebanho>;

  const animaisMock: Animal[] = [
    {
      id: 1,
      codigoIdentificacao: 'BOV-001',
      especie: 'Bovino',
      raca: 'Nelore',
      sexo: 'MACHO',
      dataNascimentoOuIdade: '2024-05-10',
      peso: 450,
      condicaoSaude: 'Saudável'
    },
    {
      id: 2,
      codigoIdentificacao: 'EQU-002',
      especie: 'Equino',
      raca: 'Mangalarga',
      sexo: 'FEMEA',
      dataNascimentoOuIdade: '2023-01-15',
      peso: 400,
      condicaoSaude: 'Em Tratamento'
    },
    {
      id: 3,
      codigoIdentificacao: 'BOV-003',
      especie: 'Bovino',
      raca: 'Angus',
      sexo: 'FEMEA',
      dataNascimentoOuIdade: '2 anos',
      peso: 380,
      condicaoSaude: 'Em Observação'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rebanho],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rebanho);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar com o array de animais vazio (empty state)', () => {
    expect(component.animais.length).toBe(0);
    const emptyStateEl = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyStateEl).toBeTruthy();
  });

  it('deve mudar a aba ativa ao clicar nela', () => {
    component.abaAtiva = 'Vacinados';
    fixture.detectChanges();
    
    expect(component.abaAtiva).toBe('Vacinados');
  });

  it('deve filtrar animais pelo código de identificação', () => {
    component.animais = animaisMock;
    component.termoPesquisa = 'BOV-001';
    
    expect(component.animaisFiltrados.length).toBe(1);
    expect(component.animaisFiltrados[0].codigoIdentificacao).toBe('BOV-001');
  });

  it('deve filtrar animais pela raça', () => {
    component.animais = animaisMock;
    component.termoPesquisa = 'mangalarga';
    
    expect(component.animaisFiltrados.length).toBe(1);
    expect(component.animaisFiltrados[0].raca).toBe('Mangalarga');
  });

  it('deve filtrar animais pelo sexo', () => {
    component.animais = animaisMock;
    component.termoPesquisa = 'MACHO';
    
    expect(component.animaisFiltrados.length).toBe(1);
    expect(component.animaisFiltrados[0].codigoIdentificacao).toBe('BOV-001');

    component.termoPesquisa = 'fêmea';
    expect(component.animaisFiltrados.length).toBe(2);
  });

  it('deve filtrar animais pela data ou idade', () => {
    component.animais = animaisMock;
    component.termoPesquisa = '2024';
    expect(component.animaisFiltrados.length).toBe(1);
    expect(component.animaisFiltrados[0].codigoIdentificacao).toBe('BOV-001');

    component.termoPesquisa = '2 anos';
    expect(component.animaisFiltrados.length).toBe(1);
    expect(component.animaisFiltrados[0].codigoIdentificacao).toBe('BOV-003');
  });

  it('deve limpar a pesquisa corretamente', () => {
    component.animais = animaisMock;
    component.termoPesquisa = 'Nelore';
    expect(component.animaisFiltrados.length).toBe(1);

    component.limparPesquisa();
    expect(component.termoPesquisa).toBe('');
    expect(component.animaisFiltrados.length).toBe(3);
  });

  // --- Testes do Modal de Exclusão ---
  it('deve abrir o modal de exclusão e definir o animalParaExclusao', () => {
    const animal = animaisMock[0];
    component.abrirModalExclusao(animal);
    
    expect(component.exibirModalExclusao).toBe(true);
    expect(component.animalParaExclusao).toEqual(animal);
  });

  it('deve fechar o modal de exclusão e limpar o animalParaExclusao', () => {
    component.exibirModalExclusao = true;
    component.animalParaExclusao = animaisMock[0];
    
    component.fecharModalExclusao();
    
    expect(component.exibirModalExclusao).toBe(false);
    expect(component.animalParaExclusao).toBeNull();
  });
});

