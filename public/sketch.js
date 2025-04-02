let capture;
let processing = false;
let spinnerAngle = 0;
let resultMessage = "";
let analyzeButton;

function setup() {
  createCanvas(640, 480);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();
  
  // Create a button to trigger analysis
  analyzeButton = createButton('Capture & Analyze');
  analyzeButton.position(10, height + 10);
  analyzeButton.mousePressed(captureAndAnalyze);
}

function draw() {
  background(220);
  image(capture, 0, 0, width, height);
  
  // Display a spinner if processing
  if (processing) {
    drawSpinner();
  }
  
  // Display the result message
  fill(255, 0, 0);
  textSize(32);
  textAlign(LEFT, TOP);
  if (resultMessage !== "") {
    text(resultMessage, 10, 10);
  }
}

function drawSpinner() {
  push();
  translate(width / 2, height / 2);
  stroke(0);
  strokeWeight(4);
  noFill();
  ellipse(0, 0, 50, 50);
  push();
  rotate(spinnerAngle);
  line(0, 0, 0, -25);
  pop();
  pop();
  spinnerAngle += 0.1;
}

function captureAndAnalyze() {
  if (processing) return;
  processing = true;
  resultMessage = "";
  
  // Capture the current frame as a Data URL
  let imgData = capture.canvas.toDataURL();
  
  // Send the image data to the backend
  fetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imgData })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        resultMessage = "Error: " + data.error;
      } else if (data.inflammatory) {
        resultMessage = "INFLAMMATORY";
      } else {
        resultMessage = "Not Inflammatory";
      }
      processing = false;
    })
    .catch(err => {
      console.error(err);
      resultMessage = "Error processing image";
      processing = false;
    });
}
