import Hashids from 'hashids';

const salt = process.env.HASHIDS_SALT || 'supersecreto';
const minLength = 8;
const hashids = new Hashids(salt, minLength);

function encode(value) {
  return hashids.encode(value);
}

function decode(hash) {
  return hashids.decode(hash);
}

// CLI simple
const [,, action, input] = process.argv;
if (!action || !input) {
  console.log('Uso: node scripts/hashids.js encode <valor> | decode <hash>');
  process.exit(1);
}

if (action === 'encode') {
  console.log(encode(input));
} else if (action === 'decode') {
  console.log(decode(input));
} else {
  console.log('Acción no soportada. Usa encode o decode.');
}
