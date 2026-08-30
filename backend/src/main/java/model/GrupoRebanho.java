package model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(
        name = "grupos_rebanho",
        uniqueConstraints = @UniqueConstraint(columnNames = {"nome", "proprietario_id"})
)
public class GrupoRebanho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    private User proprietario;

    @OneToMany(mappedBy = "grupoRebanho", fetch = FetchType.LAZY)
    private List<Animal> animais;

    public GrupoRebanho() {}

    public GrupoRebanho(Long id, String nome, String descricao, User proprietario) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.proprietario = proprietario;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public User getProprietario() {
        return proprietario;
    }

    public void setProprietario(User proprietario) {
        this.proprietario = proprietario;
    }

    public List<Animal> getAnimais() {
        return animais;
    }

    public void setAnimais(List<Animal> animais) {
        this.animais = animais;
    }
}
