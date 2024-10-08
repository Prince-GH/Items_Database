// script.js

const API_URL = 'https://items-database-1.onrender.com/api/items'

// DOM Elements
const itemForm = document.getElementById('item-form')
const nameInput = document.getElementById('name')
const quantityInput = document.getElementById('quantity')
let itemsTableBody = document.querySelector('tbody')

// Fetch and display items on page load
document.addEventListener('DOMContentLoaded', fetchAndDisplayItems)

// Handle form submission
itemForm.addEventListener('submit', addItem)

// Function to fetch and display items
function fetchAndDisplayItems () {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      itemsTableBody.innerHTML = ''
      data.forEach(item => {
        const row = createTableRow(item)
        itemsTableBody.appendChild(row)
      })
    })
    .catch(error => console.error('🌋Error fetching items:', error))
}

// Function to create a table row
function createTableRow (item) {
  const tr = document.createElement('tr')

  tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editItem(${item.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteItem(${item.id})">Delete</button>
      </td>
    `
  return tr
}

// Function to add a new item
function addItem (e) {
  e.preventDefault()
  const name = nameInput.value
  const quantity = parseInt(quantityInput.value)
  
  if (!name || !quantity) {
    console.log('Please provide valid name and quantity.')
    return
  }

  const newItem = { name, quantity }

  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newItem)
  })
    .then(response => response.json())
    .then(item => {
      const row = createTableRow(item)
      itemsTableBody.appendChild(row)
      itemForm.reset()
    })
    .catch(error => error('🌋 Error adding item:', error))
}

// Function to delete an item
function deleteItem (id) {
  if (!confirm('Are you sure you want to delete this item?')) return

  fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.ok) {
        // Remove the row from the table
        const row = document.querySelector(
          `tr td:first-child[textContent='${id}']`
        ).parentElement
        row.remove()
        fetchAndDisplayItems() // Refresh the table
      } else {
        return response.json().then(err => {
          throw err
        })
      }
    })
    .catch(error => console.error('Error deleting item:', error))
}

// Function to edit an item
function editItem (id) {
  // Fetch the current item data
  fetch(`${API_URL}`)
    .then(response => response.json())
    .then(data => {
      const item = data.find(item => item.id === id)
      if (!item) {
        alert('Item not found.')
        return
      }

      // Populate the form with current data
      nameInput.value = item.name
      quantityInput.value = item.quantity

      // Change form submission to update
      itemForm.removeEventListener('submit', addItem)
      itemForm.addEventListener('submit', function updateHandler (e) {
        e.preventDefault()

        const updatedName = nameInput.value.trim()
        const updatedQuantity = parseInt(quantityInput.value.trim())

        if (!updatedName || !updatedQuantity) {
          alert('Please provide valid name and quantity.')
          return
        }

        const updatedItem = { name: updatedName, quantity: updatedQuantity }

        fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedItem)
        })
          .then(response => response.json())
          .then(() => {
            fetchAndDisplayItems()
            itemForm.reset()

            // Restore the original form submission
            itemForm.removeEventListener('submit', updateHandler)
            itemForm.addEventListener('submit', addItem)
          })
          .catch(error => console.error('Error updating item:', error))
      })
    })
    .catch(error => console.error('Error fetching item for edit:', error))
}
