package com.cobuild.backend.github.parser;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RepoCoordinates {
    private String owner;
    private String repo;

    public String owner() {
        return owner;
    }

    public String repo() {
        return repo;
    }
}
