package model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "animais",
        uniqueConstraints = @UniqueConstraint(columnNames = {"codigo_identificacao", "proprietario_id"})
)
public class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_identificacao", nullable = false)
    private String codigoIdentificacao;

    @Column(nullable = false)
    private String especie;

    @Column(nullable = false)
    private String raca;

    @Column(nullable = false)
    private String sexo;

    @Column(nullable = false)
    private String dataNascimentoOuIdade;

    @Column(nullable = false)
    private Double peso;

    @Column(nullable = false)
    private String condicaoSaude;

    private String observacoes;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    private User proprietario;

    public Animal() {}

    public Long getId() {
        return id;
    }

    public String getCodigoIdentificacao() {
        return codigoIdentificacao;
    }

    public void setCodigoIdentificacao(String codigoIdentificacao) {
        this.codigoIdentificacao = codigoIdentificacao;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public String getRaca() {
        return raca;
    }

    public void setRaca(String raca) {
        this.raca = raca;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public String getDataNascimentoOuIdade() {
        return dataNascimentoOuIdade;
    }

    public void setDataNascimentoOuIdade(String dataNascimentoOuIdade) {
        this.dataNascimentoOuIdade = dataNascimentoOuIdade;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public String getCondicaoSaude() {
        return condicaoSaude;
    }

    public void setCondicaoSaude(String condicaoSaude) {
        this.condicaoSaude = condicaoSaude;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public User getProprietario() {
        return proprietario;
    }

    public void setProprietario(User proprietario) {
        this.proprietario = proprietario;
    }
}
