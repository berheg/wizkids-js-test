'use strict'

// global variables
const predictionsDiv = document.getElementById('predictions')
const inputTextarea = document.getElementById('text-input')
let word = { value: '', position: 0 } // the written word (or the word under caret)
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
  if (word.value === getWordAtCaretPosition(event)['value']) return
  word = getWordAtCaretPosition(event)
  const URL = `https://services.lingapps.dk/misc/getPredictions?locale=en-GB&text=${
    word.value
  }`
  fetch(URL, {
    method: 'GET',
    headers: {
      Authorization:
        'Bearer MjAxOS0wMi0wMQ==.dGVzdEBleGFtcGxlLmNvbQ==.MjExMWMyYjdjZGY3YTU3MmU4MTA5OWY0MDgyMmM0OTk=',
      Connection: 'Close',
      Host: 'services.lingapps.titan.wizkids.dk'
    }
  })
    .then(result => result.json())
    .then(predictionsArray => handlePredictions(predictionsArray))
    .catch(console.error)
}

// -------------------------------------------------
/**
 * get the word exists at caret position
 * after getting the position of cart, loop at characters starting from caret position
 * until finding a whitespace. Then get the word starting from this result
 * @param event Object
 * @returns Object
 */
function getWordAtCaretPosition(event) {
  const writtenText = event.target.value // the text in textarea
  const caretPosition = event.target.selectionStart // the position of caret
  let wordValue = '' // the word that will be returned
  let wordPositionStart = 0 // the index of first letter at `word`

  // check characters before current position until finding white space
  for (let i = caretPosition; i >= 0; i--) {
    // if current character is whitespace bread the loop
    if (/\s/g.test(writtenText[i])) break
    wordPositionStart = i
  }
  for (let i = wordPositionStart; i < writtenText.length; i++) {
    if (/\s/g.test(writtenText[i])) break
    wordValue += writtenText[i]
  }
  return { value: wordValue, position: wordPositionStart }
}

// -------------------------------------------------
/**
 * Simple function to handle predictions and call rendering functions
 * @param predictionsArray Array
 */
function handlePredictions(predictionsArray) {
  // get first 10 word predictions
  const firstTenPredictions = predictionsArray.slice(0, 10)
  const predictionsList = firstTenPredictions.map((prediction, index) =>
    renderPredictionsListItem(prediction, index)
  )
  renderPredictions(predictionsList)
}

// -------------------------------------------------
/**
 * Render final results (the predictions list) in `<div id="predictions"></div>`
 * @param predictionsList Array
 */
function renderPredictions(predictionsList) {
  const ul = document.createElement('ul')
  predictionsList.forEach(li => ul.appendChild(li))
  predictionsDiv.innerHTML = ''
  predictionsDiv.appendChild(ul)
}

// -------------------------------------------------
/**
 * Render predictions list items
 * @param prediction Array
 * @param index Number
 * @returns Element
 */
const renderPredictionsListItem = (prediction, index) => {
  const li = document.createElement('li')
  li.className = 'prediction'
  li.innerHTML = `<span class="index-number">${index}</span> ${highlight(
    word.value,
    prediction
  )}`
  // to access rendered elements we have to add the event listener to
  // the rendered elements with vanilla js, but with jQuery we can use $('.prediction')
  li.addEventListener('click', () => insertPredictionIntoTextarea(prediction))
  return li
}

// -------------------------------------------------
/**
 * Replace a word with another word in a string
 * @param string String
 * @param replace String
 * @returns {String,Number}
 */
function replaceAt(string, replace) {
  return (
    string.substring(0, word.position) +
    replace.toLowerCase() +
    string.substring(word.position + word.value.length, string.length)
  )
}
// -------------------------------------------------
/**
 * insert prediction into textarea (When click on it)
 * @param prediction String
 */
function insertPredictionIntoTextarea(prediction) {
  let newTextareaContent = replaceAt(inputTextarea.value, prediction)
  // update the word under caret with the new prediction
  word.value = prediction
  inputTextarea.value = newTextareaContent
}

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
