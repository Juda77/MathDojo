/*
 * Name: Juda Fernandez
 * Section: AM - Fadel
 * Description: This is the client-side JS code of my Math Dojo project.
 * It contributes to the project by making edits to the DOM and taking
 * input from the user.
 */

// activate strict mode, so JS can catch more errors
"use strict";

/**
 * anon func which gets called immediately
 */
(function() {

  // start the actual program when DOM and stylesheet(s) load
  window.addEventListener('load', init);
  const PORT = 8000;
  const URL = "http://localhost:" + PORT;

  /**
   * store the input from the web service
   * a list of practice problems
   */
  let practiceProblems;

  /**
   * track which problem is next on the list
   * if we have no problems left to get,
   * make a new call to the web service
   */
  let currProblemIndex = 0;

  /**
   * function which kickstarts the whole program once the
   * necessary components(DOM and stylesheets) have loaded
   */
  function init() {

    // automatically get a batch of practice problems
    getPracticeProblems();

    // listen for a click to generate a random practice problem
    id("get-problem-button").addEventListener("click", displayNewProblem);

  }

  /**
   * Gets a list of randomly generated practice problems
   * from the web service that I created
   */
  async function getPracticeProblems() {
    try {
      let problems = await fetch(URL + "/practice");
      problems = await statusCheck(problems);

      // get the problems in JSON format
      problems = await problems.json();
      practiceProblems = problems;

      // display new problem(the first) instantly
      displayNewProblem();

      // add the answer prompt after the first problem is displayed
      addAnswerPrompt();
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * display a new problem to the user whenever they click
   * the "generate new problem" button, or when the current
   * problem displayed is solved correctly. Also remove the previous problem
   * if there was one.
   */
  function displayNewProblem() {
    let newProblem = document.createElement("p");
    newProblem.textContent = "Problem: " +
    practiceProblems[currProblemIndex];
    id("problem-set").removeChild(id("problem-set").lastChild);
    id("problem-set").prepend(newProblem);
    currProblemIndex++;
    const PROBLEMCOUNT = 99;

    // if there are no problems left, we need to request 100 new problems from the API
    if (currProblemIndex > PROBLEMCOUNT) {
      getPracticeProblems();
      currProblemIndex = 0;
    }
  }

  /**
   * Add the "check" button to the webpage
   * to allow the user to check if their
   * answer is correct
   */
  function addAnswerPrompt() {
    let answerBoxLabel = document.createElement("label");
    answerBoxLabel.textContent = "Type you answer here: ";
    let answerBox = document.createElement("input");
    answerBox.type = "text";
    answerBox.placeholder = "69420";
    answerBox.id = "user-answer";
    let checkButton = document.createElement("button");
    checkButton.id = "check-button";
    checkButton.textContent = "Check answer!";
    checkButton.addEventListener("click", getActualAnswer);
    checkButton.classList.add("btn", "btn-primary");
    let main = id("practice-page");
    let childrenLength = main.children.length;
    main.insertBefore(answerBoxLabel, main.children[childrenLength - 1]);
    childrenLength = main.children.length;
    main.insertBefore(answerBox, main.children[childrenLength - 1]);
    childrenLength = main.children.length;
    main.insertBefore(checkButton, main.children[childrenLength - 1]);
  }

  /**
   * Takes the practice problem, solves it using my
   * arithmetic-calculator.js program, and compares the
   * answer from my arithmetic calculator with the answer
   * that the user put in as input.
   * @param {String} actualAnswer - the actual answer of the
   * current practice problem, in String format
   */
  function verifyUserAnswer(actualAnswer) {

    // get the problem and the answer that the user input
    let solvedProblem = practiceProblems[currProblemIndex - 1];
    let userAnswer = id("user-answer").value;
    id("user-answer").value = "";
    let correctlySolved = true;

    if (userAnswer !== actualAnswer) { // alert user that their answer is wrong
      id("correct-answer-message").classList.add("hidden");
      id("incorrect-answer-message").classList.remove("hidden");
      const TIME = 3000;
      setTimeout(() => { // remove the error response
        id("incorrect-answer-message").classList.add("hidden");
      }, TIME);

      correctlySolved = false;
    } else { // alert user that their answer is right
      id("incorrect-answer-message").classList.add("hidden");
      id("correct-answer-message").classList.remove("hidden");
      const TIME = 3000;
      setTimeout(() => { // remove the error response
        id("correct-answer-message").classList.add("hidden");
      }, TIME);
      addSolvedProblemToVisualLog(solvedProblem, userAnswer);
      displayNewProblem(); // display a new problem
    }

    addProblemToDatabase(solvedProblem, userAnswer, correctlySolved);

  }

  /**
   * Place the newly correctly solved problem in the
   * section which displays all the correctly-solved problems
   * @param {String} solvedProblem - the correctly-solved problem
   * in String format
   * @param {String} userAnswer - the answer to the correctly-solved
   * problem in String format
   */
  function addSolvedProblemToVisualLog(solvedProblem, userAnswer) {
    let newItem = document.createElement("p");
    newItem.textContent = solvedProblem + " = " + userAnswer;
    id("solved-problems").appendChild(newItem);
  }

  /**
   * async function which makes an http POST request to the server
   * to put the data into the database
   * @param {string} solvedProblem - problem that the user did
   * @param {string} userAnswer - answer that the user provided
   * @param {boolean} correctlySolved - did the user solve the problem correctly?
   */
  async function addProblemToDatabase(solvedProblem, userAnswer, solvedCorrectly) {

    let problemAttempt = {
      "solvedProblem": solvedProblem,
      "userAnswer": userAnswer,
      "solvedCorrectly": solvedCorrectly
    };

    const OPTIONS = {
      method: "POST",
      headers: { // meta data about the post request
        "Content-Type": "application/json"
      },
      body: JSON.stringify(problemAttempt)

    }
    try {
      await fetch("/store-problem", OPTIONS);
    } catch(error) {
      handleError(error);
    }

  }

  /**
   * Gets the answer to the problem by making a
   * GET request to my API
   * @returns {String} - return the answer to the
   * practice problem in String format
   */
  async function getActualAnswer() {
    try {
      let currProblem = practiceProblems[currProblemIndex - 1];
      let response = await fetch(URL + "/solve/" + currProblem);
      statusCheck(response);
      let actualAnswer = await response.text();
      verifyUserAnswer(actualAnswer);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Check if the response of the fetch API call was ok.
   * This method was provided by the course staff
   * @param {Response} response - response from the fetch API call
   * to my web service
   * @returns {Response} - returns the response back after checking
   * its status
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  /**
   * alert the user that there was an error
   * by displaying a message on the webpage
   * @param {Error} error - error that happened
   */
  function handleError(error) {
    let errorMessage = document.createElement("p");
    errorMessage.textContent = "Sorry, but there was an issue with your input.";
    errorMessage.textContent += " Please try again.";
    errorMessage.textContent += " Error: " + error;
    qs("main").appendChild(errorMessage);

    // get rid of error message after 3 seconds
    const TIME = 3000;
    setTimeout(() => {
      qs("main").removeChild(qs("main").lastChild);
    }, TIME);
  }

  /**
   * Returns the DOM/HTML element which the caller of
   * this function wants
   * @param {String} elementID - element id
   * @returns {Element} - DOM element that caller wants
   */
  function id(elementID) {
    return document.getElementById(elementID);
  }

  /**
   * Returns the DOM/HTML element which the caller of
   * this function wants
   * @param {String} selector - tag selector
   * @returns {Element} - DOM element that caller wants
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

})();
