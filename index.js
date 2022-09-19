require('dotenv').config();
// Require express and body-parser
const express = require("express")
const bodyParser = require("body-parser")
// Initialize express and define a port
const app = express()
const PORT = 3000
const contentstack = require('@contentstack/management')
const jsonToHtml = require("@contentstack/json-rte-serializer")

contentstackClient = contentstack.client()
contentstackClient.login({ email: process.env.email, password: process.env.password })
app.use(bodyParser.json())
// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

app.use(bodyParser.json())
app.post("/", (req, res) => {
  console.log("Copying data");
  let schema = { "content_type": {} };
  schema.content_type = req.body.data;
  contentstackClient.stack({ api_key: process.env.substack_1_apikey }).contentType(schema.content_type.uid).fetch()
    .then((response) => {
      console.log("Updating content types")
      updateContentType(schema.content_type);
    })
    .catch(function (error) {
      if (error.errorCode === 118) {
        console.log("Creating content type");
        createContentType(JSON.parse(JSON.stringify(schema)));
      }
    })


  res.status(200).end() // Responding is important
})

app.get('/', function(req, res) {
  contentstackClient.stack({ api_key: process.env.substack_2_apikey }).contentType('blog_post').entry('blt30a76134e3c00cf0').fetch()
  .then((response) => {
    let json = response.json_rte;
    //const htmlValue = jsonToHtml(json);
    console.log(jsonToHtml.serialize(json));

  })
  .catch(function (error) {
      console.log(error);
  
  })
});

async function updateContentType(schema) {
  contentstackClient.stack({ api_key: process.env.substack_1_apikey }).contentType(schema.uid).fetch()
    .then((contentType) => {
      contentType.schema = schema.schema;
      return contentType.update()
    })
    .then((response) => { console.log(response) })
    .catch((error) => { console.log(error); })
}

async function createContentType(contentType) {
  let content_type = contentType.content_type;
  contentstackClient.stack({ api_key: process.env.substack_1_apikey }).contentType().create({ content_type })
    .then((contentType) => console.log(contentType))
    .catch((error) => { console.log(error) })
}