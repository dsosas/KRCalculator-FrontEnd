/**
 * Created by Diego on 11/12/17.
 *
 * Description: This component represents a calculator and its basic functions.
 * Provided that an user can only enter certain characters into a calculation, it
 * makes sure to filter out those input that do not match the criteria. A typical
 * calculation consists of three things: 2 operands and 1 operator, which have to
 * be entered by the user. In the case of the squareroot it's only one operand and
 * one operator (since we already know its a 'square' root). There are to main states
 * that the user can be in: either inputting the first operand (operand_1) or
 * the second operand (operand_2). By watching in which state the user is currently
 * in and checking the input with regular expressions, the program knows what are the
 * next allowable functions or input for the user.
 */

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {HttpRequestsService} from '../http-requests/http-requests.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CalculatorComponent implements OnInit {
  public expression: string; // current expression shown on template
  public  upperExpression: string; // expression in top of current expression
  private inputAllowed: RegExp = RegExp('[0-9]|[/.+*^-]');
  private operandRegex: RegExp = RegExp('^[-]?([0-9]*[.])?[0-9]+$');
  private currentState = 'operand_1';
  private operand_1: string = null;
  private operand_2: string = null;
  private operator: string = null;
  private answerSet = false;
  public savedComputations: Array<string>;

  // Static methods //
  /**
   * Evaluates whether input is an operator or not.
   * @param input {string}
   * @returns {boolean}
   */
  public static isOperator(input: string): boolean {
    const operatorInput: RegExp = new RegExp('[√/+*^-]');
    return operatorInput.test(input);
  }

  /**
   * Checks if input is a valid operand character.
   * @param {string} input
   * @returns {boolean}
   */
  public static isOperandInput(input: string): boolean {
    const operandInput: RegExp = new RegExp('[0-9]|[.]|[-]');
    return operandInput.test(input);
  }
  // ends static methods //
  constructor( private httpRequestService: HttpRequestsService) {}

  ngOnInit() {
    this.expression = '';
    this.upperExpression = '';
    if (localStorage.getItem('savedComp') !== null) {
      this.savedComputations = JSON.parse(localStorage.getItem('savedComp')); // converts string (representing array) to Array
    }else {
      this.savedComputations = [];
    }
  }



  /**
   * Checks the type of input to process according to its value performs
   * calculators main functions. This method is used on template and contains
   * the mean thread for all the sub tasks.
   * @param value
   */
  public addToExpression(value: any): void {
    if (value === '=' && this.currentExpressionIsValidOperand() && this.getCurrentState() === 'operand_2') {
      this.getCalculationAndSave();
    } else if (this.isOperatorAndCanBeAdded(value)) {
      this.setOperatorAndProcess(value);
    } else if (CalculatorComponent.isOperandInput(value)) {
      this.clearExpressionIfAnswer();
      this.validateAndAddInput(value);
    } else if ( value === 'AC') {
      this.clearAll();
    }else if ( value === 'CE') {
      this.expression = '';
    }
  }

  /**
   * Performs all the functions necessary when user hits keyword '='
   */
  private getCalculationAndSave(): void {
    this.setOperand2(this.expression); // in case it has been set
    this.upperExpression += ' ' + this.getOperand2();
    this.calculateBackend()
      .subscribe(response => {
        if (response) {
          this.setAnswer(response.result.toString());
          this.saveAndClearTop();
        }
      });
  }

  /**
   * Saves calculation to localStorage and clears upperExpression.
   * Usually called when user enters '='
   */
  private saveAndClearTop(): void {
    const operation = this.upperExpression + ' = ' + this.expression;
    this.saveComputation(operation);
    this.upperExpression = '';
    this.setCurrentState('operand_1');
  }

  /**
   * Clears all expressions from storage
   */
  public clearSavedComp(): void {
    localStorage.clear();
    this.savedComputations = [];
  }

  /**
   * Clears the current expression if there is an
   * answer. To be called when user enters new input
   */
  public clearExpressionIfAnswer(): void {
    if (this.answerSet) {
      this.expression = '';
      this.answerSet = false;
    }
  }

  /**
   * Saves las calculation and result into an Array<strings>
   * and stores it un Window.localStorage.
   * @param {string} operation
   */
  private saveComputation(operation: string): void {
    this.savedComputations.unshift(operation);
    if (this.savedComputations.length > 10) {
      this.savedComputations = this.savedComputations.splice(0, 10);
    }
    const savedCompAsString = JSON.stringify(this.savedComputations);
    localStorage.setItem('savedComp', savedCompAsString);
  }

  /**
   * Resets states but keeps the current expression.
   */
  public resetStates() {
    this.setOperand1('');
    this.setOperand2('');
    this.setCurrentState('operand_1');
  }

  /**
   * Clears all Entries
   */
  public clearAll(): void {
    this.resetStates();
    this.upperExpression = '';
    this.expression = '';
  }
  /**
   * Precond: all existing operands have to be validated for correctness.
   * @param {string} operator
   */
  public setOperatorAndProcess(operator: string): void {
    if (operator === '√') {
      this.processAndCalculateSquareRoot();
    } else if (this.getCurrentState() === 'operand_2') { // both operators have been set so need to calculate and set answer & new operator
      this.calculateAndHoldUpperExpression(operator);
    }else if (this.getCurrentState() === 'operand_1') {
      this.setCurrentOperator(operator);
      this.setOperand1(this.expression);
      this.upperExpression += this.expression + ' ' + this.getCurrentOperator();
      this.expression = '';
      this.setCurrentState('operand_2');
    }
  }

  /**
   * Performs calculation when user has two valid operands and
   * operator set and enters another operator. For instance, 9 + 5 -
   * At the point the user hits "-" should calculate 9 + 5.
   * @param {string} operator
   */
  private calculateAndHoldUpperExpression(operator: string): void {
    this.setOperand2(this.expression);
    this.calculateBackend()
      .subscribe(response => {
        if (response) {
          const answer = response.result;
          this.setCurrentOperator(operator);
          this.setOperand1(answer.toString());
          this.upperExpression += ' ' + this.expression + ' ' + this.getCurrentOperator();
          this.setAnswer(answer.toString());
        }
      });
  }

  /**
   * Processes the expression to calculate the operands
   * square root.
   * Precond: "this.expression" must be a valid operand
   */
  private processAndCalculateSquareRoot(): void {
    this.httpRequestService.getByParams({operand_1: this.expression}, 'sqrt')
      .subscribe(response => {
        if (response) {
          this.upperExpression += ' √' + this.expression;
          this.resetStates();
          if (isNaN(response.result)) {
            this.setAnswer('Not Real!');
          } else {
            this.setAnswer(response.result.toString());
          }
          this.saveAndClearTop();
        }
      });
  }

  /**
   * Sets the current expression as the answer
   * of the previous calculation.
   * @param {string} answer
   */
  public setAnswer(answer: string): void {
    this.expression = answer;
    this.answerSet = true;
  }

  /**
   * Validates input to make sure it is an accepted
   * input for an operand. It then appends that character to the
   * respective operand of the current state.
   * @param {string} input
   */
  private validateAndAddInput(input: string): void {
       // "partialMatches" partially matches input for operand
      const partialMatches: RegExp = new RegExp('^[-]?([0-9]*[.])?[0-9]+$|^[-]?([0-9]*[.])$|^[-]$');
      const temp: string = this.expression + input;
      if (partialMatches.test(temp)) {
        this.appendToExpression(input);
      }
    }
  /**
   * Calculates the value of the operation. Uses HttpRequestService to
   * communicate with backend API.
   * @returns {Observable<any>}
   */
  private calculateBackend(): Observable<any> {
    let parameters: any;
    switch (this.getCurrentOperator()) {
      case '+':
        parameters = { operand_1: this.getOperand1(), operand_2: this.getOperand2() };
        return this.httpRequestService.getByParams(parameters, 'sum');
      case '-':
        parameters = { operand_1: this.getOperand1(), operand_2: this.getOperand2() };
        return this.httpRequestService.getByParams(parameters, 'subtract');
      case '*':
        parameters = { operand_1: this.getOperand1(), operand_2: this.getOperand2() };
        return this.httpRequestService.getByParams(parameters, 'multiply');
      case '/':
        parameters = { operand_1: this.getOperand1(), operand_2: this.getOperand2() };
        return this.httpRequestService.getByParams(parameters, 'divide');
      case '^':
        parameters = { operand_1: this.getOperand1(), operand_2: this.getOperand2() };
        return this.httpRequestService.getByParams(parameters, 'pow');
    }
  }

  /**
   * Checks if input is an operator and the operand is valid.
   * Used so operator can be added to expression
   * @param {string} input
   * @returns {boolean}
   */
  private isOperatorAndCanBeAdded(input: string): boolean {
    return CalculatorComponent.isOperator(input) && this.currentExpressionIsValidOperand() && !this.answerSet;
  }

  /**
   * Appends value of input to expression
   * @param {string} input
   */
  private appendToExpression(input: string): void {
    this.expression += input;
  }

  /**
   * Checks if the current expression is a valid operand
   * @returns {boolean}
   */
  private currentExpressionIsValidOperand(): boolean {
    return this.operandRegex.test(this.expression);
  }

  /**
   * Filters characters entered by the user's keyboard. Only
   * allows those that belong to used by this Calculator
   * (see inputAllowed regex)
   * @param event
   */
  public filterChar(event: any): void {
    event.preventDefault();
    const input: string = String.fromCharCode(event.keyCode);
    if (this.charIsValid(input)) {
      this.addToExpression(input);
    }
  }
  /**
   * Checks regular expression to validate character.
   * @param input
   * @returns {boolean}
   */
  private charIsValid(input): boolean {
        return this.inputAllowed.test(input);
  }


  /**
   * Sets value of current operator.
   * Precond: has to be a valid operator symbol. Use isOperator to check.
   * @param {string} operator
   */
  private setCurrentOperator(operator: string): void {
    this.operator = operator;
  }

  /**
   * Gets current operator
   * @returns {string}
   */
  private getCurrentOperator(): string {
    return this.operator;
  }

  /**
   * Gets a string representing the current state the calculator is in.
   * @returns {string}
   */
  private getCurrentState(): string {
    return this.currentState;
  }

  /**
   * Sets current state to either opreand_1 or operand_2.
   * @param {string} currentState
   */
  private setCurrentState(currentState: 'operand_1' | 'operand_2'): void {
    this.currentState = currentState;
  }

  /**
   * Sets vale for first operand.
   * @param {string} input
   */
  public setOperand1(input: string): void {
    this.operand_1 = input;
  }

  /**
   * Sets valye for second operand.
   * @param {string} input
   */
  public setOperand2(input: string): void {
    this.operand_2 = input;
  }

  /**
   * Gets value of first operand.
   * @returns {string}
   */
  public getOperand1(): string {
    return this.operand_1;
  }

  /**
   * gets value of second operand.
   * @returns {string}
   */
  public getOperand2(): string {
    return this.operand_2;
  }
}
