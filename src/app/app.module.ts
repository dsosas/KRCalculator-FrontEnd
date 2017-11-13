import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {CalculatorModule} from './calculator/calculator.module';
import {mainRouting} from './app.routing';
import {HttpRequestsService} from './http-requests/http-requests.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CalculatorModule,
    HttpClientModule,
    mainRouting
  ],
  providers: [HttpRequestsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
