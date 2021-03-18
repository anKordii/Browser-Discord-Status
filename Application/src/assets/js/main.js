//--------------------------//
//    Przyciski Funkcyjne   //
//--------------------------//
document.getElementById('close-btn').addEventListener('click', (evt) => {
  evt.preventDefault()
  window.postMessage({
    type: 'close-app',
  })
})
document.getElementById('minimalize-btn').addEventListener('click', (evt) => {
  evt.preventDefault()
  window.postMessage({
    type: 'minimize-app',
  })
})
document.getElementById('enable-btn').addEventListener('click', (evt) => {
  evt.preventDefault()
  window.postMessage({
    type: 'enable-socket',
  })
})
document.getElementById('disable-btn').addEventListener('click', (evt) => {
  evt.preventDefault()
  window.postMessage({
    type: 'disable-socket',
  })
})