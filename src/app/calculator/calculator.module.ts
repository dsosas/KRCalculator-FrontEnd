import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorComponent } from './calculator.component';
import {HttpRequestsService} from '../http-requests/http-requests.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CalculatorComponent],
})
export class CalculatorModule { }
