const express = require('express');
const app = express();

app.use(express.json());

let i = 0;
app.post('/', async function (req, res) {
  console.log(req.body);
  const rpcResponse = await fetch(process.env.OPTIMISM_RPC_URL, {
    method: "POST",
    body: JSON.stringify(req.body)
  });
  const data = await rpcResponse.json();
  console.log(data);
  res.status(rpcResponse.status);
  res.send(data);
  console.log(`processed request #${++i}`);
});

app.listen(3008);