async function setup() {
  //
}

setup().catch((err) => {
  console.error('Error during setup:', err);
  process.exit(1);
});

module.exports = setup;
