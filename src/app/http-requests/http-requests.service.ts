/**
* Created by Diego on 11/12/17.
 * Description: this is a small service that can be used to generate HTTP request
 * to a provided backend server.
*/

import {Injectable} from '@angular/core';;
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {URL} from './api-urls';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {catchError, map, tap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class HttpRequestsService {

  private urlObject: any; // contains all data of urls and extensions used for the request
  private headers = new Headers();


  constructor(
    private http: HttpClient,
  ) {
    this.urlObject = URL;
  }
  /**
   * Method used for gets that use parameters on the url for the request.
   * @param {URLSearchParams} params
   * @param {string} extensionName
   * @returns {Observable<any>}
   */
  public getByParams(parameters: Object, extensionName: string): any {
    const url: string = this.urlObject.url +  this.urlObject.extensions[extensionName];
    const params = this.getParams(parameters);
    return this.http.get(url, {params}).pipe(
      map(result => result),
      catchError(this.handleError())
    );
  }
  private getParams(parameters: Object) {
    let params = new HttpParams();
      for(const param in parameters) {
          params = params.set( param, parameters[param].toString());
    }
    return params;
  }
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }


}
