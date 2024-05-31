package it.epicode.repositories;


import it.epicode.entities.Utente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtenteRepository extends JpaRepository<Utente, Long> {

    Optional<Utente> findOneByNameAndPassword(String nome, String password);
    Optional<Utente> findOneByName(String nome);
}
