function sieve(max) {
  const arr = Array(max + 1).fill(true);
  arr[0] = arr[1] = false;

  for (let i = 2; i * i <= max; i++) {
    if (arr[i]) {
      for (let j = i * i; j <= max; j += i) {
        arr[j] = false;
      }
    }
  }

  return arr
    .map((v, i) => (v ? i : null))
    .filter(v => v !== null);
}

const primes = sieve(70000);
let S6_offset = 0;

function drawStage6(){
  const cx = 300;
  const cy = 150;

  wctx.fillStyle = "white";

  primes.forEach(v => {

    wctx.beginPath();
    const x = v * Math.cos(v + S6_offset);
    const y = v * Math.sin(v + S6_offset);
    wctx.arc(cx + x/200, cy + y/200, 1, 0, Math.PI * 2);
    wctx.fill();

  });

  S6_offset += 0.0002;
}
