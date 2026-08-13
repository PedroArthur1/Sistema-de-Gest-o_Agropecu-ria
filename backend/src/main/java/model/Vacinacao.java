package model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "vacinacoes")
public class Vacinacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false)
    private String nomeVacina;

    @Column(nullable = false)
    private LocalDate dataAplicacao;

    @Column(nullable = false)
    private String dose;

    @Column(nullable = false)
    private String responsavel;

    private LocalDate dataProximaDose;

    public Vacinacao() {}

    public Long getId() {
        return id;
    }

    public Animal getAnimal() {
        return animal;
    }

    public void setAnimal(Animal animal) {
        this.animal = animal;
    }

    public String getNomeVacina() {
        return nomeVacina;
    }

    public void setNomeVacina(String nomeVacina) {
        this.nomeVacina = nomeVacina;
    }

    public LocalDate getDataAplicacao() {
        return dataAplicacao;
    }

    public void setDataAplicacao(LocalDate dataAplicacao) {
        this.dataAplicacao = dataAplicacao;
    }

    public String getDose() {
        return dose;
    }

    public void setDose(String dose) {
        this.dose = dose;
    }

    public String getResponsavel() {
        return responsavel;
    }

    public void setResponsavel(String responsavel) {
        this.responsavel = responsavel;
    }

    public LocalDate getDataProximaDose() {
        return dataProximaDose;
    }

    public void setDataProximaDose(LocalDate dataProximaDose) {
        this.dataProximaDose = dataProximaDose;
    }
}
