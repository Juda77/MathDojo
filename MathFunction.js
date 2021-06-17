// naming convention is PascalCase
module.exports = class MathFunction {



  // constructor
  constructor(mathFunction) {

    // instance properties are often defined in the constructor
    this.mathFunction = mathFunction;
    // "this" refers to the instance object

  }

  /**
   * This function is responsible for taking the user input
   * and then outputting the result of the expression
   * to the user.
   * This function does not handle the computation
   * of the expression itself; there are other functions
   * which do that
   * @param {String} expression - String representation
   * of the expression input taken by the caller of this
   * API
   * @returns {String} - returns a String representation
   * of the answer of the original expression
   */
  computeExpression() {
    let infixExpression = this.mathFunction;
    if (infixExpression === null) { // something was wrong with the input format
      return null;
    }
    let postFixExpression = this.infixToPostfix(infixExpression);
    if (postFixExpression === null) { // something was wrong with the input format
      return null;
    }
    return this.evaluatePostFixExpression(postFixExpression) + "";
  }

  /**
   * Implements Dijkstra's Shunting-yard algorithm
   * for converting mathematical expressions
   * from infix notation(standard notation) to postfix notation.
   * We want to convert the expression into postfix notation
   * because it makes it easy to compute the expression
   *
   * @param {String} expression - String which represents the
   * mathematical expression input from the user
   * ex: 3 + (6 / 2) * 2
   *
   * @returns {Array}- returns an array postfix version
   * of the origin infix expression parameter
   */
  infixToPostfix(expression) {

    let outputQueue = [];
    let operatorStack = [];

    // use a hashmap to assign a precedence for each operator
    let operatorPrecedences = new Map([
      ['sin', 4],
      ['cos', 4],
      ['tan', 4],
      ['ln', 4],

      ['^', 3],
      ['*', 2],
      ['/', 2],
      ['+', 1],
      ['-', 1],
      ['(', 0]
    ]);

    for (let i = 0; i < expression.length; i++) {
      let curr = expression.charAt(i);
      if (this.isNum(curr)) {
        let num = curr;
        i++;
        while (i < expression.length && this.isNum(expression.charAt(i))) {
          curr = expression.charAt(i);
          if (curr !== ' ') {
            num += curr;
          }
          i++;
        }
        outputQueue.push(num);
        if (i !== expression.length) {
          i--;
        }
      } else if (this.isOperator(curr)) {
        if (operatorStack.length === 0 || curr === '(') {
          operatorStack.push(curr);
        } else if (curr === ')') {
          let operator = operatorStack.pop();
          while (operatorStack.length > 0 && operator !== '(') {
            outputQueue.push(operator);
            operator = operatorStack.pop();
          }
        } else {

          // while element on top of stack has greater or equal precedence than curr
          while (operatorStack.length > 0 &&
          operatorPrecedences.get(operatorStack[operatorStack.length - 1]) >=
          operatorPrecedences.get(curr)) {
            let operator = operatorStack.pop();
            outputQueue.push(operator);
          }
          operatorStack.push(curr);
        }
      } else if (curr !== " ") {
        return null;
      }
    }
    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop());
    }
    return outputQueue;
  }

  /**
   * This function takes the postFix version of the user's expression,
   * evaluates it mathematically, then returns the result
   * @param {Array} expression - the postFix version of the user's input expression
   * @returns {int} - return the result of the expression
   */
  evaluatePostFixExpression(expression) {
    let stackOfNumbers = [];
    for (let i = 0; i < expression.length; i++) {
      let curr = expression[i];
      if (this.isNum(curr)) {
        const ZEROASASCII = 48;
        stackOfNumbers.push(curr.charCodeAt() - ZEROASASCII);
      } else if (this.isOperator(curr)) {
        if (stackOfNumbers.length < 2) {
          return null;
        }
        let num2Int = stackOfNumbers.pop();
        let num1Int = stackOfNumbers.pop();
        let result = 0;
        if (curr === '+') {
          result = num1Int + num2Int;
        } else if (curr === '-') {
          result = num1Int - num2Int;
        } else if (curr === '*') {
          result = num1Int * num2Int;
        } else if (curr === '/') {
          result = num1Int / num2Int;
        }
        stackOfNumbers.push(result);

      }
    }
    return stackOfNumbers.pop();
  }

  /**
   * This function takes a symbol/char and determines if it is
   * a number or not.
   * @param {char} symbol - takes in a symbol(char of the expression)
   * @returns {boolean} - returns a boolean which represents whether or not
   * the symbol is a number. Returns true if it is a number, otherwise return false
   */
  isNum(symbol) {
    const LOWERNUMASCIIBOUND = 48;
    const UPPERNUMASCIIBOUND = 57;
    return LOWERNUMASCIIBOUND <= symbol.charCodeAt() &&
    symbol.charCodeAt() <= UPPERNUMASCIIBOUND;
  }

  /**
   * This function takes a symbol/char and determines if it is
   * an operator or not.
   * @param {char} symbol - takes in a symbol(char of the expression)
   * @returns {boolean} - returns a boolean which represents whether or not
   * the symbol is an operator. Returns true if it is an operator, otherwise return false
   */
  isOperator(symbol) {
    return symbol === '^' || symbol === '*' || symbol === '/' || symbol === '+'
    || symbol === '-' || symbol === '(' || symbol === ')';
  }



};