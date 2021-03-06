import { 
  HttpResponse
} from "@angular/common/http";

import {
  Observable,
  of
} from "rxjs";

import {
  Pokedex
} from '@pokedex/@/classes';

import {
  PokedexMap
} from '@pokedex/@/interfaces';

import {
  PokedexPokemonFlavorText,
  PokedexPokemonHttp,
  PokedexPokemonSprites,
  PokedexPokemonName,
  PokedexPokemonNames,
  PokedexPokemonSpecies,
  PokedexPokemonFlavorDescriptions,
  PokedexPokemonEvolutionChain,
  PokedexPokemonEvolutionBase,
  PokedexPokemonSpeciesEvolutionChain
} from "../interfaces";


export class PokedexPokemon implements PokedexPokemonHttp {

  public $http: HttpResponse<PokedexPokemonHttp>;
  public $names: Pokedex;
  public $pokedex: Pokedex;
  public abilities: object;
  public base_experience: number;
  public descriptions?: PokedexPokemonFlavorDescriptions;
  public evolutions?: PokedexMap;
  public evolutionChain?: Array<PokedexPokemonEvolutionChain>;
  public height: number;
  public id: number;
  public is_default: boolean;
  public forms: object;
  public game_indices: object;
  public held_items: object;
  public location_area_encounters: string;
  public moves: object;
  public name: string;
  public names?: PokedexPokemonNames;
  public order: number;
  public sprites: PokedexPokemonSprites;
  public species: PokedexPokemonSpecies;
  public stats: object;
  public types: object;
  public url: string;
  public weight: number;

  constructor (
      id: number,
      name: string,
      url: string,
      pokedex: PokedexMap,
      pokedexNameMap: PokedexMap) {
    
    this.$names = pokedexNameMap;
    this.$pokedex = pokedex;
    this.descriptions = {};
    this.evolutions = {};
    this.id = id;
    this.name = name;
    this.names = {};
    this.url = url;
  };

  addPokemonBase(response: HttpResponse<PokedexPokemonHttp>) : PokedexPokemon {
    return Object.assign(this, { $http: response }, response.body);
  };

  addPokemonFlavorDescriptions(descriptions: Array<PokedexPokemonFlavorText>) : void {
    descriptions.forEach((description: PokedexPokemonFlavorText) => {

      const desc = this.descriptions;

      const language: string = description.language.name;

      const version: string = description.version.name;

      desc[language] = (desc.hasOwnProperty(language) &&
        desc[language] instanceof Object) ? desc[language] : {};

      if (!(desc[language].hasOwnProperty(version) &&
        desc[language][version] instanceof Object))
          desc[language][version] = { description: description.flavor_text };

    });
  };

  addPokemonEvolution(pokemon: PokedexPokemon) : void {
    this.evolutions[pokemon.name] = pokemon;
  };

  addPokemonEvolutionChain(response: HttpResponse<PokedexPokemonSpeciesEvolutionChain>) : PokedexPokemon {
    Object.assign(this.species.evolution_chain, { $http: response }, response.body);
    
    this.evolutionChain = this.walkThroughPokemonEvolutionChain(this.species.evolution_chain.chain, []);

    return this;
  };

  addPokemonNames(names: Array<PokedexPokemonName>) : Observable<any> {
    return of(names.forEach((name: PokedexPokemonName) => 
      (this.names[name.language.name] = name)));
  };

  addPokemonSpecies(response: HttpResponse<PokedexPokemonSpecies>): PokedexPokemon {
    this.species = Object.assign({ $http: response }, response.body);

    this.addPokemonNames(this.species.names);
    this.addPokemonFlavorDescriptions(this.species.flavor_text_entries);

    return this;
  };

  walkThroughPokemonEvolutionChain(evolution: PokedexPokemonEvolutionChain, sequence: Array<PokedexPokemonEvolutionChain>) : Array<PokedexPokemonEvolutionChain> {
    /** works okay for linear evolution; pokemon such as eevee might cause this to miss items. need to check. */
    while (evolution.evolves_to.length) {
      return this.walkThroughPokemonEvolutionChain(evolution.evolves_to[0], [...sequence, evolution]);
    };
    return [...sequence, evolution]; //.filter((evolution: PokedexPokemonEvolutionChain) => evolution.species.name !== this.name);
  };
};