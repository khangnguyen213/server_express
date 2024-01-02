import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());

const studentSchema = {
  name: 'string',
  age: 'number',
  gender: 'boolean',
};

const validateRequestBody = (schema) => {
  return (req, res, next) => {
    const bodyProperties = Object.keys(req.body);
    const schemaProperties = Object.keys(schema);

    if (!req.body)
      return res.status(400).json({ error: 'Cần phải cung cấp dữ liệu' });

    if (
      bodyProperties.length !== schemaProperties.length ||
      !schemaProperties.every((prop) => bodyProperties.includes(prop))
    )
      return res.status(400).json({ error: 'Dữ liệu cung cấp không hợp lệ' });

    // Check if the values of the properties in the body match the types defined in the schema
    for (let prop in schema) {
      if (typeof req.body[prop] !== schema[prop]) {
        return res.status(400).json({
          error: `Kiểu dữ liệu cung cấp không hợp lệ - ${prop} phải là ${schema[prop]}`,
        });
      }
    }

    next();
  };
};

app.get('/students', (req, res) => {
  try {
    const students = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    let id = req.query.id;
    if (id) {
      res.status(200).json(
        students.find((student) => student.id == id) || {
          message: 'Không tìm thấy',
        }
      );
      return;
    }
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Unable to add student' });
  }
});

app.post('/students', validateRequestBody(studentSchema), (req, res) => {
  try {
    const students = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    let newstudent = {
      id: `stu${Math.ceil(Math.random() * 1000)}HCM24`,
      ...req.body,
    };
    students.push(newstudent);
    fs.writeFileSync('students.json', JSON.stringify(students));
    res.status(200).json(newstudent);
  } catch (error) {
    res.status(500).json({ error: 'Unable to add student' });
  }
});

app.delete('/students/:id', (req, res) => {
  try {
    const students = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    const idToDelete = req.params.id;
    const indexToDelete = students.findIndex(
      (student) => student.id == idToDelete
    );
    if (indexToDelete === -1) {
      res.status(404).json({ message: 'Không tìm thấy' });
      return;
    }
    students.splice(indexToDelete, 1);
    fs.writeFileSync('students.json', JSON.stringify(students));
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Unable to add student' });
  }
});

app.put('/students/:id', validateRequestBody(studentSchema), (req, res) => {
  try {
    const students = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    const idToPut = req.params.id;
    const newData = req.body;
    const indexToPut = students.findIndex((student) => student.id == idToPut);
    if (indexToPut === -1) {
      res.status(404).json({ message: 'Không tìm thấy' });
      return;
    }
    students[indexToPut] = { id: idToPut, ...newData };
    fs.writeFileSync('students.json', JSON.stringify(students));
    res.status(200).json(students[indexToPut]);
  } catch (error) {
    res.status(500).json({ error: 'Unable to add student' });
  }
});

app.patch('/students/:id', (req, res) => {
  try {
    const students = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    const idToPatch = req.params.id;
    const student = students.find((student) => student.id == idToPatch);
    for (let prop in req.body) {
      student[prop] = req.body[prop];
    }
    fs.writeFileSync('students.json', JSON.stringify(students));
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Unable to add student' });
  }
});

app.use('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server run at: http://127.0.0.1:3000');
});
