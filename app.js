/*
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

/**
 * multer is the node module needed for us to
 * parse data from POST requests which are in the
 * form of forms and json
 */
const multer = require("multer");
app.use(multer().none());

// give node the ability to parse JSON
// also limit the size of incoming data to 1 mb max
// to prevent a large influx of data
app.use(express.json({limit: "1mb"}));

/**
 * Require sqlite and sqlite3 modules
 * in this project.
 * -sqlite3 provides the code/functionality
 * for reading and writing to a database
 * -sqlite adds promises to sqlite3
 */
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");

/**
 * require the MathFunction class that I created
 * this will allow me to actually make MathFunction
 * objects in this file
 */
const MathFunction = require("./MathFunction.js");

// define API endpoint GET request for getting randomy-generated math problems
app.get("/practice", sendArithmeticProblems);

// define API endpoint GET request for getting the answer to a math problem
app.get("/solve/:expression", sendBackAnswer);

app.post("/store-problem", storeInDatabase);


function storeInDatabase(request, response) {
  console.log("Post: " + request.body.solvedProblem);
  let db = getDBConnection("problems-solved.db");

}



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
  const MAXAMOUNTOFTERMS = 3;
  const MINAMOUNTOFTERMS = 2;
  let numberOfTerms = Math.floor(Math.random() * MAXAMOUNTOFTERMS) +
  MINAMOUNTOFTERMS;
  let operators = ["+", "-", "*"];
  const MINNUMBER = 1;
  const MAXNUMBER = 10;
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

  expression = new MathFunction(expression);

  let answer = expression.computeExpression();

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

// Establishes a database connection to the database and
// returns the database object. * Any errors that occur should
// be caught in the function that calls this one.
// @param {string} dbFilePath the relative location to store
// this database * @returns {Object} - The database object for
// the connection.
async function getDBConnection(dbFilePath) {
  const db = await sqlite.open({
    filename: dbFilePath,
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));

// listen on some port number; listen for new requests to come in
const PORTNUM = 8000;
const PORT = process.env.PORT || PORTNUM;
app.listen(PORT);
