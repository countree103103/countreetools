function sleep(msec) {
  return new Promise((r) => {
    setTimeout(() => {
      r();
    }, msec);
  });
}

async function main() {
  await sleep(3000);
  console.log(123);
}

main();
