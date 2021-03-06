import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpResponseBase
} from '@angular/common/http';

import {
  Action,
  State,
  Store,
  StateContext,
  Selector
} from '@ngxs/store';

import { 
  PokedexGetPokedex,
  PokedexSetTo
} from './@/actions';

import {
  PokedexHttpPokedex,
  PokedexStateModel,
  PokedexMap
} from './@/interfaces';

import {
  Pokedex
} from './@/classes';

import {
  PokedexPokemon
} from '@pokedex/pokedex-pokemon';

@State<PokedexStateModel>({
  name: 'pokedex',
  defaults: {
    count: 0,
    names: {},
    pokedex: {},
    pokemon: [],
    from: 0,
    to: 10
  }
})
export class PokedexState {

  @Selector()
  public static names$ (state) : Pokedex {
    return state.names;
  };

  @Selector()
  public static pokemon$ (state) : Array<PokedexPokemon> {
    return state.pokemon.slice(state.from, state.to);
  };

  @Selector()
  public static pokedex$ (state) : Pokedex {
    return state.pokedex;
  };

  @Action(PokedexGetPokedex)
  private onGetPokedexPokemon (
      { patchState }: StateContext<PokedexStateModel>,
      { payload }: PokedexGetPokedex) : void {

    patchState({
      count: payload.count,
      names: payload.names,
      pokedex: payload.pokedex,
      pokemon: payload.pokemon
    });
  };

  @Action(PokedexSetTo)
  private onSetPokedexTo (
      { patchState, getState }: StateContext<PokedexStateModel>, 
      { payload }: PokedexSetTo) : void {
    
    patchState({
      to: getState().to + payload.to
    });
  };

  private onGetPokedexSuccess (response: PokedexHttpPokedex) : void {

    const names: PokedexMap = {};

    const pokedex: Pokedex = new Pokedex(response.results, names);

    const pokemon: Array<PokedexPokemon> = Object.values(pokedex).map(
      (pokemon: PokedexPokemon) => (names[pokemon.name] = pokemon));

    this.store.dispatch(new PokedexGetPokedex({
      count: pokemon.length,
      names: names,
      pokedex: pokedex,
      pokemon: pokemon
    }));
  };

  private onGetPokedexError (error: HttpErrorResponse) : void {
    console.log(error);
  };

  public constructor (
      private http: HttpClient,
      private store: Store) {
    
    this.http.get('https://pokeapi.co/api/v2/pokemon/').toPromise()
        .then(this.onGetPokedexSuccess.bind(this))
          .catch(this.onGetPokedexError.bind(this));
  };
};
