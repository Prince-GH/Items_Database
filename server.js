//server.js
require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const cors = require('cors')

//====================================
const app = express()
const PORT = process.env.PORT || 3000;

//====================================

//Middleware
app.use(bodyParser.json())
app.use(cors())

//======================================
//Path to json file
const Data_file = './items.json'

//Helper function to read data
const readData = () => {
  const jsonData = fs.readFileSync(Data_file, 'utf-8')
  return JSON.parse(jsonData)
}

//Helper function to write data
const writeData = data => {
  fs.writeFileSync(Data_file, JSON.stringify(data, null, 2), 'utf-8')
}
//===========================================

//=========================================
//GET all items
app.get('/api/items', (req, res) => {
  const items = readData()
  res.json(items)
})

//POST new items
app.post('/api/items', (req, res) => {
  const items = readData()
  const { name, quantity } = req.body

  // Auto-generate ID
  const id = items.length > 0 ? items[items.length - 1].id + 1 : 1

  const newItem = { id, name, quantity }
  items.push(newItem)
  writeData(items)
  res.status(201).json(newItem)
})

//PUT (Update) an item
app.put('/api/items/:id', (req, res) => {
  const items = readData()
  const itemId = parseInt(req.params.id)
  const { name, quantity } = req.body

  const itemIndex = items.findIndex(item => item.id === itemId)
 
  if (itemIndex !== -1) {
    items[itemIndex] = { id: itemId, name, quantity };
    writeData(items);
    res.json(items[itemIndex]);
  }else{
    res.status(404).send("Item not found");
  }
});

// DELETE an item

app.delete('/api/items/:id', (req, res) => {
    let items = readData();
    const itemId = parseInt(req.params.id);
    const initialLength = items.length;

    items = items.filter(item => item.id !== itemId);
    
    if(items.length !== initialLength){
        writeData(items);
        res.json({message:'Item deleted successfully'});
    }else{
        res.status(404).json({message:'Item not found'});
    }
})

//start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
