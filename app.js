/*
 * Name: Juda Fernandez
 * Section: AM - Fadel
 * Description: Provides the API endpoints
 * for my math dojo. There are two endpoints:
 * 1. GET — sends back a randomly generated
 * math practice problem
 * 2. Also GET - sends back the answer of
 * a math practice problem provided by the
 * user of my API
 */
'use strict';

/**
 * Import express library, which allows us to
 * respond to and receive http requests.
 * This is similar to importing java classes,
 * like scanner or arrays
 */
const express = require('express');

// instantiate an instance of the express
const app = express();

// define API endpoint GET request for getting randomy-generated math problems
app.get("/practice", sendArithmeticProblems);

/**
 * Kick-starts the process of generating random arithmetic problems,
 * then sends the problems back to the API caller in JSON format.
 * @param {Request} request - Not applicable for this endpoint, since
 * the API caller doesn't need to specify any params. But by convention
 * this param is here
 * @param {Response} response - response object that will contain the JSON
 * of practice problems to send back to the API caller
 */
function sendArithmeticProblems(request, response) {
  let practiceProblems = generateArithmeticProblems();
  response.type("json").json(practiceProblems);
}

/**
 * generate an array of random math expressions and return them
 * @returns {JSON} - return a JSON of math problems, each in the
 * form of a string
 */
function generateArithmeticProblems() {
  let problems = {};

  // generate 100 problems
  const PROBLEMAMOUNT = 100;
  for (let i = 0; i < PROBLEMAMOUNT; i++) {
    let randomProblem = generateArithmeticProblem();
    problems[i] = randomProblem;
  }
  return problems;
}

/**
 * generates a single randomly generated
 * math problem(math expression)
 * @returns {String} - return a randomly generated
 * math problem(math expression)
 */
function generateArithmeticProblem() {
  let problem = "";
  const MAXAMOUNTOFTERMS = 5;
  const MINAMOUNTOFTERMS = 2;
  let numberOfTerms = Math.floor(Math.random() * MAXAMOUNTOFTERMS) +
  MINAMOUNTOFTERMS;
  let operators = ["+", "-", "*"];
  const MINNUMBER = 1;
  const MAXNUMBER = 9;
  let randomNum;
  const MAXINDEX = 3;

  // fencepost algorithm(stop before last term)
  for (let i = 0; i < numberOfTerms - 1; i++) {

    // generate random num between 1 and 100(inclusive)
    randomNum = Math.floor(Math.random() * MAXNUMBER) + MINNUMBER;
    let operatorIndex = Math.floor(Math.random() * MAXINDEX);
    let randomOperator = operators[operatorIndex];
    problem += randomNum + " " + randomOperator + " ";
  }

  // generate random num between 1 and 100(inclusive)
  randomNum = Math.floor(Math.random() * MAXNUMBER) + MINNUMBER;
  problem += randomNum;
  return problem;
}

// define API endpoint GET request for getting the answer to a math problem
app.get("/solve/:expression", sendBackAnswer);

/**
 * This function gets called when the API caller makes a GET request
 * to solve a particular math problem. This function is responsible for
 * kick-starting the problem solving process and also returning the answer
 * back to the API caller
 * @param {Request} request - object that contains the route parameter
 * that we need. The route param is the math problem that the API caller
 * wants us to solve.
 * @param {Response} response - response that we'll return back to the
 * API caller
 */
function sendBackAnswer(request, response) {
  let expression = request.params["expression"];
  let answer = computeExpression(expression);

  // if answer got returned null, then something was wrong with the input format
  if (answer === null) {

    // send an error code back
    let errorMessage = "Given problem {" + expression + "} is not a valid expression!";
    const ERRORNUM = 400;
    response.type('text').status(ERRORNUM);
    response.send(errorMessage);
  } else {
    response.type("text");
    response.send(answer);
  }
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
function computeExpression(expression) {
  let infixExpression = expression;
  if (infixExpression === null) { // something was wrong with the input format
    return null;
  }
  let postFixExpression = infixToPostfix(infixExpression);
  if (postFixExpression === null) { // something was wrong with the input format
    return null;
  }
  return evaluatePostFixExpression(postFixExpression) + "";
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
function infixToPostfix(expression) {

  let outputQueue = [];
  let operatorStack = [];

  // use a hashmap to assign a precedence for each operator
  let operatorPrecedences = new Map([
    ['*', 2],
    ['/', 2],
    ['+', 1],
    ['-', 1],
    ['(', 0]
  ]);

  for (let i = 0; i < expression.length; i++) {
    let curr = expression.charAt(i);
    if (isNum(curr)) {
      let num = curr;
      i++;
      while (i < expression.length && isNum(expression.charAt(i))) {
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
    } else if (isOperator(curr)) {
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
    } else if (curr === ' ') {
      continue;
    } else {
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
function evaluatePostFixExpression(expression) {
  let stackOfNumbers = [];
  for (let i = 0; i < expression.length; i++) {
    let curr = expression[i];
    if (isNum(curr)) {
      const ZEROASASCII = 48;
      stackOfNumbers.push(curr.charCodeAt() - ZEROASASCII);
    } else if (isOperator(curr)) {
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
function isNum(symbol) {
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
function isOperator(symbol) {
  return symbol === '*' || symbol === '/' || symbol === '+' || symbol === '-' ||
  symbol === '(' || symbol === ')';
}

app.use(express.static('public'));

// listen on some port number; listen for new requests to come in
const PORTNUM = 8000;
const PORT = process.env.PORT || PORTNUM;
app.listen(PORT);
