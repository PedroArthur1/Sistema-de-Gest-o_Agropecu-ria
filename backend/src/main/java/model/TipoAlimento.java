package model;

import jakarta.persistence.*;

@Entity
@Table(name = "tipos_alimento")
public class TipoAlimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    private User proprietario;

    public TipoAlimento() {}

    public TipoAlimento(Long id, String nome, String descricao, User proprietario) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.proprietario = proprietario;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public User getProprietario() { return proprietario; }
    public void setProprietario(User proprietario) { this.proprietario = proprietario; }
}
