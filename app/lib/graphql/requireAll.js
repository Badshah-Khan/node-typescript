import fs from "fs"
import { pathToFileURL } from 'url';

const requireAll = ({ dirname, filter, map }) => {
  const modules = {};

  function filterFile(filename) {
    if (typeof filter === 'function') {
      return filter(filename);
    }

    const match = filename.match(filter);
    if (!match) return;

    return match[1] || match[0];
  }
  
  const files = fs.readdirSync(dirname);
   files.forEach(file1 => {
    const filepath = dirname + '/' + file1;
    const filetwo = fs.readdirSync(filepath);
    modules[map(file1, filepath)] = {};
    filetwo.forEach(file2 =>{
      const filepath2 = filepath + '/' + file2;
      modules[file1][map(file2, filepath2)] = {};
      const file3 = fs.readdirSync(filepath2);
      file3.forEach(file =>{
        const name = filterFile(file);
        const filepath3 = filepath2 + '/' + file;
        import(pathToFileURL(filepath3)).then(filenew =>{
          modules[file1][file2][map(name, filepath3)] = filenew
        })
      })
    })
  });
  
  // console.log("fileToBeImported", fileToBeImported);
  return new Promise( (resolve, reject) => {
      setTimeout(() => {
        resolve(modules)
      }, 500);                          
  })
};

export default requireAll