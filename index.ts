import express, { Application, Request, Response } from 'express';
import path from 'path';
const app: Application = express();
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(8080);
