const app = require('./src/server');
const port = 1337;

app.listen(port, () => {
    console.log(`> server started on port ${port}`);
});
