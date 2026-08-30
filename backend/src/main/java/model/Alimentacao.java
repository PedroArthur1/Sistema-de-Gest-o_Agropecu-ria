package model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "alimentacoes")
public class Alimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "alimentacao_animal",
            joinColumns = @JoinColumn(name = "alimentacao_id"),
            inverseJoinColumns = @JoinColumn(name = "animal_id")
    )
    private List<Animal> animais;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_alimento_id", nullable = false)
    private TipoAlimento tipoAlimento;

    @Column(nullable = false)
    private String quantidade;

    @Column(nullable = false)
    private LocalDate data;

    private String observacoes;

    public Alimentacao() {}

    public Alimentacao(List<Animal> animais, TipoAlimento tipoAlimento, String quantidade, LocalDate data, String observacoes) {
        this.animais = animais;
        this.tipoAlimento = tipoAlimento;
        this.quantidade = quantidade;
        this.data = data;
        this.observacoes = observacoes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<Animal> getAnimais() { return animais; }
    public void setAnimais(List<Animal> animais) { this.animais = animais; }
    public TipoAlimento getTipoAlimento() { return tipoAlimento; }
    public void setTipoAlimento(TipoAlimento tipoAlimento) { this.tipoAlimento = tipoAlimento; }
    public String getQuantidade() { return quantidade; }
    public void setQuantidade(String quantidade) { this.quantidade = quantidade; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}