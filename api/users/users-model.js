const db = require('../../data/db-config')

/**
  resolves to an ARRAY with all users, each user having { user_id, username }
 */

async function find() {
  const rows = await db('users').select('user_id', 'username')
  return rows
}

/**
  resolves to an ARRAY with all users that match the filter condition
 */
async function findBy(username) {
  const [rows] = await db('users')
  .select('username','password', 'user_id')
  .where('username',username)
  return rows
}

/**
  resolves to the user { user_id, username } with the given user_id
 */
async function findById(user_id) {
  const rows = await db('users')
  .select('user_id', 'username')
  .where('user_id', user_id)
  return rows
}

/**
  resolves to the newly inserted user { user_id, username }
 */
async function add(user) {
  const newId = await db('users')
  .insert(user)
  const rows = await findById(newId)
  console.log(rows)
  return rows
}

// Don't forget to add these to the `exports` object so they can be required in other modules

module.exports = {
  find,
  findBy,
  findById,
  add
}