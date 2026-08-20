import { TestBed } from '@angular/core/testing';
import { LembreteLocalStorageStrategy } from './lembrete-local-storage.strategy';
import { Animal } from '../../../models/animal.model';
import { Vacinacao } from '../../../models/vacinacao.model';

describe('LembreteLocalStorageStrategy', () => {
  let strategy: LembreteLocalStorageStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    strategy = TestBed.inject(LembreteLocalStorageStrategy);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve cruzar dados de animais e vacinacoes do localstorage e calcular o status corretamente', (done) => {
    const hojeStr = new Date().toISOString().split('T')[0];
    const ontemStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const animaisMock: Animal[] = [
      { id: 1, codigoIdentificacao: 'A1', especie: 'Bovino', raca: 'Nelore', dataNascimento: '', peso: 100, status: 'Ativo' }
    ];
    
    const vacinacoesMock: Vacinacao[] = [
      { id: 1, animalId: 1, nomeVacina: 'V1', dataAplicacao: '', dose: '1', responsavel: '', dataProximaDose: ontemStr }, // Atrasada
      { id: 2, animalId: 1, nomeVacina: 'V2', dataAplicacao: '', dose: '1', responsavel: '', dataProximaDose: hojeStr }   // Hoje
    ];

    localStorage.setItem('animais_mock_db', JSON.stringify(animaisMock));
    localStorage.setItem('vacinacoes_mock_db', JSON.stringify(vacinacoesMock));

    strategy.buscarLembretes().subscribe(lembretes => {
      expect(lembretes.length).toBe(2);
      expect(lembretes[0].status).toBe('Atrasada'); // Atrasada sempre vem primeiro devido ao sort
      expect(lembretes[1].status).toBe('Hoje');
      done();
    });
  });
});
