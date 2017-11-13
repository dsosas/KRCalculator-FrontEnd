/**
 * Created by Diego on 11/12/17.
 */


import {Routes, RouterModule} from '@angular/router';
import {CalculatorComponent} from './calculator/calculator.component';


export const routes:Routes = [
  { path: '', component: CalculatorComponent },
  { path: '**', redirectTo: '', pathMatch: 'full'}
];

export const mainRouting = RouterModule.forRoot(routes);
