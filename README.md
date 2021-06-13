# Math Dojo
This program is a web app for users to practice math problems(it's sort of like my own version of MyMathLab, WebAssign, and various other STEM practice platforms). It provides randomly generated math problems, and 
also checks the user's answers to make sure they are correct. 

<p>This program is comprised of both client-side and server-side components.</p> 
<header>This project uses the following tools:</header>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
  <li>Node.js</li>
</ul>
<p>
The client-side code(HTML, CSS, and client-side Javascript)
is all in the <b>"public" folder</b>, and the server-side code(Javascript/Node.js) is in the <b>"app.js"</b> file.
This is my first experience with writing my own API with Node.js. I created an API based on math which
currently has two functionalities: 
</p>
<ol>
  <li>Generate random practice math problems and send them to the API caller</li>
  <li>Compute answers to math problems given by the API caller, and return the answers</li>
</ol>

<p>In its current state, this program currently only involves arithmetic problems</p>
Below is the official documentation for my math API

# My Math API Documentation
My Math API provides randomly generated
practice arithmetic problems and also computes
answers to problems given by the API user.

## Functionality 1: Get randomly generated practice arithmetic problem
**Request Format:** /practice

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns a JSON object containing
100 randomly generated practice arithmetic problems

**Example Request:** /practice

**Example Response:**

```json
{
"0": "2 - 2"
"1": "1 + 1",
"2": "2 * 5 - 7 + 1,
...
"99": "5 * 5 - 5
}
```

**Error Handling:**
- N/A: It's not possible for the user to accidentally
send wrong parameters

## Functionality 2: Get answer to arithmetic problem
**Request Format:** /solve/:expression

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Accepts a math arithmetic problem as
a route(required) parameter, then sends back the answer
to that arithmetic problem. My algorithm uses Dijkstra's
<a href="https://en.wikipedia.org/wiki/Shunting-yard_algorithm">shunting yard algorithm</a>
to compute the problem.

**Example Request:** /solve/2+(2-2)

**Example Response:**

```
"2"
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid arithmetic problem, returns an error with the message: `Given problem {problem} is not a valid arithmetic problem!

<b>NOTE:</b> It isn't possible to send an incorrect math problem from within the Math Dojo program,
since all problems sent from Math Dojo were generated by my(this) API, and my API cannot generate
a problem in an incorrect format. This error handler is just here just in case this API
is accessed from outside the Math Dojo program.

