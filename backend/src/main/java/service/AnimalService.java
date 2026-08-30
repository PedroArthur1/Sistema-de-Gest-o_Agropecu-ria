package service;

import dto.AnimalDTO;
import model.Animal;
import model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import repository.AnimalRepository;
import repository.GrupoRebanhoRepository;
import model.GrupoRebanho;

import java.util.List;

@Service
public class AnimalService {

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private GrupoRebanhoRepository grupoRebanhoRepository;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @Transactional
    public AnimalDTO cadastrar(AnimalDTO dto) {
        validarCadastro(dto);
        User proprietario = usuarioAutenticadoService.obterUsuario();

        if (animalRepository.existsByCodigoIdentificacaoAndProprietario(dto.codigoIdentificacao().trim(), proprietario)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um animal cadastrado com o código " + dto.codigoIdentificacao().trim());
        }

        Animal animal = new Animal();
        animal.setCodigoIdentificacao(dto.codigoIdentificacao().trim());
        animal.setEspecie(dto.especie().trim());
        animal.setRaca(dto.raca().trim());
        animal.setSexo(dto.sexo().trim());
        animal.setDataNascimentoOuIdade(dto.dataNascimentoOuIdade().trim());
        animal.setPeso(dto.peso());
        animal.setCondicaoSaude(dto.condicaoSaude().trim());
        animal.setObservacoes(dto.observacoes() != null ? dto.observacoes().trim() : null);
        animal.setProprietario(proprietario);

        if (dto.grupoId() != null) {
            GrupoRebanho grupo = grupoRebanhoRepository.findByIdAndProprietario(dto.grupoId(), proprietario)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lote não encontrado."));
            animal.setGrupoRebanho(grupo);
        }

        return toDTO(animalRepository.save(animal));
    }

    @Transactional(readOnly = true)
    public List<AnimalDTO> listarDoUsuario() {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        return animalRepository.findByProprietario(proprietario).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnimalDTO buscarDoUsuarioComoDTO(Long animalId) {
        return toDTO(buscarDoUsuario(animalId));
    }

    @Transactional(readOnly = true)
    public Animal buscarDoUsuario(Long animalId) {
        User proprietario = usuarioAutenticadoService.obterUsuario();
        return animalRepository.findByIdAndProprietario(animalId, proprietario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Animal não encontrado. A vacinação só pode ser registrada para um animal previamente cadastrado."
                ));
    }

    @Transactional
    public AnimalDTO atualizar(Long id, AnimalDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados do animal são obrigatórios");
        }
        Animal animal = buscarDoUsuario(id);

        if (dto.codigoIdentificacao() != null && !dto.codigoIdentificacao().trim().equals(animal.getCodigoIdentificacao())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O código de identificação não pode ser alterado");
        }

        validarCadastro(dto);

        animal.setEspecie(dto.especie().trim());
        animal.setRaca(dto.raca().trim());
        animal.setSexo(dto.sexo().trim());
        animal.setDataNascimentoOuIdade(dto.dataNascimentoOuIdade().trim());
        animal.setPeso(dto.peso());
        animal.setCondicaoSaude(dto.condicaoSaude().trim());
        animal.setObservacoes(dto.observacoes() != null ? dto.observacoes().trim() : null);
        
        if (dto.grupoId() != null) {
            GrupoRebanho grupo = grupoRebanhoRepository.findByIdAndProprietario(dto.grupoId(), animal.getProprietario())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lote não encontrado."));
            animal.setGrupoRebanho(grupo);
        } else {
            animal.setGrupoRebanho(null);
        }

        return toDTO(animalRepository.save(animal));
    }

    @Transactional
    public void deletar(Long id) {
        Animal animal = buscarDoUsuario(id); // garante que o animal pertence ao usuário autenticado
        animalRepository.delete(animal);
    }

    private void validarCadastro(AnimalDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados do animal são obrigatórios");
        }
        exigirPreenchido(dto.codigoIdentificacao(), "Código de identificação é obrigatório");
        exigirPreenchido(dto.especie(), "Espécie é obrigatória");
        exigirPreenchido(dto.raca(), "Raça é obrigatória");
        exigirPreenchido(dto.sexo(), "Sexo é obrigatório");
        exigirPreenchido(dto.dataNascimentoOuIdade(), "Data de nascimento ou idade é obrigatória");
        exigirPreenchido(dto.condicaoSaude(), "Condição de saúde é obrigatória");
        if (dto.peso() == null || dto.peso() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Peso deve ser informado e não pode ser negativo");
        }
    }

    private void exigirPreenchido(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
        }
    }

    private AnimalDTO toDTO(Animal animal) {
        Long grupoId = animal.getGrupoRebanho() != null ? animal.getGrupoRebanho().getId() : null;
        String grupoNome = animal.getGrupoRebanho() != null ? animal.getGrupoRebanho().getNome() : null;
        return new AnimalDTO(
                animal.getId(),
                animal.getCodigoIdentificacao(),
                animal.getEspecie(),
                animal.getRaca(),
                animal.getSexo(),
                animal.getDataNascimentoOuIdade(),
                animal.getPeso(),
                animal.getCondicaoSaude(),
                animal.getObservacoes(),
                grupoId,
                grupoNome
        );
    }

    public Animal atualizar(Long id, Animal animalRecebido) {
        Animal animalExistente = animalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Animal não encontrado com ID: " + id));
        animalExistente.setCondicaoSaude(animalRecebido.getCondicaoSaude());
        return animalRepository.save(animalExistente);
    }
}
