const predictionsDiv = document.getElementById('predictions')
const inputTextarea = document.getElementById('text-input')
let word = '' // the written word (or the word under caret)
// listen for both keyup, and click. Then fire fetchPredictions function
'keyup click'.split(' ').forEach(event => {
  inputTextarea.addEventListener(event, fetchPredictions)
})

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
    .then(console.log)
    .catch(console.error)
}

// -------------------------------------------------
/**
 * get the word exists at caret position
 * after getting the position of cared, get previous characters until finding a whitespace
 * then get current character and next characters until finding a whitespace
 * @param event Object
 * @returns String
 */
function getWordAtCaretPosition(event) {
  // the text in textarea
  const writtenText = event.target.value
  // the position of caret
  const caretPosition = event.target.selectionStart
  // check if caret at the beginning, then return empty string
  if (caretPosition === 0) return ''
  // the word that will be returned
  let word = ''
  // current handling character
  let currentCharacter = ''
  // check characters before current position until finding white space
  for (let i = caretPosition; i--;) {
    currentCharacter = writtenText[i]
    // if current character is whitespace bread the loop
    if (/\s/g.test(currentCharacter)) break
    // append the character to the beginning of word string
    word = [currentCharacter, ...word].join('')
  }
  // if the character at caret position is not a whitespace
  if (!/\s/g.test(writtenText[caretPosition])) {
    // concatenate the character at current position
    word += writtenText[caretPosition]
    // check next character until finding a whitespace
    for (let i = caretPosition; i++;) {
      currentCharacter = writtenText[i]
      if (/\s/g.test(currentCharacter)) break
      word += currentCharacter
    }
  }
  return word
}

// -------------------------------------------------

function handlePredictions(predictionsArray, word) {
  const firstTenPredictions = predictionsArray.slice(0, 10)
  const predictionsList = firstTenPredictions.map(prediction =>
    renderPredictionsListItem(prediction, word)
  )
  renderPredictions(predictionsList, word)
}

// -------------------------------------------------
function renderPredictions(predictionsList, word) {
  predictionsDiv.innerHTML =
    word.trim().length > 0 ? `<ol>${predictionsList.join('')}</ol>` : ''
}

// -------------------------------------------------

function renderPredictionsListItem(prediction, word) {
  return `<li>${highlight(getLastWrittenPart(word), prediction)}</li>`
}

// -------------------------------------------------

function getLastWrittenPart(text) {
  return text.split(' ').splice(-1)[0]
}

// -------------------------------------------------
function highlight(keyword, text) {
  if (!keyword) {
    return text
  }
  const pattern = new RegExp('(' + keyword + ')', 'gi')
  return text.replace(pattern, `<span class='highlight'>${keyword}</span>`)
}

// -------------------------------------------------
