import express, { Application, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
interface Dataset {
  name: string;
  id: string;
  dependiences: string[];
  datas: {
    id: string;
    parents?: string[][];
    isBasic?: boolean;
    pathType: 'inline' | 'url';
    path: string;
    viewName: string;
  }[];
}
const app: Application = express();
let dataset: Dataset[] = <Dataset[]> JSON.parse(fs.readFileSync('./db/dataset.json').toString());
const GUID: Function = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).toUpperCase();
  });
};
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/datasetAPI/defaultDataset/:datasetname', (req: Request, res: Response) => {
  if(['base','name'].indexOf(<string> req.params.datasetname) == -1) return res.status(404).send('Not Found');
  res.sendFile(path.join(__dirname, 'assets', 'data', ['base.json','names.json'][['base','name'].indexOf(<string> req.params.datasetname)]));
});

app.get('/datasetAPI/dataset/:datasetid', (req: Request, res: Response) => {
  if(!dataset.find(d => d.id == req.params.datasetid)) res.status(404).send('Not Found');
  res.json(dataset.find(d => d.id == req.params.datasetid));
});

app.post('/datasetAPI/createDataset', (req: Request, res: Response) => {
  try {
    let body = JSON.parse(JSON.stringify(req.body));
    console.log(body);
    body.id = (Buffer.from(GUID()).toString('base64') + '.' + Buffer.from(((req.body.name.split('').map((l: string) => 
      l.charCodeAt(0)
    ).reduce((a: number, b: number) => 
      a + b
    ) * 5908966031136686) % 9999999999999999).toString(16).padStart(16,'0').toUpperCase()).toString('base64'));
    dataset.push(<Dataset> body);
    fs.writeFileSync('./db/dataset.json', JSON.stringify(dataset));
    res.json(dataset.find(d => d.id == body.id));
  } catch(e) {
    console.log(e);
    res.status(500).send('null');
  }
});

app.listen(8080, () => console.log('running'));
