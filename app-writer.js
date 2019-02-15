const predictions = document.getElementById('predictions')
const textInput = document.getElementById('text-input')
textInput.addEventListener('keyup', fetchPredictions)

// -------------------------------------------------
/**
 * fetch word predictions
 * @param event Object
 */
function fetchPredictions(event) {
  const writtenText = event.target.value
  const cors = 'https://cors-anywhere.herokuapp.com/'
  const URL = `${cors}https://services.lingapps.dk/misc/getPredictions?locale=en-GB&text=${writtenText}`
  fetch(URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer MjAxOS0wMi0wMQ==.dGVzdEBleGFtcGxlLmNvbQ==.MjExMWMyYjdjZGY3YTU3MmU4MTA5OWY0MDgyMmM0OTk=',
      Connection: 'Close',
      Host: 'services.lingapps.titan.wizkids.dk'
    }
  })
    .then(result => result.json())
    .then(predictionsArray => handlePredictions(predictionsArray, writtenText))
    .catch(console.error)
}

// -------------------------------------------------

function handlePredictions(predictionsArray, writtenText) {
  const firstTenPredictions = predictionsArray.slice(0, 10)
  const list = firstTenPredictions.map(prediction =>
    renderPredictionsListItem(prediction, writtenText))
  predictions.innerHTML = `<ol>${list.join('')}</ol>`
}

// -------------------------------------------------

function renderPredictionsListItem(prediction, writtenText) {
  return `<li>${highlight(writtenText, prediction)}</li>`
}

// -------------------------------------------------

function getLastWrittenPart(text) {
  return text.split(' ').splice(-1)[0]
}


// -------------------------------------------------
/**
 * highlight search word at result titles
 * @param {String} keyword
 * @param {String} text
 * @returns {String}
 */
function highlight(keyword, text) {
  if (!keyword) {
    return text
  }
  const pattern = new RegExp('(' + keyword + ')', 'gi')
  return text.replace(pattern, `<span class='highlight'>${keyword}</span>`)
}
