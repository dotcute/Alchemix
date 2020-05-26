import express, { Application, Request, Response } from 'express';
import path from 'path';
const app: Application = express();
app.use('/src', express.static(path.join(__dirname, 'src')));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/dataset/:datasetname', (req: Request, res: Response) => {
  if(['base','name'].indexOf(<string> req.params.datasetname) == -1) return res.status(404).send('Not Found');
  res.sendFile(path.join(__dirname, 'assets', 'data', ['base.json','names.json'][['base','name'].indexOf(<string> req.params.datasetname)]));
});

app.listen(8080);
