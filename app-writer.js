'use strict'

// global variables
const predictionsDiv = document.getElementById('predictions')
const inputTextarea = document.getElementById('text-input')
let word = '' // the written word (or the word under caret)
let timeout = null // timer to delay fetch

// -------------------------------------------------

// listen for both keyup, and click. Then fire fetchPredictions function
'keyup click'.split(' ').forEach(event => {
  inputTextarea.addEventListener(event, waitThenFetch)
})

// -------------------------------------------------

/**
 * handle events after the user stop typing
 * (make some delay for better performance and less load)
 * @param e Object - event
 */
function waitThenFetch(e) {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    fetchPredictions(e)
  }, 300)
}

// -------------------------------------------------
/**
 * fetch word predictions
 * @param event Object
 */
function fetchPredictions(event) {
  // if the word didn't changes, we shouldn't re-fetch the list (to avoid high load on the server)
  if (word === getWordAtCaretPosition(event)) return
  word = getWordAtCaretPosition(event)
  console.log(word)
  /** Here I'm using heroku cors to be able to fetch data without https
   * @link https://cors-anywhere.herokuapp.com/
   */
  const cors = 'https://cors-anywhere.herokuapp.com/'
  const URL = `${cors}https://services.lingapps.dk/misc/getPredictions?locale=en-GB&text=${word}`
  fetch(URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer MjAxOS0wMi0wMQ==.dGVzdEBleGFtcGxlLmNvbQ==.MjExMWMyYjdjZGY3YTU3MmU4MTA5OWY0MDgyMmM0OTk=',
      Connection: 'Close',
      Host: 'services.lingapps.titan.wizkids.dk'
    }
  })
    .then(result => result.json())
    .then(predictionsArray => handlePredictions(predictionsArray, word))
    .catch(console.error)
}

// -------------------------------------------------
/**
 * get the word exists at caret position
 * after getting the position of cart, loop at characters starting from caret position
 * until finding a whitespace. Then get the word starting from this result
 * @param event Object
 * @returns String
 */
function getWordAtCaretPosition(event) {
  const writtenText = event.target.value // the text in textarea
  const caretPosition = event.target.selectionStart // the position of caret
  console.log('caretPosition',caretPosition)
  let word = '' // the word that will be returned
  let wordPositionStart = 0 // the index of first letter at `word`

  // check characters before current position until finding white space
  for (let i = caretPosition; i >= 0; i--) {
    // if current character is whitespace bread the loop
    if (/\s/g.test(writtenText[i])) break
    wordPositionStart = i
  }
  for (let i = wordPositionStart; i < writtenText.length; i++) {
    if (/\s/g.test(writtenText[i])) break
    word += writtenText[i]
  }
  return word
}

// -------------------------------------------------
/**
 * Simple function to handle predictions and call rendering functions
 * @param predictionsArray Array
 * @param word String
 */
function handlePredictions(predictionsArray, word) {
  // get first 10 word predictions
  const firstTenPredictions = predictionsArray.slice(0, 10)
  const predictionsList = firstTenPredictions.map(prediction =>
    renderPredictionsListItem(prediction, word)
  )
  renderPredictions(predictionsList, word)
}

// -------------------------------------------------
/**
 * Render final results (the predictions list) in `<div id="predictions"></div>`
 * @param predictionsList Array
 * @param word String
 */
function renderPredictions(predictionsList, word) {
  predictionsDiv.innerHTML =
    word.trim().length > 0 // trim whitespaces then check if there is a word
      ? `<ol>${predictionsList.join('')}</ol>` // render as <ol> list
      : '' // otherwise empty
}

// -------------------------------------------------
/**
 * render predictions list items
 * @param prediction Array
 * @param word String
 * @returns string
 */
const renderPredictionsListItem = (prediction, word) =>
  `<li>${highlight(word, prediction)}</li>`

// -------------------------------------------------
/**
 * Styling the printed letters by adding highlight css class (to make it bold)
 * @param keyword String - this will be highlighted
 * @param text String - the full text
 * @returns String
 */
function highlight(keyword, text) {
  if (!keyword) return text
  // to search for keyword in text
  const pattern = new RegExp('(' + keyword + ')', 'gi')
  return text.replace(pattern, `<span class='highlight'>${keyword}</span>`)
}

// -------------------------------------------------
