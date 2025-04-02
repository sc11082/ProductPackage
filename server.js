// server.js
const express = require('express');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');
const app = express();
const port = process.env.PORT || 3000;

// Creates a client using your Google Cloud credentials.
// Ensure that your environment variable GOOGLE_APPLICATION_CREDENTIALS
// is set to the path of your service account JSON file.
const client = new vision.ImageAnnotatorClient();

// Serve static files from the "public" directory
app.use(express.static('public'));

// Increase the JSON body size limit to handle image data URLs
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/analyze', async (req, res) => {
  try {
    const imageBase64 = req.body.image; // image as a Data URL
    // Remove the header (e.g., "data:image/png;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Call Google Cloud Vision API for label detection
    const [result] = await client.labelDetection({ image: { content: imageBuffer } });
    const labels = result.labelAnnotations || [];
    
    // Create an array of label descriptions
    const descriptions = labels.map(label => label.description.toLowerCase());
    
    // Check for inflammatory items (adjust the list as needed)
    const inflammatoryItems = [
      'high fructose corn syrup',
      'trans fat',
      'sugar',
      'partially hydrogenated oil',
      'monosodium glutamate',
      'msg',
      'artificial flavors'
    ];
    
    let isInflammatory = false;
    inflammatoryItems.forEach(item => {
      descriptions.forEach(desc => {
        if (desc.includes(item)) {
          isInflammatory = true;
        }
      });
    });
    
    res.json({
      inflammatory: isInflammatory,
      labels: descriptions
    });
  } catch (error) {
    console.error("Error analyzing image: ", error);
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
